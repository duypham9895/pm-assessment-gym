# Dataset Enrichment Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a daily, Markdown-only enrichment pipeline that discovers Product Manager assessment/interview-practice sources, stages candidate question drafts, verifies schema, provenance, answer correctness, distractor quality, and originality, then imports only approved questions into `src/questions.ts`.

**Architecture:** Treat external websites as research and source-signal inputs, not as a blind copy source. A source registry drives crawling policy, crawled items become Markdown candidate files with provenance, verification produces explicit approve/reject decisions, and import remains a separate gated step that runs the app's validator, tests, and build before touching the question bank.

**Tech Stack:** Node.js ESM scripts, Markdown files with YAML-like frontmatter, Vitest, TypeScript, Vite, GitHub Actions, no database.

**Execution Note:** The repository currently has draft enrichment scripts and a daily workflow. The first implementation work must harden or pause that draft flow because automated import from crawled data is not trustworthy enough yet. Do not commit unless Edward explicitly asks.

---

## My Understanding

Edward wants the app to become better by learning from other PM assessment and interview-prep places on the internet. The important loop is:

- Find credible websites that expose PM assessment, PM analytical-thinking, metrics, experimentation, or product execution practice.
- Crawl or ingest only what is public and permitted.
- Store every intermediate artifact as Markdown inside this repo.
- Verify every candidate before it can become app content.
- Keep an audit log with websites touched, candidate pairs crawled, approved items, rejected items, imported items, and notes.
- Add approved content into the existing 120-question bank only after correctness and quality checks pass.
- Run the enrichment pipeline every day, but keep user trust higher than automation speed.

## Pushback

- A crawler cannot prove every answer is correct. It can prove structure, provenance, duplicates, weak distractors, timing, topic mapping, and whether an answer key exists. True correctness needs an evidence-backed answer key and human approval before import.
- Many assessment sites protect their real banks behind paywalls, logins, anti-bot measures, or explicit "non-googleable" language. The pipeline must not scrape gated/premium/private questions into the app.
- The daily job should discover and stage candidates automatically, but it should not auto-import new questions into `src/questions.ts` until the verification gates are strict and reviewed.
- The app should enrich with original, calibrated questions inspired by observed assessment patterns. It should not become a mirror of another site's proprietary question bank.

## Source Research Snapshot

Use this as the first `docs/enrichment/source_registry.md` seed. "Harvest policy" controls crawler behavior.

| Source | URL | Why It Matters | Harvest Policy | Initial Fit |
| --- | --- | --- | --- | --- |
| ProductCompass PM Skills Assessment | https://www.productcompass.pm/p/pm-skills-assessment-nov-2023?action=share | Open PM skills assessment focused on Data Analytics, Metrics, and Experimentation; claims 20 single-choice questions with answers/explanations after submission. | Manual review only; use as calibration and candidate source if copied content is clearly permitted. | High |
| Meta PM Interview Prep Guide | https://d3no4ktch0fdq4.cloudfront.net/public/course/files/Meta_PM_interview_guide.pdf | Official guide explains Product Sense and Analytical Thinking case-study format, hypothetical prompts, and metrics/results expectations. | Rubric and pattern extraction only; do not copy full guide text into questions. | High |
| IGotAnOffer Meta Analytical Thinking | https://igotanoffer.com/blogs/product-manager/facebook-execution-interview | Public guide with example analytical/data-focused prompt types and practice approach. | Pattern extraction and source notes; avoid verbatim copying. | High |
| IdeaPlan PM Interview Questions | https://www.ideaplan.io/interview-questions | Public timed mock-interview surface with Metrics & Analytics category and 200+ PM questions/model answers. | Crawl metadata and visible public prompts only if permitted; otherwise pattern notes. | Medium |
| Adaface Product Manager Test | https://www.adaface.com/assessment-test/product-manager-assessment-test | Assessment vendor with public preview, scenario-based PM test, skills/topics, and sample question preview. | Metadata/sample-preview only; avoid bulk copying because the vendor emphasizes protected non-googleable banks. | Medium |
| TestGorilla Product Management Test | https://www.testgorilla.com/test-library/role-specific-skills-tests/product-management-test/ | Assessment vendor with role-specific PM test, covered skills, timing, and preview-question link. | Metadata only unless preview terms allow storage. | Medium |
| Alooba Product Manager Tests | https://www.alooba.com/roles/product-manager/tests/ | Shows PM screening assessment variants, timing, difficulty, and skill taxonomy including Data Analysis. | Metadata and taxonomy only. | Medium |
| iMocha Product Manager Test | https://www.imocha.io/tests/product-manager-assessment-test | Assessment vendor with 20-minute/10-question PM test and topic coverage. | Metadata and taxonomy only. | Low-Medium |
| Productside Individual Skills Assessment | https://productside.com/individual-skills-assessment/ | Free PM diagnostic with 79 questions across 13 skill areas including analytical business skills and KPIs. | Metadata/taxonomy only unless assessment terms permit question storage. | Low-Medium |
| Serious Factory Product Manager Quiz | https://assessment.seriousfactory.com/en/categories/it-digital-transformation/roles/product-manager/ | Free 21-question product-manager skills quiz, but more general/project-management weighted than this app. | Metadata only; low priority for analytical PM question import. | Low |
| PMTestPro | https://pmtestpro.com/test | Directly positioned around PM assessments; fetch timed out during initial research and needs manual retry. | Needs manual source validation before allowlisting. | Unknown |
| Product Sandbox | https://sandbox4pm.com/pm-interview | PM interview simulator with analytics/scenario practice, but rendered as a JavaScript app. | Metadata only unless public API/terms permit. | Unknown |

