import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import vm from "node:vm";
import { createRequire } from "node:module";
import { appendPipelineLog, createRunId, writeRunLog } from "./enrichment/logging.mjs";
import { parseCandidateMarkdown, serializeCandidateMarkdown } from "./enrichment/markdown.mjs";
import {
  CHOICE_IDS,
  getApprovalGateErrors,
  isApprovalReviewed,
  normalizeForSimilarity,
  tokenOverlapScore,
  validateCandidate,
} from "./enrichment/quality.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const CRAWLED_DIR = path.join(PROJECT_ROOT, "docs", "enrichment", "crawled");
const VERIFIED_DIR = path.join(PROJECT_ROOT, "docs", "enrichment", "verified");
const QUESTIONS_FILE = path.join(PROJECT_ROOT, "src", "questions.ts");

function ensureDirs() {
  fs.mkdirSync(CRAWLED_DIR, { recursive: true });
  fs.mkdirSync(VERIFIED_DIR, { recursive: true });
}

function listCandidateFiles() {
  if (!fs.existsSync(CRAWLED_DIR)) return [];
  return fs
    .readdirSync(CRAWLED_DIR)
    .filter((file) => file.endsWith(".md") && file !== ".gitkeep")
    .sort();
}

function readCandidate(filepath) {
  return parseCandidateMarkdown(fs.readFileSync(filepath, "utf8"), filepath);
}

function writeCandidate(filepath, candidate) {
  fs.writeFileSync(filepath, serializeCandidateMarkdown(candidate), "utf8");
}

