# Repository Instructions

## Project Memory

PM Assessment Gym is a single-page React + TypeScript app for timed Product Manager analytical assessment practice. The current product is a practice accelerator, not a broad learning platform: help Edward set a baseline, review mistakes, drill weak topics, and refresh PM frameworks quickly.

The app is deployed from `main` to Vercel. The live demo listed in `README.md` is `https://pm-assessment-lime.vercel.app`.

## Principal Rules

1. Keep `README.md` up to date with every meaningful change. When features, commands, project structure, deployment behavior, validation steps, or user-facing behavior change, update the README in the same work session so it remains the current source of truth.
2. Prefer the core loop over feature count: Full Mock -> Results -> Weakest Drill -> Review -> repeat.
3. Keep the UI calm, fast, dense, and assessment-focused. Do not turn the app into a marketing landing page.
4. Avoid broad platform work unless explicitly requested: no accounts, database, cloud sync, AI tutor, dashboards, readiness-score formulas, payments, or routing rewrite.
5. Treat content quality as product quality. Realistic prompts, plausible distractors, useful explanations, and calibrated difficulty matter more than adding new surfaces.
6. Preserve existing unrelated user changes. Do not commit unless the user explicitly asks.
7. When the user asks to publish work, commit and push the scoped changes. If a PR is created, verify checks; if checks fail, investigate and fix the root cause until checks are green, then merge the PR to `main` when it is safe and allowed.

## Current Source Of Truth

- `README.md` and `src/` reflect the current app behavior.
- `docs/superpowers/plans/2026-05-22-practice-lock-navigation-content-calibration.md` records the completed calibration pass: practice locking, neutral navigator styling, 21-question Alvin-style mock, difficulty-balanced selection, repeat avoidance, validator updates, and content calibration notes.
- `docs/superpowers/plans/2026-05-23-keyboard-first-assessment-flow.md` records the completed keyboard-first pass: shortcut registry, shortcut preferences, first-time tip, help overlay, badges, focus behavior, and tests.
- `docs/review/2026-05-22-question-bank-calibration.md` defines the content calibration rubric and remaining distractor-audit direction.
- Older MVP docs under `docs/mvp/` are useful historical context, but some details are superseded. In particular, any 20-question full mock recommendation is superseded by the current 21-question Alvin-style mock in code and README.

## Product Behavior To Preserve

- Modes: Full Mock and Topic Drill.
- Feedback modes: Exam and Practice.
- Full Mock: 21 questions, 30-minute timer, auto-submit at time zero, topic weighting `4/3/4/3/4/3` in `TOPIC_ORDER`.
- Topic order: Product Analytics, Data Literacy, Chart Interpretation, Inductive Reasoning, Data Interpretation, A/B Testing.
- Topic Drill: up to 10 questions from one topic, 90 seconds per question.
- Question bank: 120 original questions, 20 per topic, five choices per question, balanced correct-answer letters.
- Practice mode shows feedback immediately and then locks the revealed answer and confidence. Do not let click handlers or keyboard shortcuts mutate locked practice answers.
- Exam mode hides feedback until submit and keeps answers editable before submission.
- The question navigator should show current/answered/unanswered state only. Do not color answered pills as correct or wrong.
- Results prioritize confident wrong answers, show wrong answers, summarize correct answers, show topic breakdown, and recommend the next drill from the weakest topic.
- Weakest topic logic in `src/scoring.ts`: most wrong answers, then lowest percent, then most questions as tie breakers.
- Attempt history stores only the last 5 attempts in localStorage and shows the latest 3 on Home.
- The Frameworks view is a static quick-reference checklist, not a course.

## Keyboard And Accessibility Behavior

