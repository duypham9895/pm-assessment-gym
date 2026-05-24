import fs from "node:fs";
import path from "node:path";
import { createRunId, appendPipelineLog, writeRunLog } from "./enrichment/logging.mjs";
import { serializeCandidateMarkdown } from "./enrichment/markdown.mjs";
import {
  METADATA_ONLY_POLICIES,
  STORE_TEXT_POLICIES,
  parseSourceRegistry,
} from "./enrichment/source-registry.mjs";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const RAW_DIR = path.join(PROJECT_ROOT, "docs", "enrichment", "raw");
const CRAWLED_DIR = path.join(PROJECT_ROOT, "docs", "enrichment", "crawled");
const SOURCE_NOTES_DIR = path.join(CRAWLED_DIR, "source-notes");
const REGISTRY_FILE = path.join(PROJECT_ROOT, "docs", "enrichment", "source_registry.md");
const QUESTIONS_FILE = path.join(PROJECT_ROOT, "src", "questions.ts");
const CHOICE_IDS = ["A", "B", "C", "D", "E"];

function canStoreQuestionText(source) {
  return STORE_TEXT_POLICIES.has(source.harvestPolicy);
}

function shouldWriteSourceNote(source) {
  return METADATA_ONLY_POLICIES.has(source.harvestPolicy) || canStoreQuestionText(source);
}

function ensureDirs() {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(CRAWLED_DIR, { recursive: true });
  fs.mkdirSync(SOURCE_NOTES_DIR, { recursive: true });
}

function cleanHtml(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<(p|div|li|h1|h2|h3|h4|h5|h6|br|tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n");
}

function inferTopic(text) {
  const lower = text.toLowerCase();
  if (/\bab test\b|\bsplit test\b|statistical significance|p-value|experiment/.test(lower)) {
    return "ab_testing";
  }
  if (/\bchart\b|\bgraph\b|\baxis\b|trendline|visualization/.test(lower)) {
    return "chart_interpretation";
  }
  if (/correlation|causation|outlier|confidence interval|sample size|base rate/.test(lower)) {
    return "data_literacy";
  }
  if (/table|cohort|retention table|segment|csv|dataset/.test(lower)) {
    return "data_interpretation";
  }
  if (/reasoning|logic|pattern|deduct|sequence/.test(lower)) {
    return "inductive_reasoning";
  }
  return "product_analytics";
}

function parseQuestionText(text, source) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.split(/\n\s*(?=(?:\d+[\).]|\bQuestion\s+\d+[:.)]?))/gi);
  const questions = [];

  for (const block of blocks) {
    const candidate = parseQuestionBlock(block);
    if (!candidate) continue;

    const correctChoiceId = extractCorrectChoice(block);
    const status = correctChoiceId ? "crawled" : "needs_answer_key";
    const explanation = extractExplanation(block);
    const promptAndChoices = [candidate.prompt, ...Object.values(candidate.choices)].join(" ");
    questions.push({
      frontmatter: {
        schemaVersion: 1,
        status,
        sourceUrl: source.url,
        sourceTitle: source.title,
        sourceType: source.type,
        harvestPolicy: source.harvestPolicy,
        permissionNote: source.permissionNote,
        extractionMethod: source.extractionMethod,
        crawledAt: today(),
        reviewedAt: "",
        reviewer: "",
        originalityStatus: "needs_rewrite",
        topic: inferTopic(promptAndChoices),
        difficulty: "medium",
        correctChoiceId,
        estimatedSeconds: 90,
        conceptTags: ["manual-review"],
      },
      prompt: candidate.prompt,
      choices: candidate.choices,
      explanation,
      verificationNotes: [
        `- Answer evidence: ${correctChoiceId ? "Extracted from source text; reviewer must verify." : ""}`,
        "- Originality notes: Needs rewrite before import.",
        "- Reviewer decision: pending",
      ].join("\n"),
    });
  }

  return questions;
}