function askQuestion(rl, query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function validateWithContext(candidate, existingQuestions) {
  const validation = validateCandidate(candidate);
  const duplicateIssues = findDuplicateIssues(candidate, existingQuestions);
  validation.errors.push(...duplicateIssues.errors);
  validation.warnings.push(...duplicateIssues.warnings);
  return validation;
}

function findDuplicateIssues(candidate, existingQuestions) {
  const errors = [];
  const warnings = [];
  const normalizedPrompt = normalizeForSimilarity(candidate.prompt);
  if (!normalizedPrompt) return { errors, warnings };

  for (const question of existingQuestions) {
    const existingPrompt = question.prompt ?? "";
    const normalizedExisting = normalizeForSimilarity(existingPrompt);
    if (!normalizedExisting) continue;

    if (normalizedPrompt === normalizedExisting) {
      errors.push(`Exact duplicate prompt matches existing question ${question.id}.`);
      continue;
    }

    const overlap = tokenOverlapScore(candidate.prompt, existingPrompt);
    if (overlap >= 0.9) {
      errors.push(
        `Likely duplicate prompt overlaps existing question ${question.id} at ${overlap.toFixed(2)}.`
      );
    } else if (overlap >= 0.75) {
      warnings.push(
        `Possible near-duplicate prompt overlaps existing question ${question.id} at ${overlap.toFixed(2)}.`
      );
    }
  }

  return { errors, warnings };
}

function printCandidate(candidate, validation) {
  if (validation.errors.length > 0) {
    console.log("\x1b[31m[ERRORS]\x1b[0m");
    validation.errors.forEach((error) => console.log(`- ${error}`));
  } else {
    console.log("\x1b[32m[SCHEMA OK]\x1b[0m");
  }

  if (validation.warnings.length > 0) {
    console.log("\x1b[33m[WARNINGS]\x1b[0m");
    validation.warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  console.log("\n--------------------------------------------------");
  console.log(`Status: ${candidate.frontmatter.status}`);
  console.log(`Topic: ${candidate.frontmatter.topic} | Difficulty: ${candidate.frontmatter.difficulty}`);
  console.log(`Correct Answer: ${candidate.frontmatter.correctChoiceId || "(missing)"}`);
  console.log(`Originality: ${candidate.frontmatter.originalityStatus}`);
  console.log(`Source: ${candidate.frontmatter.sourceTitle} (${candidate.frontmatter.sourceUrl})`);
  console.log("--------------------------------------------------");
  console.log(`Prompt:\n${candidate.prompt}\n`);
  console.log("Choices:");
  for (const choiceId of CHOICE_IDS) {
    const marker = choiceId === candidate.frontmatter.correctChoiceId ? "[CORRECT]" : "         ";
    console.log(`${marker} Choice ${choiceId}: ${candidate.choices[choiceId]}`);
  }
  console.log(`\nExplanation:\n${candidate.explanation}`);
  console.log(`\nVerification Notes:\n${candidate.verificationNotes}`);
  console.log("--------------------------------------------------");
}

async function approveCandidate({ candidate, filepath, file, rl, validation }) {
  if (validation.errors.length > 0) {
    console.log("\n\x1b[31mCannot approve candidate with validation errors.\x1b[0m");
    await askQuestion(rl, "Press Enter to continue...");
    return false;
  }

  const approvalErrors = getApprovalGateErrors(candidate);
  if (approvalErrors.length > 0) {
    console.log("\n\x1b[31mCannot approve candidate until approval gates pass.\x1b[0m");
    approvalErrors.forEach((error) => console.log(`- ${error}`));
    await askQuestion(rl, "Press Enter to continue...");
    return false;
  }

  if (validation.warnings.length > 0) {
    const confirm = await askQuestion(
      rl,
      "\nWarnings are present. Type 'approve' to confirm you reviewed them: "
    );
    if (confirm.trim().toLowerCase() !== "approve") return false;
  }

  if (!candidate.frontmatter.reviewer) {
    candidate.frontmatter.reviewer = (await askQuestion(rl, "Reviewer name: ")).trim();
  }
  if (!candidate.frontmatter.reviewer) {
    console.log("\n\x1b[31mReviewer is required for approval.\x1b[0m");
    await askQuestion(rl, "Press Enter to continue...");
    return false;
  }

  candidate.frontmatter.reviewedAt ||= today();
  candidate.frontmatter.status = "approved";
  const verifiedPath = path.join(VERIFIED_DIR, file);
  writeCandidate(verifiedPath, candidate);
  fs.unlinkSync(filepath);
  console.log(`Approved and moved to verified/${file}`);
  return true;
}

async function runInteractiveMode(files, runId, existingQuestions) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const runLines = [`## Verify Summary`, `- Mode: interactive`];
  let approvedCount = 0;
  let rejectedCount = 0;
  let skippedCount = 0;

  console.log(`\nStarting interactive review of ${files.length} crawled candidate(s)...`);

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const filepath = path.join(CRAWLED_DIR, file);
    let isDone = false;

    while (!isDone) {
      console.clear();
      console.log(`=== Candidate ${index + 1}/${files.length} ===`);
      console.log(`File: ${file}\n`);

      let candidate;
      let validation;
      try {
        candidate = readCandidate(filepath);
        validation = validateWithContext(candidate, existingQuestions);
      } catch (error) {
        console.error(`Error parsing file: ${error.message}`);
        const action = (await askQuestion(rl, "\n[r] Reject/delete, [s] Skip, [e] Retry: "))
          .trim()
          .toLowerCase();
        if (action === "r") {
          fs.unlinkSync(filepath);
          rejectedCount += 1;
          runLines.push(`- ${file}: rejected due to parse error (${error.message}).`);
          isDone = true;
        } else if (action === "s") {
          skippedCount += 1;
          isDone = true;
        }
        continue;
      }

      printCandidate(candidate, validation);
      const action = (
        await askQuestion(
          rl,
          "\nOptions: [a] Approve, [r] Reject/delete, [s] Skip, [e] Reload after edit\nYour choice: "
        )
      )
        .trim()
        .toLowerCase();

      if (action === "a") {
        const approved = await approveCandidate({ candidate, filepath, file, rl, validation });
        if (approved) {
          approvedCount += 1;
          runLines.push(`- ${file}: approved by ${candidate.frontmatter.reviewer}.`);
          isDone = true;
        }
      } else if (action === "r") {
        fs.unlinkSync(filepath);
        rejectedCount += 1;
        runLines.push(`- ${file}: rejected/deleted by reviewer.`);
        isDone = true;
      } else if (action === "s") {
        skippedCount += 1;
        runLines.push(`- ${file}: skipped.`);
        isDone = true;
      } else if (action === "e") {
        console.log(`Reloading ${file}...`);
      }
    }
  }

  rl.close();
  writeSummary({ runId, mode: "Verify", files, approvedCount, rejectedCount, skippedCount, runLines });
  console.log(`\nReview finished. Approved: ${approvedCount}, Rejected: ${rejectedCount}, Skipped: ${skippedCount}`);
}

