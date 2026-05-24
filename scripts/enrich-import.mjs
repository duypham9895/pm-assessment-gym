import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { appendPipelineLog, createRunId, writeRunLog } from "./enrichment/logging.mjs";
import { parseCandidateMarkdown, serializeCandidateMarkdown } from "./enrichment/markdown.mjs";
import {
  CHOICE_IDS,
  getApprovalGateErrors,
  normalizeForSimilarity,
  tokenOverlapScore,
  validateCandidate,
} from "./enrichment/quality.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const VERIFIED_DIR = path.join(PROJECT_ROOT, "docs", "enrichment", "verified");
const IMPORTED_DIR = path.join(PROJECT_ROOT, "docs", "enrichment", "imported");
const QUESTIONS_FILE = path.join(PROJECT_ROOT, "src", "questions.ts");
const PIPELINE_LOG_FILE = path.join(PROJECT_ROOT, "docs", "enrichment", "pipeline_log.md");

const TOPIC_PREFIXES = {
  product_analytics: "pa",
  data_literacy: "dl",
  chart_interpretation: "ci",
  inductive_reasoning: "ir",
  data_interpretation: "di",
  ab_testing: "ab",
};

function ensureDirs() {
  fs.mkdirSync(VERIFIED_DIR, { recursive: true });
  fs.mkdirSync(IMPORTED_DIR, { recursive: true });
}

function listVerifiedFiles() {
  return fs
    .readdirSync(VERIFIED_DIR)
    .filter((file) => file.endsWith(".md") && file !== ".gitkeep")
    .sort();
}