## Quality Gates

Every candidate must pass these gates before import:

- Source gate: source exists in registry, has a harvest policy, last checked date, and no login/paywall/private-data requirement.
- Provenance gate: candidate records source URL, source title, crawl date, extraction method, and license/permission note.
- Schema gate: topic is one of `TOPIC_ORDER`, difficulty is `easy | medium | hard`, exactly five choices A-E exist, one correct answer exists, explanation exists, tags exist, and `estimatedSeconds` is 45-150.
- Correctness gate: answer is backed by source-provided answer/explanation or by human reviewer notes. Missing answer keys must block approval.
- Originality gate: candidates imported into `src/questions.ts` must be original or explicitly permitted. Verbatim proprietary copies are rejected.
- Content gate: PM scenario is concrete, explanation teaches the concept, distractors are plausible PM mistakes, and no weak throwaway distractors are present.
- Duplicate gate: candidate is not a near-duplicate of an existing `src/questions.ts` item or another pending Markdown candidate.
- Distribution gate: imports preserve minimum per-topic capacity, difficulty mix, answer-letter balance, and the current 21-question full mock behavior.
- Build gate: after import, `npm run validate:questions`, `npm run test`, and `npm run build` pass.

## File Structure

- Create: `docs/enrichment/source_registry.md` - source allowlist, policy, fit, topic coverage, and last-check notes.
- Create: `docs/enrichment/schema.md` - canonical Markdown candidate schema, status lifecycle, and reviewer checklist.
- Create: `docs/enrichment/logs/.gitkeep` - per-run logs by date/run id.
- Modify: `docs/enrichment/pipeline_log.md` - summary table across runs.
- Modify: `docs/enrichment/raw/` - preserve manual raw inputs and write processed copies instead of deleting source material.
- Modify: `docs/enrichment/crawled/` - crawler-created candidate Markdown files with `status: crawled`.
- Modify: `docs/enrichment/verified/` - reviewer-approved candidate Markdown files with `status: approved`.
- Modify: `docs/enrichment/imported/` - imported candidate archive with assigned app question IDs.
- Create: `scripts/enrichment/markdown.mjs` - frontmatter/body parsing and serialization.
- Create: `scripts/enrichment/source-registry.mjs` - read source registry and enforce harvest policies.
- Create: `scripts/enrichment/quality.mjs` - schema, correctness, duplicate, and distractor checks.
- Create: `scripts/enrichment/logging.mjs` - summary and per-run Markdown logging.
- Modify: `scripts/enrich-crawl.mjs` - replace demo crawler with registry-driven discovery and raw ingestion.
- Modify: `scripts/enrich-verify.mjs` - block auto-approval unless gates pass and reviewer approval exists where needed.
- Modify: `scripts/enrich-import.mjs` - import only approved/original candidates and run full verification before finalizing.
- Modify: `scripts/validate-question-bank.mjs` - keep current bank rules and add optional duplicate/provenance checks if imported questions include source tags.
- Modify: `.github/workflows/enrichment-pipeline.yml` - daily discovery/staging PR, not daily auto-import to production content.
- Modify: `package.json` - add explicit commands for discover, verify auto, verify interactive, import, and full pipeline dry run.
- Modify: `README.md` - document the final workflow, safety gates, commands, and Markdown-only storage model.