function runAutoMode(files, runId, existingQuestions) {
  const runLines = [`## Verify Summary`, `- Mode: auto`];
  let approvedCount = 0;
  let rejectedCount = 0;
  let skippedCount = 0;
  let stagedCount = 0;

  console.log(`\nStarting headless auto-verification of ${files.length} crawled candidate(s)...`);

  for (const file of files) {
    const filepath = path.join(CRAWLED_DIR, file);
    try {
      const candidate = readCandidate(filepath);
      const validation = validateWithContext(candidate, existingQuestions);
      const approvalErrors = getApprovalGateErrors(candidate);

      if (validation.errors.length > 0 || validation.warnings.length > 0) {
        skippedCount += 1;
        const issues = [...validation.errors, ...validation.warnings];
        runLines.push(`- ${file}: skipped (${issues.join("; ")}).`);
        console.log(`Skipped: ${file}`);
        issues.forEach((issue) => console.log(`  - ${issue}`));
        continue;
      }

      if (isApprovalReviewed(candidate) && approvalErrors.length === 0) {
        candidate.frontmatter.status = "approved";
        const verifiedPath = path.join(VERIFIED_DIR, file);
        writeCandidate(verifiedPath, candidate);
        fs.unlinkSync(filepath);
        approvedCount += 1;
        runLines.push(`- ${file}: approved because reviewer metadata was already present.`);
        console.log(`Auto-approved reviewed candidate: ${file}`);
        continue;
      }

      candidate.frontmatter.status = "schema_valid";
      writeCandidate(filepath, candidate);
      stagedCount += 1;
      runLines.push(
        `- ${file}: schema_valid, not approved (${approvalErrors.join("; ") || "missing reviewer metadata"}).`
      );
      console.log(`Staged schema_valid, awaiting manual approval: ${file}`);
    } catch (error) {
      skippedCount += 1;
      runLines.push(`- ${file}: parse error (${error.message}).`);
      console.warn(`Error parsing ${file}: ${error.message}`);
    }
  }

  writeSummary({ runId, mode: "Verify", files, approvedCount, rejectedCount, skippedCount, stagedCount, runLines });
  console.log(
    `\nAuto-verify finished. Approved: ${approvedCount}, Schema-valid staged: ${stagedCount}, Skipped: ${skippedCount}`
  );
}

function writeSummary({
  runId,
  mode,
  files,
  approvedCount,
  rejectedCount,
  skippedCount,
  stagedCount = 0,
  runLines,
}) {
  appendPipelineLog({
    projectRoot: PROJECT_ROOT,
    row: {
      date: today(),
      runId,
      action: mode,
      websitesTouched: 0,
      candidatesCrawled: 0,
      candidatesStaged: stagedCount,
      approved: approvedCount,
      rejected: rejectedCount,
      imported: 0,
      totalQuestions: countQuestions(),
      notes: `Verified ${files.length} candidate(s). Skipped: ${skippedCount}.`,
    },
  });
  writeRunLog({
    projectRoot: PROJECT_ROOT,
    runId,
    lines: [
      ...runLines,
      "",
      `- Candidates inspected: ${files.length}`,
      `- Schema-valid staged: ${stagedCount}`,
      `- Approved: ${approvedCount}`,
      `- Rejected: ${rejectedCount}`,
      `- Skipped: ${skippedCount}`,
    ],
  });
}

function countQuestions() {
  const questionsFile = path.join(PROJECT_ROOT, "src", "questions.ts");
  if (!fs.existsSync(questionsFile)) return "(unknown)";
  return (fs.readFileSync(questionsFile, "utf8").match(/id:\s*"[a-z]+-\d+"/g) || []).length;
}

function loadExistingQuestions() {
  const source = fs.readFileSync(QUESTIONS_FILE, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: QUESTIONS_FILE,
  });

  const commonExports = {};
  const sandbox = {
    exports: commonExports,
    module: { exports: commonExports },
    console: {
      warn() {},
      log() {},
    },
    require() {
      return {};
    },
  };

  vm.runInNewContext(transpiled.outputText, sandbox, { filename: QUESTIONS_FILE });
  return Array.isArray(sandbox.module.exports.QUESTIONS) ? sandbox.module.exports.QUESTIONS : [];
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function main() {
  ensureDirs();
  const runId = createRunId();
  const files = listCandidateFiles();
  const isAuto = process.argv.includes("--auto");
  const existingQuestions = loadExistingQuestions();

  if (files.length === 0) {
    const runLines = [`## Verify Summary`, `- Mode: ${isAuto ? "auto" : "interactive"}`, "- No crawled candidates to verify."];
    writeSummary({
      runId,
      mode: "Verify",
      files,
      approvedCount: 0,
      rejectedCount: 0,
      skippedCount: 0,
      stagedCount: 0,
      runLines,
    });
    console.log("No crawled questions to verify.");
    return;
  }

  if (isAuto) {
    runAutoMode(files, runId, existingQuestions);
  } else {
    runInteractiveMode(files, runId, existingQuestions);
  }
}

main();