- Printable shortcuts, when enabled: `1`-`5` select answers, `Shift+1`-`Shift+3` set confidence, `?` opens keyboard help.
- Non-printable navigation: `ArrowLeft` previous question, `ArrowRight` next question, `Shift+ArrowRight` next unanswered.
- Scoped focus movement: `ArrowUp`/`ArrowDown` move between answer buttons; `ArrowLeft`/`ArrowRight` move inside confidence controls.
- Shortcut mode can disable printable/global shortcuts while preserving arrow navigation and native Tab/Enter/Space behavior.
- Global shortcuts must ignore `input`, `textarea`, `select`, contenteditable elements, modal/dialog contexts, and events using Meta/Ctrl/Alt.
- Shortcut help opens from the visible Shortcuts button or `?`, closes with Escape, traps focus while open, and restores focus to the opener.

## Architecture Map

- `src/App.tsx`: owns internal views (`home`, `test`, `results`, `frameworks`), session state, timer, submission, shortcut integration, theme, and UI components.
- `src/questions.ts`: topic labels/order, full mock distribution, difficulty distribution, and the 120-question bank.
- `src/scoring.ts`: shuffling, full mock selection, topic drill selection, scoring, weakest-topic detection, review building, and wrong-review priority.
- `src/storage.ts`: localStorage helpers for attempts, shortcut mode, and first-time keyboard tip dismissal.
- `src/shortcuts.ts`: shortcut definitions, key matching, and target guards.
- `src/frameworks.ts`: static framework markdown rendered by the Frameworks view.
- `src/styles.css`: all styling, themes, responsive behavior, shortcut/help UI, and navigator states.
- `scripts/validate-question-bank.mjs`: validates question bank shape, distribution, difficulty targets, correct-answer balance, and weak distractor warnings.

## Development Commands

```bash
npm install
npm run dev
npm run test
npm run validate:questions
npm run build
```

Use `npm run dev` for local Vite development. The dev-only URL param `?timerSeconds=N` accepts `1` through `30` and is used for quick auto-submit testing.

Before claiming a meaningful implementation change is complete, run:

```bash
npm run test
npm run validate:questions
npm run build
```

For docs-only changes, automated tests are usually unnecessary unless the docs describe behavior you need to verify.

## Test And Validation Notes

- `src/App.test.tsx` covers practice locking, exam editability, neutral navigator styling, keyboard shortcuts, shortcut preferences, visible badges, help overlay behavior, and responsive shortcut dialog CSS.
- `src/scoring.test.ts` covers 21-question selection, topic distribution, difficulty mix, and recent-repeat avoidance.
- `npm run validate:questions` should pass. Known warning-only weak distractor phrases may remain until the next content audit; do not ignore new validation errors.
- The validator expects 120 total questions, 20 per topic, 21 full mock questions, and 24 correct answers for each letter A-E.

## Content Rules

- Each question needs a concrete PM scenario, exactly five choices A-E, one correct choice, a teaching explanation, concept tags, difficulty, and `estimatedSeconds` between 45 and 150.
- Wrong choices should represent realistic PM mistakes: ignoring guardrails, overtrusting aggregates, acting on weak samples, confusing correlation and causation, choosing vanity metrics, cherry-picking, or overreacting to outliers.
- Avoid throwaway distractors such as logo color, app color, number of engineers, hiding charts, or stopping measurement unless the question is specifically about that stakeholder behavior.
- When changing question counts, distribution, difficulty mix, or answer letters, update `src/questions.ts`, `scripts/validate-question-bank.mjs`, tests, and README together.

## Design And Copy Direction

- First screen should be usable immediately: mode, feedback mode, topic if needed, recommended next action, latest attempts, and framework access.
- Favor direct assessment-prep language: set baseline, drill weakest topic, review false confidence, refresh frameworks.
- Keep explanatory copy short and secondary to actions.
- Use existing CSS variables and patterns. Preserve light/dark theme, responsive layouts, accessible focus rings, and reduced-motion support.
- Avoid large decorative heroes, heavy dashboards, gamification, and broad educational content that slows the practice loop.