## Markdown Candidate Schema

Each crawled or manually normalized item should look like this:

```markdown
---
schemaVersion: 1
status: crawled
sourceUrl: "https://example.com/source"
sourceTitle: "Example PM Assessment"
sourceType: "assessment_vendor"
harvestPolicy: "metadata_only"
permissionNote: "Use for topic/rubric calibration only; do not copy verbatim."
extractionMethod: "manual_raw"
crawledAt: "2026-05-24"
reviewedAt: ""
reviewer: ""
originalityStatus: "needs_rewrite"
topic: product_analytics
difficulty: medium
correctChoiceId: C
estimatedSeconds: 90
conceptTags:
  - cohort-analysis
  - causal-reasoning
---

# Prompt
A concrete PM scenario with enough data to answer.

## Choice A
Plausible but wrong PM decision.

## Choice B
Plausible but wrong PM decision.

## Choice C
Correct answer.

## Choice D
Plausible but wrong PM decision.

## Choice E
Plausible but wrong PM decision.

# Explanation
Why the correct answer is right and why the common tempting mistake is wrong.

# Verification Notes
- Answer evidence:
- Originality notes:
- Reviewer decision:
```

## Tasks

### Task 1: Pause Unsafe Daily Auto-Import

**Files:**
- Modify: `.github/workflows/enrichment-pipeline.yml`
- Modify: `README.md`

- [x] **Step 1: Change the daily workflow so it stages Markdown candidates only**

Modify `.github/workflows/enrichment-pipeline.yml` so the scheduled job runs crawl/discovery and verification reporting, but does not run `npm run enrich:import` on a schedule.

Expected workflow shape:

```yaml
name: Daily PM Question Discovery

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:
    inputs:
      importApproved:
        description: "Import already approved verified Markdown questions"
        required: false
        default: "false"

permissions:
  contents: write
  pull-requests: write

jobs:
  discover:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run enrich:crawl
      - run: npm run enrich:verify:auto
      - run: npm run validate:questions
      - uses: peter-evans/create-pull-request@v6
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: "chore(enrichment): stage daily PM assessment candidates"
          branch: enrichment/daily-discovery
          title: "Daily PM Assessment Candidate Discovery"
```

- [x] **Step 2: Add a separate guarded import job for manual dispatch**

Add a second job that runs only when `github.event.inputs.importApproved == 'true'`.

```yaml
  import-approved:
    if: github.event_name == 'workflow_dispatch' && github.event.inputs.importApproved == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run enrich:import
      - run: npm run build
```

- [x] **Step 3: Update README safety language**

Change the README enrichment section to say daily automation stages Markdown candidates and opens a PR for review; approved import is a manual dispatch/local command.

- [x] **Step 4: Verify workflow syntax**

Run:

```bash
npm run validate:questions
```

Expected: existing question bank validation still passes.

### Task 2: Add Source Registry And Schema Docs

**Files:**
- Create: `docs/enrichment/source_registry.md`
- Create: `docs/enrichment/schema.md`
- Modify: `docs/enrichment/pipeline_log.md`

- [x] **Step 1: Create the source registry**

Create `docs/enrichment/source_registry.md` with this table:

```markdown
# PM Assessment Source Registry

Last reviewed: 2026-05-24

| id | status | source | url | harvestPolicy | fit | topicSignals | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| productcompass-analytics-2023 | active | ProductCompass PM Skills Assessment | https://www.productcompass.pm/p/pm-skills-assessment-nov-2023?action=share | manual_review_only | high | data_literacy, product_analytics, ab_testing | Public post describes 20 single-choice analytics/metrics/experimentation questions with answers after submission. |
| meta-pm-guide | active | Meta PM Interview Prep Guide | https://d3no4ktch0fdq4.cloudfront.net/public/course/files/Meta_PM_interview_guide.pdf | rubric_only | high | product_analytics, data_interpretation | Official PM interview guide; use format/rubric patterns, not verbatim question text. |
| igotanoffer-meta-analytical | active | IGotAnOffer Meta Analytical Thinking | https://igotanoffer.com/blogs/product-manager/facebook-execution-interview | pattern_only | high | product_analytics, data_interpretation, ab_testing | Public guide with example prompt categories and practice advice. |
| ideaplan-pm-questions | candidate | IdeaPlan PM Interview Questions | https://www.ideaplan.io/interview-questions | needs_terms_review | medium | product_analytics, data_interpretation | Timed mock surface with Metrics & Analytics category. |
| adaface-pm-test | candidate | Adaface Product Manager Test | https://www.adaface.com/assessment-test/product-manager-assessment-test | metadata_only | medium | product_analytics, product_strategy | Vendor preview and taxonomy; avoid copying protected bank content. |
| testgorilla-pm-test | candidate | TestGorilla Product Management Test | https://www.testgorilla.com/test-library/role-specific-skills-tests/product-management-test/ | metadata_only | medium | product_lifecycle, agile | Vendor taxonomy and timing. |
| alooba-pm-tests | candidate | Alooba Product Manager Tests | https://www.alooba.com/roles/product-manager/tests/ | metadata_only | medium | data_analysis, prioritization | Vendor test variants and 20-question/30-minute pattern. |
| imocha-pm-test | candidate | iMocha Product Manager Test | https://www.imocha.io/tests/product-manager-assessment-test | metadata_only | low-medium | market_research, product_design | Vendor taxonomy and timing. |
| productside-skills-assessment | candidate | Productside Individual Skills Assessment | https://productside.com/individual-skills-assessment/ | metadata_only | low-medium | analytical_business_skills, kpis | Broader PM diagnostic; use coverage map. |
| seriousfactory-pm-quiz | candidate | Serious Factory Product Manager Quiz | https://assessment.seriousfactory.com/en/categories/it-digital-transformation/roles/product-manager/ | metadata_only | low | project_management, risk | More general PM/project-management oriented. |
| pmtestpro-test | needs_retry | PMTestPro Product Management Test | https://pmtestpro.com/test | needs_manual_validation | unknown | product_assessments | Initial fetch timed out; retry manually before allowlisting. |
| productsandbox-pm-interview | needs_review | Product Sandbox PM Interview | https://sandbox4pm.com/pm-interview | metadata_only | unknown | analytics, scenarios | JavaScript app; do not crawl dynamic content without permission. |
```

- [x] **Step 2: Create the schema doc**

Create `docs/enrichment/schema.md` with the Markdown candidate schema from this plan, the status lifecycle, and the reviewer checklist.

Status lifecycle:

```text
discovered -> crawled -> needs_rewrite -> needs_answer_key -> approved -> imported
discovered -> crawled -> rejected
approved -> imported
```

- [x] **Step 3: Add log columns for rejected and staged counts**

Change `docs/enrichment/pipeline_log.md` table columns to:

```markdown
| Date | Run ID | Action | Websites Touched | Candidates Crawled | Candidates Staged | Approved | Rejected | Imported | Total Questions | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

- [x] **Step 4: Verify docs are findable**

Run:

```bash
rg "PM Assessment Source Registry|schemaVersion|Candidates Crawled" docs/enrichment
```

Expected: output includes `source_registry.md`, `schema.md`, and `pipeline_log.md`.

### Task 3: Add Shared Markdown Parser Tests

**Files:**
- Create: `scripts/enrichment/markdown.test.mjs`
- Create: `scripts/enrichment/markdown.mjs`

- [x] **Step 1: Write parser tests first**

Create `scripts/enrichment/markdown.test.mjs`:

```js
import { describe, expect, it } from "vitest";
import { parseCandidateMarkdown, serializeCandidateMarkdown } from "./markdown.mjs";

const sample = `---
schemaVersion: 1
status: crawled
sourceUrl: "https://example.com"
sourceTitle: "Example"
sourceType: "assessment_vendor"
harvestPolicy: "manual_review_only"
permissionNote: "Public sample, manual review required."
extractionMethod: "manual_raw"
crawledAt: "2026-05-24"
reviewedAt: ""
reviewer: ""
originalityStatus: "needs_rewrite"
topic: product_analytics
difficulty: medium
correctChoiceId: C
estimatedSeconds: 90
conceptTags:
  - activation
  - cohorts
---

# Prompt
Prompt text with enough detail to represent a PM scenario.

## Choice A
First choice

## Choice B
Second choice

## Choice C
Correct choice

## Choice D
Fourth choice

## Choice E
Fifth choice

# Explanation
Explanation text that teaches the concept.

# Verification Notes
- Answer evidence: reviewer checked the math
- Originality notes: rewritten
- Reviewer decision: pending
`;