function parseQuestionBlock(block) {
  if (!block.trim()) return null;
  const markerRegex = /(?:^|\n)\s*(?:Choice\s+)?([A-E])\s*[\).:-]\s*/gi;
  const markers = [...block.matchAll(markerRegex)];
  if (markers.length < 5 || markers[0][1].toUpperCase() !== "A") return null;

  const prompt = block
    .slice(0, markers[0].index)
    .replace(/^\s*(?:\d+[\).]\s*|\bQuestion\s+\d+[:.)]?\s*)/i, "")
    .trim();
  if (prompt.length < 20) return null;

  const choices = {};
  for (let index = 0; index < CHOICE_IDS.length; index += 1) {
    const id = CHOICE_IDS[index];
    const marker = markers.find((match) => match[1].toUpperCase() === id);
    const nextMarker = markers.find((match) => match[1].toUpperCase() === CHOICE_IDS[index + 1]);
    if (!marker) return null;
    choices[id] = block
      .slice(marker.index + marker[0].length, nextMarker ? nextMarker.index : block.length)
      .replace(/\b(?:Correct\s+Answer|Answer|Key|Correct\s+Choice|Explanation|Rationale)\b[\s\S]*$/i, "")
      .trim();
  }

  if (CHOICE_IDS.some((id) => !choices[id])) return null;
  return { prompt, choices };
}

function extractCorrectChoice(block) {
  const answerMatch = block.match(
    /(?:Correct\s+Answer|Answer|Key|Correct\s+Choice)\s*[:.-]?\s*([A-E])\b/i
  );
  return answerMatch ? answerMatch[1].toUpperCase() : "";
}

function extractExplanation(block) {
  const explanationMatch = block.match(/(?:Explanation|Rationale|Why)\s*[:.-]?\s*([\s\S]*)$/i);
  return explanationMatch ? explanationMatch[1].trim() : "";
}

function writeCandidates(candidates, sourceId) {
  let count = 0;
  for (const candidate of candidates) {
    count += 1;
    const filename = `${createRunId()}_${slugify(sourceId)}_${String(count).padStart(3, "0")}.md`;
    const filepath = path.join(CRAWLED_DIR, filename);
    fs.writeFileSync(filepath, serializeCandidateMarkdown(candidate), "utf8");
  }
  return count;
}

function writeSourceNote({ source, runId, fetchResult }) {
  if (!shouldWriteSourceNote(source)) return null;

  const filepath = path.join(SOURCE_NOTES_DIR, `${runId}_${slugify(source.id)}.md`);
  const title = fetchResult.title || source.source;
  const statusLine = fetchResult.ok
    ? `Fetched ${fetchResult.status} ${fetchResult.statusText}`.trim()
    : `Fetch failed: ${fetchResult.error}`;
  const content = `---
schemaVersion: 1
artifactType: source_note
status: discovered
sourceId: ${source.id}
sourceUrl: "${source.url}"
sourceTitle: "${title}"
sourceType: "external_source"
harvestPolicy: "${source.harvestPolicy}"
fit: "${source.fit}"
crawledAt: "${today()}"
---

# ${title}

- Harvest policy: ${source.harvestPolicy}
- Registry status: ${source.status}
- Topic signals: ${source.topicSignals.join(", ")}
- Fetch result: ${statusLine}
- Content type: ${fetchResult.contentType || "unknown"}
- Permission note: ${source.notes}

# Source Notes

Use this source for assessment pattern, taxonomy, timing, or rubric calibration according to its harvest policy. Do not import question text unless explicit permission and human review gates are satisfied.
`;
  fs.writeFileSync(filepath, content, "utf8");
  return filepath;
}

async function crawlRegistrySources(runId, runLines) {
  if (!fs.existsSync(REGISTRY_FILE)) {
    throw new Error("Missing docs/enrichment/source_registry.md");
  }

  const sources = parseSourceRegistry(fs.readFileSync(REGISTRY_FILE, "utf8"));
  let websitesTouched = 0;
  let candidatesCrawled = 0;
  let sourceNotes = 0;

  for (const source of sources) {
    if (!source.canFetch) {
      runLines.push(`- Skipped ${source.id}: registry status ${source.status} is not fetchable.`);
      continue;
    }

    websitesTouched += 1;
    const fetchResult = await fetchSource(source);
    const notePath = writeSourceNote({ source, runId, fetchResult });
    if (notePath) sourceNotes += 1;

    if (!fetchResult.ok) {
      runLines.push(`- ${source.id}: fetch failed (${fetchResult.error}).`);
      continue;
    }

    if (!canStoreQuestionText(source)) {
      runLines.push(`- ${source.id}: wrote source note only for policy ${source.harvestPolicy}.`);
      continue;
    }

    const questions = parseQuestionText(fetchResult.text, {
      url: source.url,
      title: source.source,
      type: "external_source",
      harvestPolicy: source.harvestPolicy,
      permissionNote: source.notes,
      extractionMethod: "registry_fetch",
    });
    const written = writeCandidates(questions, source.id);
    candidatesCrawled += written;
    runLines.push(`- ${source.id}: wrote source note and ${written} candidate(s).`);
  }

  return { websitesTouched, candidatesCrawled, sourceNotes };
}

