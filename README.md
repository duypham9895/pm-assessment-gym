# PM Assessment Gym

Practice mocks for product management analytical assessments. Built as a single-page React + TypeScript app with a 30-question bank covering six PM skill areas: Product Analytics, Data Literacy, Chart Interpretation, Inductive Reasoning, Data Interpretation, and A/B Testing.

**Live demo:** https://pm-assessment-lime.vercel.app

Auto-deploys to Vercel on every push to `main`.

## Features

- **Full Mock** and **Topic Drill** modes with **Exam** or **Practice** feedback
- 21-question mock with a 30-minute timer and auto-submit
- Question navigator (jump to any question) and "Next unanswered" jump
- Practice mode shows the correct answer + explanation immediately
- Weakest-topic detection and one-click drill
- localStorage history of your last 5 attempts
- Light, dark, and system theme with manual toggle
- Keyboard shortcuts: press `1`–`5` to pick a choice
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

## Build

```bash
npm run build
```

Outputs a static bundle to `dist/`. Deploys cleanly to Vercel, Netlify, or any static host.

## Project structure

- `src/questions.ts` — the question bank (30 questions, 5 per topic) plus topic config.
- `src/frameworks.ts` — quick-reference framework notes shown in the Frameworks view.
- `src/scoring.ts` — selection, scoring, weakest-topic detection, and review building.
- `src/storage.ts` — localStorage persistence of the last 5 attempts.
- `src/App.tsx` — UI: home, test, results, frameworks views.

## URL params (dev only)

- `?timerSeconds=N` — override the timer to N seconds (1 to 30) for quickly testing the auto-submit flow.