function readCandidate(file) {
  const filepath = path.join(VERIFIED_DIR, file);
  return {
    file,
    filepath,
    candidate: parseCandidateMarkdown(fs.readFileSync(filepath, "utf8"), filepath),
  };
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

function findMaxIds(questions) {
  const maxIds = Object.fromEntries(Object.values(TOPIC_PREFIXES).map((prefix) => [prefix, 0]));
  for (const question of questions) {
    const match = String(question.id).match(/^([a-z]+)-(\d+)$/);
    if (!match) continue;
    const [, prefix, number] = match;
    if (maxIds[prefix] !== undefined) {
      maxIds[prefix] = Math.max(maxIds[prefix], Number(number));
    }
  }
  return maxIds;
}

function selectEligibleCandidates(items, existingQuestions) {
  const eligible = [];
  const skipped = [];
  const acceptedPrompts = [];

  for (const item of items) {
    const { file, candidate } = item;
    const reasons = [];
    const validation = validateCandidate(candidate);
    const approvalErrors = getApprovalGateErrors(candidate);

    reasons.push(...validation.errors);
    reasons.push(...validation.warnings.map((warning) => `Warning blocks import: ${warning}`));
    reasons.push(...approvalErrors);

    if (candidate.frontmatter.status !== "approved") {
      reasons.push(`status must be approved, found ${candidate.frontmatter.status || "(missing)"}.`);
    }

    if (!["original", "permitted"].includes(candidate.frontmatter.originalityStatus)) {
      reasons.push("originalityStatus must be original or permitted.");
    }

    if (!candidate.frontmatter.reviewedAt || !candidate.frontmatter.reviewer) {
      reasons.push("reviewedAt and reviewer are required.");
    }

    const duplicateIssues = findDuplicateIssues(candidate, [...existingQuestions, ...acceptedPrompts]);
    reasons.push(...duplicateIssues);

    if (reasons.length > 0) {
      skipped.push({ file, reasons });
      continue;
    }

    eligible.push(item);
    acceptedPrompts.push({
      id: `pending:${file}`,
      prompt: candidate.prompt,
    });
  }

  return { eligible, skipped };
}

function findDuplicateIssues(candidate, questions) {
  const issues = [];
  const normalizedPrompt = normalizeForSimilarity(candidate.prompt);
  for (const question of questions) {
    const existingPrompt = question.prompt ?? "";
    const normalizedExisting = normalizeForSimilarity(existingPrompt);
    if (!normalizedExisting) continue;
    if (normalizedPrompt === normalizedExisting) {
      issues.push(`Exact duplicate prompt matches ${question.id}.`);
      continue;
    }
    const overlap = tokenOverlapScore(candidate.prompt, existingPrompt);
    if (overlap >= 0.9) {
      issues.push(`Likely duplicate prompt overlaps ${question.id} at ${overlap.toFixed(2)}.`);
    }
  }
  return issues;
}

function sortForAnswerBalance(items, existingQuestions) {
  const counts = countCorrectLetters(existingQuestions);
  return [...items].sort((a, b) => {
    const aLetter = a.candidate.frontmatter.correctChoiceId;
    const bLetter = b.candidate.frontmatter.correctChoiceId;
    return counts[aLetter] - counts[bLetter] || a.file.localeCompare(b.file);
  });
}

function assertAnswerBalance(items, existingQuestions) {
  const counts = countCorrectLetters(existingQuestions);
  for (const item of items) {
    counts[item.candidate.frontmatter.correctChoiceId] += 1;
  }

  const expected = (existingQuestions.length + items.length) / CHOICE_IDS.length;
  const imbalanced = CHOICE_IDS.filter((choiceId) => Math.abs(counts[choiceId] - expected) > 1);
  if (imbalanced.length === 0) return;

  const countsText = CHOICE_IDS.map((choiceId) => `${choiceId}: ${counts[choiceId]}`).join(", ");
  throw new Error(
    `Import would make answer letters more than one away from expected ${expected.toFixed(
      2
    )}. Counts after import: ${countsText}. Edit approved candidates' correctChoiceId distribution before importing.`
  );
}

function countCorrectLetters(questions) {
  const counts = Object.fromEntries(CHOICE_IDS.map((choiceId) => [choiceId, 0]));
  for (const question of questions) {
    if (counts[question.correctChoiceId] !== undefined) {
      counts[question.correctChoiceId] += 1;
    }
  }
  return counts;
}

function prepareImportBlocks(items, existingQuestions) {
  const maxIds = findMaxIds(existingQuestions);
  return items.map((item) => {
    const { candidate } = item;
    const prefix = TOPIC_PREFIXES[candidate.frontmatter.topic];
    if (!prefix) {
      throw new Error(`Unknown topic prefix for ${candidate.frontmatter.topic} in ${item.file}.`);
    }

    maxIds[prefix] += 1;
    const id = `${prefix}-${String(maxIds[prefix]).padStart(3, "0")}`;
    candidate.frontmatter.id = id;
    return {
      ...item,
      id,
      block: makeQuestionBlock(candidate, id),
    };
  });
}

function makeQuestionBlock(candidate, id) {
  return `  makeQuestion({
    id: "${id}",
    topic: "${candidate.frontmatter.topic}",
    difficulty: "${candidate.frontmatter.difficulty}",
    prompt: ${JSON.stringify(candidate.prompt)},
    choices: {
      A: ${JSON.stringify(candidate.choices.A)},
      B: ${JSON.stringify(candidate.choices.B)},
      C: ${JSON.stringify(candidate.choices.C)},
      D: ${JSON.stringify(candidate.choices.D)},
      E: ${JSON.stringify(candidate.choices.E)},
    },
    correctChoiceId: "${candidate.frontmatter.correctChoiceId}",
    explanation: ${JSON.stringify(candidate.explanation)},
    conceptTags: ${JSON.stringify(candidate.frontmatter.conceptTags)},
    estimatedSeconds: ${candidate.frontmatter.estimatedSeconds},
  }),`;
}

function insertQuestions(imports) {
  const content = fs.readFileSync(QUESTIONS_FILE, "utf8");
  const targetPattern =
    /];\s*\n\s*export\s+const\s+QUESTIONS:\s*Question\[\]\s*=\s*\[\s*\.\.\.SEED_QUESTIONS\s*,\s*\.\.\.EXPANDED_QUESTIONS\s*\];/;
  if (!targetPattern.test(content)) {
    throw new Error("Could not find EXPANDED_QUESTIONS insertion point in src/questions.ts.");
  }
  const insertion = `\n${imports.map((item) => item.block).join("\n")}\n];\n\nexport const QUESTIONS: Question[] = [...SEED_QUESTIONS, ...EXPANDED_QUESTIONS];`;
  fs.writeFileSync(QUESTIONS_FILE, content.replace(targetPattern, insertion), "utf8");
}