async function fetchSource(source) {
  try {
    const response = await fetch(source.url, {
      headers: { "user-agent": "pm-assessment-gym-enrichment/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    const contentType = response.headers.get("content-type") || "";
    const isText = /text|json|xml|html/.test(contentType) || source.url.endsWith(".txt");
    const rawText = isText ? await response.text() : "";
    const text = contentType.includes("html") ? cleanHtml(rawText) : rawText;
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType,
      title: extractTitle(rawText),
      text,
      error: response.ok ? "" : `${response.status} ${response.statusText}`,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: "",
      contentType: "",
      title: "",
      text: "",
      error: error.message,
    };
  }
}

function ingestRawFolder(runLines) {
  if (!fs.existsSync(RAW_DIR)) return 0;

  let candidatesCrawled = 0;
  const files = fs
    .readdirSync(RAW_DIR)
    .filter((file) => file !== ".gitkeep" && !file.endsWith(".processed"))
    .sort();

  for (const file of files) {
    const filepath = path.join(RAW_DIR, file);
    if (!fs.statSync(filepath).isFile()) continue;

    try {
      const raw = fs.readFileSync(filepath, "utf8");
      const text = /\.(html|htm)$/i.test(file) ? cleanHtml(raw) : raw;
      const questions = parseQuestionText(text, {
        url: `raw/${file}`,
        title: file,
        type: "manual_raw",
        harvestPolicy: "manual_review_only",
        permissionNote: "Manual raw input; reviewer must confirm permission, answer evidence, and originality before approval.",
        extractionMethod: "manual_raw",
      });

      if (questions.length === 0) {
        runLines.push(`- raw/${file}: no candidate-shaped question blocks found; raw file preserved.`);
        continue;
      }

      const written = writeCandidates(questions, `raw-${file}`);
      fs.copyFileSync(filepath, `${filepath}.processed`);
      candidatesCrawled += written;
      runLines.push(`- raw/${file}: wrote ${written} candidate(s) and copied ${file}.processed.`);
    } catch (error) {
      runLines.push(`- raw/${file}: ingestion failed (${error.message}).`);
    }
  }

  return candidatesCrawled;
}

function extractTitle(rawText) {
  const match = rawText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? cleanHtml(match[1]).replace(/\s+/g, " ").trim() : "";
}

function countQuestions() {
  if (!fs.existsSync(QUESTIONS_FILE)) return "(unknown)";
  const matches = fs.readFileSync(QUESTIONS_FILE, "utf8").match(/id:\s*"[a-z]+-\d+"/g) || [];
  return matches.length;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function main() {
  ensureDirs();
  const runId = createRunId();
  const runLines = ["## Crawl Summary"];

  console.log("Running registry-driven PM assessment discovery...");
  const registryStats = await crawlRegistrySources(runId, runLines);
  const rawCandidates = ingestRawFolder(runLines);
  const candidatesCrawled = registryStats.candidatesCrawled + rawCandidates;
  const totalQuestions = countQuestions();

  appendPipelineLog({
    projectRoot: PROJECT_ROOT,
    row: {
      date: today(),
      runId,
      action: "Crawl",
      websitesTouched: registryStats.websitesTouched,
      candidatesCrawled,
      candidatesStaged: candidatesCrawled,
      approved: 0,
      rejected: 0,
      imported: 0,
      totalQuestions,
      notes: `Discovery completed. Source notes: ${registryStats.sourceNotes}. Candidates staged in crawled/: ${candidatesCrawled}.`,
    },
  });

  const runLogPath = writeRunLog({
    projectRoot: PROJECT_ROOT,
    runId,
    lines: [
      ...runLines,
      "",
      `- Websites touched: ${registryStats.websitesTouched}`,
      `- Source notes written: ${registryStats.sourceNotes}`,
      `- Candidates crawled: ${candidatesCrawled}`,
      `- Total app questions before import: ${totalQuestions}`,
    ],
  });

  console.log(`Discovery complete. Candidates staged: ${candidatesCrawled}`);
  console.log(`Run log: ${path.relative(PROJECT_ROOT, runLogPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