describe("candidate markdown parser", () => {
  it("parses frontmatter lists and body sections", () => {
    const candidate = parseCandidateMarkdown(sample, "sample.md");

    expect(candidate.frontmatter.topic).toBe("product_analytics");
    expect(candidate.frontmatter.conceptTags).toEqual(["activation", "cohorts"]);
    expect(candidate.prompt).toContain("PM scenario");
    expect(candidate.choices.C).toBe("Correct choice");
    expect(candidate.explanation).toContain("teaches");
    expect(candidate.verificationNotes).toContain("reviewer checked");
  });

  it("serializes back to parseable markdown", () => {
    const first = parseCandidateMarkdown(sample, "sample.md");
    const serialized = serializeCandidateMarkdown(first);
    const second = parseCandidateMarkdown(serialized, "sample.md");

    expect(second.frontmatter).toEqual(first.frontmatter);
    expect(second.choices).toEqual(first.choices);
    expect(second.explanation).toBe(first.explanation);
  });
});
```

- [x] **Step 2: Run tests and confirm failure**

Run:

```bash
npm run test -- scripts/enrichment/markdown.test.mjs
```

Expected: FAIL because `scripts/enrichment/markdown.mjs` does not exist.

- [x] **Step 3: Implement parser module**

Create `scripts/enrichment/markdown.mjs` with exported functions:

```js
export const CHOICE_IDS = ["A", "B", "C", "D", "E"];

export function parseFrontmatter(raw) {
  const result = {};
  const lines = raw.split("\n");
  let currentListKey = "";

  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^\s+-\s+/.test(line) && currentListKey) {
      result[currentListKey].push(unquote(line.replace(/^\s+-\s+/, "").trim()));
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;

    const [, key, value] = match;
    if (value === "") {
      result[key] = [];
      currentListKey = key;
    } else {
      result[key] = normalizeValue(unquote(value.trim()));
      currentListKey = "";
    }
  }

  return result;
}

export function parseCandidateMarkdown(content, filepath = "") {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`${filepath || "candidate"} is missing frontmatter`);
  }

  const frontmatter = parseFrontmatter(match[1]);
  const body = match[2];
  const prompt = section(body, "# Prompt", "## Choice A");
  const choices = Object.fromEntries(
    CHOICE_IDS.map((id, index) => [
      id,
      section(body, `## Choice ${id}`, index < CHOICE_IDS.length - 1 ? `## Choice ${CHOICE_IDS[index + 1]}` : "# Explanation"),
    ])
  );

  return {
    filepath,
    frontmatter,
    prompt,
    choices,
    explanation: section(body, "# Explanation", "# Verification Notes"),
    verificationNotes: section(body, "# Verification Notes", null),
  };
}

export function serializeCandidateMarkdown(candidate) {
  const fm = candidate.frontmatter;
  const tags = Array.isArray(fm.conceptTags) ? fm.conceptTags : [];
  return `---
${Object.entries(fm)
  .filter(([key]) => key !== "conceptTags")
  .map(([key, value]) => `${key}: ${quoteIfNeeded(value)}`)
  .join("\n")}
conceptTags:
${tags.map((tag) => `  - ${tag}`).join("\n")}
---

# Prompt
${candidate.prompt}

## Choice A
${candidate.choices.A}

## Choice B
${candidate.choices.B}

## Choice C
${candidate.choices.C}

## Choice D
${candidate.choices.D}

## Choice E
${candidate.choices.E}

# Explanation
${candidate.explanation}

# Verification Notes
${candidate.verificationNotes}
`;
}

function section(body, startHeading, endHeading) {
  const start = body.indexOf(startHeading);
  if (start === -1) return "";
  const contentStart = start + startHeading.length;
  const end = endHeading ? body.indexOf(endHeading, contentStart) : -1;
  return body.slice(contentStart, end === -1 ? body.length : end).trim();
}

