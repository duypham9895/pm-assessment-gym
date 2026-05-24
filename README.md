# PM Assessment Gym

Practice mocks for product management analytical assessments. Built as a single-page React + TypeScript app with a 121-question original bank covering six PM skill areas: Product Analytics, Data Literacy, Chart Interpretation, Inductive Reasoning, Data Interpretation, and A/B Testing.

**Live demo:** https://pm-assessment-lime.vercel.app

Auto-deploys to Vercel on every push to `main`. Pull requests get their own preview URL.

## Features

- **Full Mock** and **Topic Drill** modes with **Exam** or **Practice** feedback
- 21-question Alvin-style mock with a 30-minute timer, auto-submit, and clear 4/3/4/3/4/3 topic weighting
- 121 original practice questions, with at least 20 per topic and answer positions kept within one of even balance
- Question navigator (jump to any question) and "Next unanswered" jump
- Practice mode shows the correct answer + explanation immediately
- Weakest-topic detection and one-click drill
- localStorage history of your last 5 attempts
- Light and dark theme with manual toggle
- Keyboard-first flow: `1`–`5` answers, `Shift+1`–`Shift+3` confidence, arrow navigation, next-unanswered jump, and a shortcuts help overlay
- App modals close with Escape or a backdrop click while preserving focus restoration for keyboard users
- Mobile-friendly, accessible focus rings, `prefers-reduced-motion` respected

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

## Modes

- **Full Mock** — 21 questions across all topics, 30 minute timer, exam-style feedback at the end.
- **Topic Drill** — 10 questions on one topic, 90 seconds per question, with optional practice-mode inline feedback.

## Routes

PM Assessment Gym is still a single-page app, but core surfaces now have shareable paths:

| Path | Behavior |
| --- | --- |
| `/` | Home start surface with default selections. |
| `/full-mock` | Canonicalizes to Full Mock with Exam feedback selected. |
| `/full-mock/exam` | Full Mock with Exam feedback selected. |
| `/full-mock/practice` | Full Mock with Practice feedback selected. |
| `/topic-drill/:topic` | Canonicalizes to that topic drill with Practice feedback selected. |
| `/topic-drill/product-analytics/exam` | Product Analytics drill with Exam feedback selected. |
| `/topic-drill/product-analytics/practice` | Product Analytics drill with Practice feedback selected. |
| `/topic-drill/data-literacy/exam` | Data Literacy drill with Exam feedback selected. |
| `/topic-drill/data-literacy/practice` | Data Literacy drill with Practice feedback selected. |
| `/topic-drill/chart-interpretation/exam` | Chart Interpretation drill with Exam feedback selected. |
| `/topic-drill/chart-interpretation/practice` | Chart Interpretation drill with Practice feedback selected. |
| `/topic-drill/inductive-reasoning/exam` | Inductive Reasoning drill with Exam feedback selected. |
| `/topic-drill/inductive-reasoning/practice` | Inductive Reasoning drill with Practice feedback selected. |
| `/topic-drill/data-interpretation/exam` | Data Interpretation drill with Exam feedback selected. |
| `/topic-drill/data-interpretation/practice` | Data Interpretation drill with Practice feedback selected. |
| `/topic-drill/ab-testing/exam` | A/B Testing drill with Exam feedback selected. |
| `/topic-drill/ab-testing/practice` | A/B Testing drill with Practice feedback selected. |
| `/frameworks` | Framework quick-reference view. |
| `/results/:attemptId` | Same-device result review when the attempt exists in localStorage. |

Assessment routes are launch/configuration routes for new visitors: they select the mode, feedback mode, and topic, but they do not start a timed session until you press Start. On the same device, refreshing a matching in-progress assessment route restores the active local session, including the selected question set, answers, current question, confidence drafts, and remaining time. Result routes are local-only because attempts are stored in localStorage; opening a missing result ID shows a short unavailable message and returns you to the start surface.

The Vercel deployment uses `vercel.json` to rewrite deep links back to the Vite app so direct URLs such as `/frameworks` and `/topic-drill/ab-testing/practice` load without a static-host 404.

## Why 21 questions?

The Full Mock uses 21 questions because it is the smallest clean length for the intended six-skill shape: `4 / 3 / 4 / 3 / 4 / 3`.

That gives every skill at least 3 questions while adding one extra question to the interpretation-heavy areas:

- Product Analytics: 4
- Data Literacy: 3
- Chart Interpretation: 4
- Inductive Reasoning: 3
- Data Interpretation: 4
- A/B Testing: 3

With 20 questions, one skill has to be underweighted or the extra weight lands on the wrong area. With 30 questions, the mock becomes a longer endurance session instead of a focused 30-minute readiness check. At 21 questions, the timer stays realistic at about 85 seconds per question while preserving the calibrated topic mix.

## Build

```bash
npm run build
```