function archiveImportedMarkdown(imports) {
  const importedAt = today();
  for (const item of imports) {
    item.candidate.frontmatter.status = "imported";
    item.candidate.frontmatter.importedAt = importedAt;
    item.candidate.frontmatter.appQuestionId = item.id;
    const importedPath = path.join(IMPORTED_DIR, item.file);
    fs.writeFileSync(importedPath, serializeCandidateMarkdown(item.candidate), "utf8");
    fs.unlinkSync(item.filepath);
    item.importedPath = importedPath;
  }
}

function snapshotFiles(imports) {
  const importedPaths = imports.map((item) => path.join(IMPORTED_DIR, item.file));
  return {
    questions: fs.readFileSync(QUESTIONS_FILE, "utf8"),
    pipelineLog: fs.existsSync(PIPELINE_LOG_FILE) ? fs.readFileSync(PIPELINE_LOG_FILE, "utf8") : null,
    verified: new Map(imports.map((item) => [item.filepath, fs.readFileSync(item.filepath, "utf8")])),
    imported: new Map(
      importedPaths.map((filepath) => [
        filepath,
        fs.existsSync(filepath) ? fs.readFileSync(filepath, "utf8") : null,
      ])
    ),
  };
}

function rollback(snapshot) {
  fs.writeFileSync(QUESTIONS_FILE, snapshot.questions, "utf8");
  if (snapshot.pipelineLog === null) {
    if (fs.existsSync(PIPELINE_LOG_FILE)) fs.unlinkSync(PIPELINE_LOG_FILE);
  } else {
    fs.writeFileSync(PIPELINE_LOG_FILE, snapshot.pipelineLog, "utf8");
  }

  for (const [filepath, content] of snapshot.verified) {
    fs.writeFileSync(filepath, content, "utf8");
  }

  for (const [filepath, content] of snapshot.imported) {
    if (content === null) {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    } else {
      fs.writeFileSync(filepath, content, "utf8");
    }
  }
}

function runFullVerification() {
  execSync("npm run validate:questions", { cwd: PROJECT_ROOT, stdio: "inherit" });
  execSync("npm run test", { cwd: PROJECT_ROOT, stdio: "inherit" });
  execSync("npm run build", { cwd: PROJECT_ROOT, stdio: "inherit" });
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function main() {
  ensureDirs();
  const runId = createRunId();
  const files = listVerifiedFiles();
  if (files.length === 0) {
    console.log("No verified Markdown candidates found.");
    return;
  }

  const existingQuestions = loadExistingQuestions();
  const items = files.map(readCandidate);
  const { eligible, skipped } = selectEligibleCandidates(items, existingQuestions);
  const sortedEligible = sortForAnswerBalance(eligible, existingQuestions);

  if (skipped.length > 0) {
    console.log("Skipped ineligible verified candidate(s):");
    for (const item of skipped) {
      console.log(`- ${item.file}`);
      item.reasons.forEach((reason) => console.log(`  - ${reason}`));
    }
  }

  if (sortedEligible.length === 0) {
    console.log("No approved, reviewed, original/permitted candidates are eligible for import.");
    return;
  }

  assertAnswerBalance(sortedEligible, existingQuestions);
  const imports = prepareImportBlocks(sortedEligible, existingQuestions);
  const snapshot = snapshotFiles(imports);

  try {
    insertQuestions(imports);
    console.log(`Inserted ${imports.length} candidate(s) into src/questions.ts. Running gates...`);
    runFullVerification();
    archiveImportedMarkdown(imports);

    appendPipelineLog({
      projectRoot: PROJECT_ROOT,
      row: {
        date: today(),
        runId,
        action: "Import",
        websitesTouched: 0,
        candidatesCrawled: 0,
        candidatesStaged: 0,
        approved: 0,
        rejected: 0,
        imported: imports.length,
        totalQuestions: existingQuestions.length + imports.length,
        notes: `Imported ${imports.length} approved Markdown candidate(s). Skipped ${skipped.length}.`,
      },
    });
    writeRunLog({
      projectRoot: PROJECT_ROOT,
      runId,
      lines: [
        "## Import Summary",
        ...imports.map((item) => `- Imported ${item.file} as ${item.id}.`),
        ...skipped.map((item) => `- Skipped ${item.file}: ${item.reasons.join("; ")}`),
      ],
    });
    console.log(`Import completed. Imported ${imports.length} candidate(s).`);
  } catch (error) {
    console.error(`Import failed: ${error.message}`);
    rollback(snapshot);
    console.error("Rollback completed.");
    process.exit(1);
  }
}

main();