function unquote(value) {
  return value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

function normalizeValue(value) {
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}

function quoteIfNeeded(value) {
  if (value === "") return '""';
  if (typeof value === "number") return String(value);
  if (/[:#\n]/.test(String(value))) return JSON.stringify(String(value));
  return String(value);
}
```

- [x] **Step 4: Run parser tests**

Run:

```bash
npm run test -- scripts/enrichment/markdown.test.mjs
```

Expected: PASS.

### Task 4: Add Source Registry Reader

**Files:**
- Create: `scripts/enrichment/source-registry.test.mjs`
- Create: `scripts/enrichment/source-registry.mjs`

- [x] **Step 1: Write registry tests**

Create `scripts/enrichment/source-registry.test.mjs`:

```js
import { describe, expect, it } from "vitest";
import { parseSourceRegistry } from "./source-registry.mjs";

const registry = `# PM Assessment Source Registry

| id | status | source | url | harvestPolicy | fit | topicSignals | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| meta-pm-guide | active | Meta PM Interview Prep Guide | https://example.com/meta.pdf | rubric_only | high | product_analytics, data_interpretation | Use format only. |
| blocked-source | rejected | Blocked | https://example.com/blocked | metadata_only | low | general | Do not use. |
`;

describe("source registry", () => {
  it("parses active sources and topic signals", () => {
    const sources = parseSourceRegistry(registry);

    expect(sources).toHaveLength(2);
    expect(sources[0]).toMatchObject({
      id: "meta-pm-guide",
      status: "active",
      harvestPolicy: "rubric_only",
      fit: "high",
    });
    expect(sources[0].topicSignals).toEqual(["product_analytics", "data_interpretation"]);
  });

  it("marks crawlable sources conservatively", () => {
    const sources = parseSourceRegistry(registry);

    expect(sources[0].canFetch).toBe(true);
    expect(sources[0].canStoreQuestionText).toBe(false);
    expect(sources[1].canFetch).toBe(false);
  });
});
```

- [x] **Step 2: Implement registry reader**

Create `scripts/enrichment/source-registry.mjs`:

```js
export function parseSourceRegistry(markdown) {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("| ") && !line.includes("---") && !line.includes("| id |"))
    .map((line) => {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim());
      const [id, status, source, url, harvestPolicy, fit, topicSignals, notes] = cells;
      return {
        id,
        status,
        source,
        url,
        harvestPolicy,
        fit,
        topicSignals: topicSignals.split(",").map((topic) => topic.trim()).filter(Boolean),
        notes,
        canFetch: status === "active" || status === "candidate",
        canStoreQuestionText: ["public_question_ok", "manual_review_only"].includes(harvestPolicy),
      };
    })
    .filter((source) => source.id);
}
```

- [x] **Step 3: Run registry tests**

Run:

```bash
npm run test -- scripts/enrichment/source-registry.test.mjs
```

Expected: PASS.

### Task 5: Replace Demo Crawl Logic With Registry-Driven Discovery

**Files:**
- Modify: `scripts/enrich-crawl.mjs`
- Create: `scripts/enrichment/logging.mjs`
- Modify: `docs/enrichment/logs/.gitkeep`

- [x] **Step 1: Remove hard-coded demo source**

Delete `PUBLIC_SOURCES` from `scripts/enrich-crawl.mjs`. The script must read `docs/enrichment/source_registry.md`.

- [x] **Step 2: Implement conservative crawl behavior**

Use these rules:

```js
const STORE_TEXT_POLICIES = new Set(["public_question_ok", "manual_review_only"]);
const METADATA_ONLY_POLICIES = new Set(["rubric_only", "pattern_only", "metadata_only", "needs_terms_review"]);

function canStoreQuestionText(source) {
  return STORE_TEXT_POLICIES.has(source.harvestPolicy);
}

function shouldWriteSourceNote(source) {
  return METADATA_ONLY_POLICIES.has(source.harvestPolicy);
}
```

Expected behavior:

- `metadata_only`, `rubric_only`, and `pattern_only` sources create source-note Markdown, not question candidates.
- `manual_review_only` sources may create candidates, but with `originalityStatus: needs_rewrite` and `status: crawled`.
- Missing correct answer must produce `status: needs_answer_key`, never default to `A`.

- [x] **Step 3: Preserve raw files**

Change raw ingestion so `docs/enrichment/raw/*.txt` is copied to `*.processed` instead of renamed destructively only after candidates are written successfully.

- [x] **Step 4: Add per-run log writer**

Create `scripts/enrichment/logging.mjs`:

```js
import fs from "node:fs";
import path from "node:path";

export function createRunId(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\..+$/, "Z");
}

export function writeRunLog({ projectRoot, runId, lines }) {
  const logsDir = path.join(projectRoot, "docs", "enrichment", "logs");
  fs.mkdirSync(logsDir, { recursive: true });
  const filepath = path.join(logsDir, `${runId}.md`);
  fs.writeFileSync(filepath, `# Enrichment Run ${runId}\n\n${lines.join("\n")}\n`, "utf8");
  return filepath;
}
```

- [x] **Step 5: Run crawler**

Run:

```bash
npm run enrich:crawl
```

Expected: crawler touches registry sources, writes source notes/candidates according to policy, writes one per-run log, and updates `pipeline_log.md`.

### Task 6: Strengthen Verification Gates

**Files:**
- Create: `scripts/enrichment/quality.test.mjs`
- Create: `scripts/enrichment/quality.mjs`
- Modify: `scripts/enrich-verify.mjs`

- [x] **Step 1: Write quality tests**

Create `scripts/enrichment/quality.test.mjs` with checks for:

```js
import { describe, expect, it } from "vitest";
import { validateCandidate } from "./quality.mjs";

function baseCandidate(overrides = {}) {
  return {
    frontmatter: {
      schemaVersion: 1,
      status: "crawled",
      sourceUrl: "https://example.com",
      sourceTitle: "Example",
      harvestPolicy: "manual_review_only",
      permissionNote: "Manual review required.",
      originalityStatus: "original",
      topic: "product_analytics",
      difficulty: "medium",
      correctChoiceId: "C",
      estimatedSeconds: 90,
      conceptTags: ["activation"],
      ...overrides.frontmatter,
    },
    prompt: overrides.prompt ?? "A PM sees activation rise but paid conversion stay flat after a product change. Which analysis should come next before shipping more work?",
    choices: overrides.choices ?? {
      A: "Declare success because activation improved.",
      B: "Ignore activation and only ask sales for opinions.",
      C: "Check whether activated users reached behaviors that predict paid conversion.",
      D: "Change the goal metric after seeing the result.",
      E: "Pause all measurement for a month.",
    },
    explanation: overrides.explanation ?? "Activation is useful only if it is connected to downstream value. The PM should inspect whether the activated behavior predicts paid conversion before increasing investment.",
    verificationNotes: overrides.verificationNotes ?? "- Answer evidence: reviewer verified the metric tree.\n- Reviewer decision: approved",
  };
}

describe("candidate quality validation", () => {
  it("accepts a complete approved candidate", () => {
    const result = validateCandidate(baseCandidate());
    expect(result.errors).toEqual([]);
  });

  it("blocks missing answer keys", () => {
    const result = validateCandidate(baseCandidate({ frontmatter: { correctChoiceId: "" } }));
    expect(result.errors).toContain("correctChoiceId must be A, B, C, D, or E.");
  });

  it("warns on weak distractors", () => {
    const result = validateCandidate(baseCandidate({
      choices: {
        A: "Change the logo color.",
        B: "Ignore cohorts.",
        C: "Check predictive activation behavior.",
        D: "Use a vanity metric.",
        E: "Overreact to one day of data.",
      },
    }));
    expect(result.warnings.some((warning) => warning.includes("logo color"))).toBe(true);
  });
});
```

- [x] **Step 2: Implement validation module**

Create `scripts/enrichment/quality.mjs` using the same topic, difficulty, choice, weak-distractor, prompt, explanation, tag, and timing rules from `scripts/validate-question-bank.mjs`.

Required export:

```js
export function validateCandidate(candidate) {
  return { errors, warnings };
}
```

- [x] **Step 3: Update interactive verification**

Modify `scripts/enrich-verify.mjs` so:

- Approve is blocked if errors exist.
- Approve is blocked if `originalityStatus` is `needs_rewrite`.
- Approve is blocked if `verificationNotes` does not include `Answer evidence:`.
- Warnings require an explicit reviewer confirmation in interactive mode.
- Auto mode can stage as `schema_valid`, but cannot set `status: approved` unless `reviewer` and `reviewedAt` are already present.

- [x] **Step 4: Run verification tests**

Run:

```bash
npm run test -- scripts/enrichment/quality.test.mjs
npm run enrich:verify -- --auto
```

Expected: tests pass; auto verification does not approve unreviewed crawled candidates.

### Task 7: Add Duplicate And Existing-Bank Checks

**Files:**
- Modify: `scripts/enrichment/quality.mjs`
- Modify: `scripts/enrich-verify.mjs`

- [x] **Step 1: Add normalization helper**

Add:

```js
export function normalizeForSimilarity(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
```

- [x] **Step 2: Compare candidate prompts against existing questions**

In verification, load `src/questions.ts` through the same VM/transpile pattern used by `scripts/validate-question-bank.mjs`, normalize prompts, and block candidates with exact normalized prompt matches.

- [x] **Step 3: Warn on likely near duplicates**

Use token overlap:

```js
export function tokenOverlapScore(a, b) {
  const aTokens = new Set(normalizeForSimilarity(a).split(" ").filter((token) => token.length > 3));
  const bTokens = new Set(normalizeForSimilarity(b).split(" ").filter((token) => token.length > 3));
  const intersection = [...aTokens].filter((token) => bTokens.has(token)).length;
  return intersection / Math.max(1, Math.min(aTokens.size, bTokens.size));
}
```

Warn when score is `>= 0.75`; block when score is `>= 0.9`.

- [x] **Step 4: Verify duplicate behavior**

Create a crawled candidate with the exact prompt of `pa-001`, then run:

```bash
npm run enrich:verify -- --auto
```

Expected: candidate is not approved and the run log explains the duplicate block.

### Task 8: Harden Import

**Files:**
- Modify: `scripts/enrich-import.mjs`
- Modify: `docs/enrichment/imported/.gitkeep`

- [x] **Step 1: Require approved/original candidates**

Change import selection to require:

```js
q.frontmatter.status === "approved"
q.frontmatter.originalityStatus === "original" || q.frontmatter.originalityStatus === "permitted"
q.frontmatter.reviewedAt
q.frontmatter.reviewer
```

- [x] **Step 2: Preserve answer-letter balance**

Before assigning IDs, calculate current `correctChoiceId` counts and sort imports so the next imported answers reduce imbalance where possible. If a batch would make any answer letter more than one away from the expected count, stop and print the required edits.

- [x] **Step 3: Run full verification**

Keep these commands inside import:

```bash
npm run validate:questions
npm run test
npm run build
```

- [x] **Step 4: Roll back all touched files on failure**

Back up and restore:

- `src/questions.ts`
- every verified Markdown file that would be moved
- every imported Markdown file that would be written
- `docs/enrichment/pipeline_log.md`

- [x] **Step 5: Verify import with one local fixture**

Run:

```bash
npm run enrich:import
```

Expected: approved fixture imports, validation/test/build pass, Markdown moves from `verified/` to `imported/`, and log counts are correct.

### Task 9: Package Commands And README

**Files:**
- Modify: `package.json`
- Modify: `README.md`

- [x] **Step 1: Add explicit scripts**

Update `package.json`:

```json
{
  "scripts": {
    "enrich:crawl": "node scripts/enrich-crawl.mjs",
    "enrich:verify": "node scripts/enrich-verify.mjs",
    "enrich:verify:auto": "node scripts/enrich-verify.mjs --auto",
    "enrich:import": "node scripts/enrich-import.mjs",
    "enrich:dry-run": "npm run enrich:crawl && npm run enrich:verify:auto && npm run validate:questions"
  }
}
```

- [x] **Step 2: README documents the pipeline honestly**

README must cover:

- Source registry path.
- Markdown candidate lifecycle.
- Daily job stages candidates only.
- Manual approval/import gate.
- Commands.
- Validation commands.
- No database.
- No copying from gated/premium/proprietary banks.

- [x] **Step 3: Verify README consistency**

Run:

```bash
rg "source_registry|enrich:verify:auto|manual approval|No database" README.md docs/enrichment
```

Expected: all terms are present.

### Task 10: End-To-End Dry Run

**Files:**
- Modify only files touched by prior tasks.

- [x] **Step 1: Clean old demo candidates**

Move any demo-only fixture that should not be imported to `docs/enrichment/imported/` or delete it if it is clearly a synthetic throwaway. Do not remove user-provided raw files.

- [x] **Step 2: Run the daily discovery path**

Run:

```bash
npm run enrich:dry-run
```

Expected: crawler completes, auto verify does not approve unreviewed items, and `npm run validate:questions` passes.

- [x] **Step 3: Run full project verification**

Run:

```bash
npm run test
npm run validate:questions
npm run build
```

Expected: all pass.

- [x] **Step 4: Inspect audit log**

Run:

```bash
tail -n 20 docs/enrichment/pipeline_log.md
ls docs/enrichment/logs
```

Expected: summary log shows websites touched, crawled/staged candidates, approved count, rejected count, imported count, and per-run log file exists.

## Self-Review

- Spec coverage: The plan covers source discovery, daily pipeline, Markdown-only storage, validation/correctness gates, import into the website, and audit logging.
- Placeholder scan: No task relies on unspecified implementation; each step names concrete files, commands, and expected behavior.
- Type consistency: Candidate statuses, frontmatter fields, and script names are consistent across schema, tests, crawler, verifier, importer, workflow, and README tasks.