Outputs a static bundle to `dist/`. Deploys cleanly to Vercel, Netlify, or any static host.

## Maintenance Rule

Keep this README up to date with every meaningful change to features, commands, project structure, deployment behavior, validation steps, or user-facing behavior.

## Dataset Enrichment Pipeline

To expand and keep the question bank calibrated with real-world Product Manager analytical assessment patterns, the project includes a Markdown-only ingestion and verification pipeline. No database is used; every source note, candidate, approval, import archive, and run log lives under `docs/enrichment/`.

### Directory Structure

- `/docs/enrichment/source_registry.md` — allowlist, harvest policy, source fit, topic signals, and last-reviewed context.
- `/docs/enrichment/schema.md` — canonical candidate schema, lifecycle, and reviewer checklist.
- `/docs/enrichment/raw/` — manual raw text or HTML inputs that are public/permitted and need normalization.
- `/docs/enrichment/crawled/` — staged Markdown candidates plus source notes from discovery.
- `/docs/enrichment/verified/` — reviewer-approved Markdown candidates awaiting import.
- `/docs/enrichment/imported/` — archive of candidates successfully written to `src/questions.ts`.
- `/docs/enrichment/logs/` — per-run Markdown logs.
- `/docs/enrichment/pipeline_log.md` — summary execution statistics log.

### Pipeline Workflow

Candidate lifecycle:

```text
discovered -> crawled -> needs_rewrite -> needs_answer_key -> approved -> imported
discovered -> crawled -> rejected
approved -> imported
```

Safety rule: do not scrape gated, paywalled, private, login-only, or proprietary question banks. External sites are primarily source signals for assessment patterns, taxonomy, timing, and calibration unless public reuse is clearly permitted. Missing answer keys block approval.

### Commands

1. **Discover & Stage**
   ```bash
   npm run enrich:crawl
   ```
   Reads `source_registry.md`, fetches only allowed public sources, writes source notes for metadata/rubric/pattern policies, and stages any permitted/manual candidates in `/docs/enrichment/crawled/`.

2. **Auto Verification Report**
   ```bash
   npm run enrich:verify:auto
   ```
   Runs schema, provenance, answer-key, originality, duplicate, and distractor checks without approving unreviewed candidates. Clean unreviewed candidates can become `schema_valid`, not `approved`.

3. **Interactive Review & Approval**
   ```bash
   npm run enrich:verify
   ```
   Launches an interactive CLI review menu. Approval is blocked by validation errors, `needs_rewrite`, missing answer evidence, missing reviewer metadata, and unresolved warnings unless the reviewer explicitly confirms them.

4. **Import to Codebase**
   ```bash
   npm run enrich:import
   ```
   Imports only approved, reviewed, original/permitted candidates. The importer rechecks schema, approval gates, duplicates, answer-letter balance, `npm run validate:questions`, `npm run test`, and `npm run build`; failures roll back touched code, Markdown moves, and logs.

5. **Daily Path Dry Run**
   ```bash
   npm run enrich:dry-run
   ```
   Runs discovery, auto verification, and existing bank validation without importing staged candidates.

### Daily GitHub Actions

A daily workflow (`.github/workflows/enrichment-pipeline.yml`) runs discovery only: it crawls/ingests public-source signals, runs automatic verification reporting, validates the existing question bank, and opens a Pull Request with Markdown artifacts for review. It does not auto-import crawled questions into `src/questions.ts`.

Approved imports are a separate manual approval gate. Run `npm run enrich:import` locally, or manually dispatch the workflow with `importApproved=true`, after Markdown candidates have reviewer approval, answer evidence, originality notes, duplicate clearance, and passing validation.

## Content validation

```bash
npm run validate:questions
```

Checks topic coverage, question structure, and correct-answer letter balance. When the total count is not divisible by five, exact answer-letter balance is impossible, so the importer keeps letters within one of the expected count.

## Project structure

- `src/questions.ts` — the question bank (121 questions, at least 20 per topic) plus topic config.
- `src/frameworks.ts` — quick-reference framework notes shown in the Frameworks view.
- `src/routes.ts` — local route parsing, canonical paths, topic slugs, and document titles.
- `src/scoring.ts` — selection, scoring, weakest-topic detection, and review building.
- `src/storage.ts` — localStorage persistence of the last 5 attempts, shortcut preferences, and active assessment session snapshots.
- `src/shortcuts.ts` — keyboard shortcut definitions, key matching, and editable/modal guards.
- `src/App.tsx` — UI: home, test, results, frameworks views.
- `vercel.json` — SPA rewrite so direct route paths serve the Vite bundle on Vercel.
- `AGENTS.md` — Codex project memory and repository working instructions.

## URL params (dev only)

- `?timerSeconds=N` — override the timer to N seconds (1 to 30) for quickly testing the auto-submit flow.
