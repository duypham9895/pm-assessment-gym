# PM Assessment Gym

Practice mocks for product management analytical assessments. Built as a single-page React + TypeScript app with a 120-question original bank covering six PM skill areas: Product Analytics, Data Literacy, Chart Interpretation, Inductive Reasoning, Data Interpretation, and A/B Testing.

**Live demo:** https://pm-assessment-lime.vercel.app

Auto-deploys to Vercel on every push to `main`. Pull requests get their own preview URL.

## Features

- **Full Mock** and **Topic Drill** modes with **Exam** or **Practice** feedback
- 21-question Alvin-style mock with a 30-minute timer, auto-submit, and clear 4/3/4/3/4/3 topic weighting
- 120 original practice questions, balanced across topics and answer positions
- Question navigator (jump to any question) and "Next unanswered" jump
- Practice mode shows the correct answer + explanation immediately
- Weakest-topic detection and one-click drill
- localStorage history of your last 5 attempts
- Light and dark theme with manual toggle
- Keyboard-first flow: `1`–`5` answers, `Shift+1`–`Shift+3` confidence, arrow navigation, next-unanswered jump, and a shortcuts help overlay
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
| `/full-mock/exam` | Full Mock with Exam feedback selected. |
| `/full-mock/practice` | Full Mock with Practice feedback selected. |
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

Assessment routes are launch/configuration routes: they select the mode, feedback mode, and topic, but they do not start a timed session until you press Start. Result routes are local-only because attempts are stored in localStorage; opening a missing result ID shows a short unavailable message and returns you to the start surface.

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

## Content validation

```bash
npm run validate:questions
```

Checks topic coverage, question structure, and balanced correct-answer letters.

## Project structure

- `src/questions.ts` — the question bank (120 questions, 20 per topic) plus topic config.
- `src/frameworks.ts` — quick-reference framework notes shown in the Frameworks view.
- `src/routes.ts` — local route parsing, canonical paths, topic slugs, and document titles.
- `src/scoring.ts` — selection, scoring, weakest-topic detection, and review building.
- `src/storage.ts` — localStorage persistence of the last 5 attempts.
- `src/shortcuts.ts` — keyboard shortcut definitions, key matching, and editable/modal guards.
- `src/App.tsx` — UI: home, test, results, frameworks views.
- `vercel.json` — SPA rewrite so direct route paths serve the Vite bundle on Vercel.
- `AGENTS.md` — Codex project memory and repository working instructions.

## URL params (dev only)

- `?timerSeconds=N` — override the timer to N seconds (1 to 30) for quickly testing the auto-submit flow.
