# Technical Architecture

## Recommended Stack

Use a simple frontend app:

- Vite.
- React.
- TypeScript.
- Minimal CSS.
- localStorage.

Do not use Next.js before exam day. The app is local, single-user, and does not need routing, SSR, API routes, authentication, or deployment.

## Why Vite

Vite is recommended because:

- Setup is fast.
- Dev server starts quickly.
- Less framework overhead.
- Easier for a one-screen practice app.
- Lower risk before exam day.
- Single-page internal views through React state are enough; do not add React Router before exam day.

## App Shape

The MVP can be a small single-page app with internal views:

- `home`.
- `test`.
- `results`.
- `frameworks`.

No real URL routing is required for MVP. If routing is easy, use it; if it slows the build, keep everything inside `App.tsx`.

## Proposed File Structure

```text
pm-assessment/
  docs/
    mvp/
    superpowers/
      plans/
  src/
    App.tsx
    main.tsx
    styles.css
    types.ts
    questions.ts
    scoring.ts
    storage.ts
    frameworks.ts
  index.html
  package.json
  tsconfig.json
  vite.config.ts
```

## File Responsibilities

### `src/App.tsx`

Owns:

- Current view.
- Current test session state.
- Home screen.
- Test screen.
- Results screen.
- Frameworks screen.
- Event handlers.

This file can be split later, but before exam day it is acceptable for it to hold the small app.

### `src/types.ts`

Owns:

- Topic type.
- Question type.
- Attempt type.
- Session type.
- Result type.

### `src/questions.ts`

Owns:

- Static question bank.
- Topic labels.
- Topic distribution constants.

### `src/scoring.ts`

Owns pure functions:

- `scoreQuestions`.
- `buildQuestionReviews`.
- `getWrongReviewsByPriority`.
- `getWeakestTopic`.
- `selectFullMockQuestions`.
- `selectTopicQuestions`.

### `src/storage.ts`

Owns:

- `loadAttempts`.
- `saveAttempt`.

### `src/frameworks.ts`

Owns:

- One static framework markdown string.

### `src/styles.css`

Owns:

- App layout.
- Buttons.
- Cards.
- Question states.
- Responsive behavior.

## State Management

Use React `useState`.

Do not add:

- Redux.
- Zustand.
- React Query.
- Server state.
- Context unless state passing becomes painful.

## Storage

Use localStorage with one key:

```text
pm-assessment-attempts-v1
```

Store only the last 5 attempts before exam day.

Show only the latest 3 attempts on the Home view.

## Styling

Use minimal CSS.

Visual style:

- Calm.
- Dense enough for practice.
- No marketing hero.
- No gradients or decorative backgrounds.
- Clear contrast.
- Readable under time pressure.

## Timer Behavior

Timer can be implemented with `setInterval` inside a `useEffect`.

Rules:

- Full Mock default = 30 minutes.
- Topic Drill default = number of questions × 90 seconds.
- Timer stops after submission.
- Timer cleanup must run on unmount, view change, and submission.
- If timer hits zero, always auto-submit.
- Submit should be idempotent so duplicate timer/user submit events do not save duplicate attempts.

## Question Selection

Full Mock selection should:

- Group questions by topic.
- Shuffle the topic-filtered questions.
- Slice the required number from `FULL_MOCK_DISTRIBUTION`.

Topic Drill selection should:

- Filter by selected topic.
- Shuffle the filtered questions.
- Use up to 10 questions.

Do not rely on deterministic `.slice(0, needed)` selection before exam day. It makes repeat mocks test memorization instead of reasoning.

Choice order can remain stable for the first build. Shuffle answer choices only after the app is stable because rushed choice shuffling can introduce scoring bugs.

## Browser Support

Only needs to work in Edward's local browser before exam day.

Target:

- Latest Chrome or Safari on macOS.

## Development Commands

Expected commands after scaffold:

```bash
npm install
npm run dev
npm run build
```

Optional test command:

```bash
npm test
```

Only add tests if they do not slow the build.

## Technical Acceptance Criteria

- App starts locally.
- No runtime errors in console during core flows.
- localStorage persists attempts after reload.
- Scoring is deterministic and correct.
- The app remains usable on a laptop screen.
