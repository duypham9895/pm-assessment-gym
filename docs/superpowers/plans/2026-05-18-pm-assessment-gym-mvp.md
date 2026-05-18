# PM Assessment Gym MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small local PM assessment practice app that Edward can use before the, 2026-05-22 interview.

**Architecture:** Use a Vite React TypeScript single-page app with minimal CSS, static question data, pure scoring functions, shuffled question selection, answer confidence ratings, and localStorage for the last 5 attempts. Keep all pre-exam day behavior in a small set of files so the app is fast to build and easy to debug.

**Tech Stack:** Vite, React, TypeScript, CSS, localStorage.

---

## Build Constraints

- Do not build post-exam day features.
- Do not add authentication.
- Do not add database.
- Do not add AI feedback.
- Do not add React Router before exam day.
- Do not add flag-for-review.
- Do not add a question navigator grid.
- Do not add a countdown widget.
- Prioritize usable practice over polish.

## Files

- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/types.ts`
- Create: `src/questions.ts`
- Create: `src/scoring.ts`
- Create: `src/storage.ts`
- Create: `src/frameworks.ts`

## Task 0: Baseline And Content Prep

**Files:**
- Reference: `docs/mvp/06-content-authoring-plan.md`
- Later modify: `src/questions.ts`

- [ ] **Step 1: Take baseline mock before coding**

Run one baseline mock using the boss skill in chat:

`/Users/edwardpham/Documents/PM/Interview/Mock/alooba-mock-test.skill`

Record:

- Total score.
- Score by topic.
- Top 2 weak topics.
- Concepts that felt unfamiliar.

- [ ] **Step 2: Draft first 10 to 15 questions**

Use the boss skill or another LLM to draft candidate questions in the boss-skill style.

Target distribution for the first draft:

- Product Analytics: 3.
- Data Literacy: 2.
- Chart Interpretation: 3.
- Inductive Reasoning: 2.
- Data Interpretation: 3.
- A/B Testing: 3.

- [ ] **Step 3: Rewrite candidates by hand**

For each question:

- Make the scenario concrete.
- Keep it answerable in 45 to 90 seconds.
- Make exactly one answer correct.
- Make wrong answers represent common PM mistakes.
- Add 1 to 3 concept tags.
- Write an explanation that teaches the mental model.

- [ ] **Step 4: Continue content until the app has at least 21 validated questions**

Final minimum distribution:

- Product Analytics: 4.
- Data Literacy: 3.
- Chart Interpretation: 4.
- Inductive Reasoning: 3.
- Data Interpretation: 4.
- A/B Testing: 3.

Better target before Wednesday:

- 30 total questions.

## Task 1: Scaffold Vite React TypeScript App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/styles.css`
- Create: `src/App.tsx`

- [ ] **Step 1: Initialize project files**

Create a Vite React TypeScript app in the current folder.

Use this package shape:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: Add root HTML**

`index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PM Assessment Gym</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Add React entry**

`src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Add temporary App**

`src/App.tsx`:

```tsx
export default function App() {
  return <main className="app-shell">PM Assessment Gym</main>;
}
```

- [ ] **Step 5: Run dev server**

Run:

```bash
npm install
npm run dev
```

Expected:

- Vite starts.
- Browser shows `PM Assessment Gym`.

## Task 2: Add Core Types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Define shared types**

`src/types.ts`:

```ts
export type Topic =
  | "product_analytics"
  | "data_literacy"
  | "chart_interpretation"
  | "inductive_reasoning"
  | "data_interpretation"
  | "ab_testing";

export type ChoiceId = "A" | "B" | "C" | "D" | "E";
export type Confidence = 1 | 2 | 3;

export type AnswerRecord = {
  choiceId: ChoiceId;
  confidence: Confidence;
};

export type SessionMode = "full_mock" | "topic_drill";
export type FeedbackMode = "exam" | "practice";

export type Question = {
  id: string;
  topic: Topic;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  choices: {
    id: ChoiceId;
    text: string;
  }[];
  correctChoiceId: ChoiceId;
  explanation: string;
  conceptTags: string[];
  estimatedSeconds: number;
};

export type TestSession = {
  id: string;
  mode: SessionMode;
  feedbackMode: FeedbackMode;
  topicFilter?: Topic;
  startedAt: string;
  timeLimitSeconds: number;
  questionIds: string[];
  answers: Record<string, AnswerRecord>;
  currentQuestionIndex: number;
};

export type TopicScore = {
  correct: number;
  total: number;
  percent: number;
};

export type ScoreSummary = {
  correctCount: number;
  totalCount: number;
  percent: number;
  topicBreakdown: Partial<Record<Topic, TopicScore>>;
  weakestTopic?: Topic;
};

export type QuestionReview = {
  questionId: string;
  topic: Topic;
  prompt: string;
  chosenChoiceId?: ChoiceId;
  confidence?: Confidence;
  correctChoiceId: ChoiceId;
  isCorrect: boolean;
  explanation: string;
  conceptTags: string[];
};

export type Attempt = {
  id: string;
  sessionId: string;
  mode: SessionMode;
  feedbackMode: FeedbackMode;
  topicFilter?: Topic;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  questionIds: string[];
  answers: Record<string, AnswerRecord>;
  score: ScoreSummary;
};
```

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected:

- TypeScript compiles.

## Task 3: Add Question Bank

**Files:**
- Create: `src/questions.ts`

- [ ] **Step 1: Add topic metadata**

`src/questions.ts`:

```ts
import type { Question, Topic } from "./types";

export const TOPIC_LABELS: Record<Topic, string> = {
  product_analytics: "Product Analytics",
  data_literacy: "Data Literacy",
  chart_interpretation: "Chart Interpretation",
  inductive_reasoning: "Inductive Reasoning",
  data_interpretation: "Data Interpretation",
  ab_testing: "A/B Testing",
};

export const TOPIC_ORDER: Topic[] = [
  "product_analytics",
  "data_literacy",
  "chart_interpretation",
  "inductive_reasoning",
  "data_interpretation",
  "ab_testing",
];

export const FULL_MOCK_DISTRIBUTION: Record<Topic, number> = {
  product_analytics: 4,
  data_literacy: 3,
  chart_interpretation: 4,
  inductive_reasoning: 3,
  data_interpretation: 4,
  ab_testing: 3,
};

export const QUESTIONS: Question[] = [
  // Add validated PM assessment questions here.
];
```

- [ ] **Step 2: Add at least 21 validated questions**

Use the content created in Task 0.

Minimum required:

- Product Analytics: 4.
- Data Literacy: 3.
- Chart Interpretation: 4.
- Inductive Reasoning: 3.
- Data Interpretation: 4.
- A/B Testing: 3.

- [ ] **Step 3: Validate each question**

Each question must have:

- Exactly 5 choices.
- A correct choice that exists in the choices.
- Explanation.
- At least one concept tag.
- Estimated seconds.

## Task 4: Add Scoring, Review, And Selection Functions

**Files:**
- Create: `src/scoring.ts`

- [ ] **Step 1: Add shuffle utility**

```ts
export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
```

- [ ] **Step 2: Implement question selection**

```ts
import { FULL_MOCK_DISTRIBUTION, TOPIC_ORDER } from "./questions";
import type {
  AnswerRecord,
  Question,
  QuestionReview,
  ScoreSummary,
  Topic,
} from "./types";

export function selectFullMockQuestions(questions: Question[]): Question[] {
  return TOPIC_ORDER.flatMap((topic) => {
    const needed = FULL_MOCK_DISTRIBUTION[topic];
    const topicQuestions = questions.filter((question) => question.topic === topic);
    return shuffle(topicQuestions).slice(0, needed);
  });
}

export function selectTopicQuestions(questions: Question[], topic: Topic, limit = 10): Question[] {
  return shuffle(questions.filter((question) => question.topic === topic)).slice(0, limit);
}
```

- [ ] **Step 3: Implement scoring**

```ts
export function scoreQuestions(
  selectedQuestions: Question[],
  answers: Record<string, AnswerRecord>
): ScoreSummary {
  const topicBreakdown: ScoreSummary["topicBreakdown"] = {};
  let correctCount = 0;

  for (const question of selectedQuestions) {
    const answer = answers[question.id];
    const isCorrect = answer?.choiceId === question.correctChoiceId;

    if (isCorrect) correctCount += 1;

    const current = topicBreakdown[question.topic] ?? { correct: 0, total: 0, percent: 0 };
    current.total += 1;
    if (isCorrect) current.correct += 1;
    current.percent = Math.round((current.correct / current.total) * 100);
    topicBreakdown[question.topic] = current;
  }

  return {
    correctCount,
    totalCount: selectedQuestions.length,
    percent:
      selectedQuestions.length > 0
        ? Math.round((correctCount / selectedQuestions.length) * 100)
        : 0,
    topicBreakdown,
    weakestTopic: getWeakestTopic(topicBreakdown),
  };
}
```

- [ ] **Step 4: Implement weakest-topic detection**

```ts
export function getWeakestTopic(
  topicBreakdown: ScoreSummary["topicBreakdown"]
): Topic | undefined {
  let weakest: Topic | undefined;
  let mostWrong = -1;
  let lowestPercent = 101;

  for (const topic of TOPIC_ORDER) {
    const score = topicBreakdown[topic];
    if (!score || score.total === 0) continue;

    const wrong = score.total - score.correct;
    if (wrong > mostWrong || (wrong === mostWrong && score.percent < lowestPercent)) {
      weakest = topic;
      mostWrong = wrong;
      lowestPercent = score.percent;
    }
  }

  return weakest;
}
```

- [ ] **Step 5: Implement review generation**

```ts
export function buildQuestionReviews(
  selectedQuestions: Question[],
  answers: Record<string, AnswerRecord>
): QuestionReview[] {
  return selectedQuestions.map((question) => {
    const answer = answers[question.id];
    return {
      questionId: question.id,
      topic: question.topic,
      prompt: question.prompt,
      chosenChoiceId: answer?.choiceId,
      confidence: answer?.confidence,
      correctChoiceId: question.correctChoiceId,
      isCorrect: answer?.choiceId === question.correctChoiceId,
      explanation: question.explanation,
      conceptTags: question.conceptTags,
    };
  });
}
```

- [ ] **Step 6: Implement wrong-answer priority sorting**

```ts
export function getWrongReviewsByPriority(reviews: QuestionReview[]): QuestionReview[] {
  return reviews
    .filter((review) => !review.isCorrect)
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
}
```

- [ ] **Step 7: Run build**

Run:

```bash
npm run build
```

Expected:

- No TypeScript errors.

## Task 5: Add localStorage Attempt Store

**Files:**
- Create: `src/storage.ts`

- [ ] **Step 1: Implement storage functions**

```ts
import type { Attempt } from "./types";

const ATTEMPTS_KEY = "pm-assessment-attempts-v1";
const MAX_ATTEMPTS = 5;

export function loadAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: Attempt): Attempt[] {
  const attempts = [attempt, ...loadAttempts()].slice(0, MAX_ATTEMPTS);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  return attempts;
}
```

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected:

- No TypeScript errors.

## Task 6: Add Framework Content

**Files:**
- Create: `src/frameworks.ts`

- [ ] **Step 1: Add one markdown string**

```ts
export const FRAMEWORKS_MARKDOWN = `
# PM Assessment Frameworks

## Funnel Diagnosis
- Find which step changed first: visit, signup, activation, purchase, repeat.
- Compare rates before counts; denominator changes can hide the real issue.
- Segment by platform, geography, acquisition channel, and user cohort.

## Cohort Retention
- Compare users by start period, not only total active users.
- Separate acquisition growth from retained usage.
- Look for whether newer cohorts are healthier or weaker than older cohorts.

## A/B Testing
- Start with hypothesis, primary metric, guardrails, sample size, and decision rule.
- Check sample ratio mismatch before trusting p-values.
- Separate statistical significance from business significance.

## MDE And Power
- Small effects require larger samples.
- An underpowered test can miss a real effect.
- Choose MDE based on business relevance, not only what is easy to detect.

## Simpson's Paradox
- Overall trend can reverse inside important segments.
- Always compare segment mix before making a causal claim.
- Do not trust aggregate conversion if traffic composition changed.

## Prioritization
- Use impact, confidence, and effort as the minimum decision frame.
- Tie priority to the product goal or North Star metric.
- Name tradeoffs and risks instead of pretending every option is equal.
`;
```

## Task 7A: Build Home View And Session Start

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add app state**

`App.tsx` should manage:

- `view`: `"home" | "test" | "results" | "frameworks"`.
- `attempts`.
- `session`.
- `selectedQuestions`.
- `latestAttempt`.
- Selected mode.
- Selected feedback mode.
- Selected topic.

- [ ] **Step 2: Build Home view**

Home must show:

- App title.
- Mode selector: Full Mock or Topic Drill.
- Feedback selector: Exam or Practice.
- Topic selector if Topic Drill is selected.
- Start button.
- Latest 3 attempts.
- Frameworks button.

- [ ] **Step 3: Build session start handler**

When the user starts:

- Select questions with `selectFullMockQuestions` or `selectTopicQuestions`.
- Create a `TestSession`.
- Set timer:
  - Full Mock: 30 minutes.
  - Topic Drill: question count times 90 seconds.
- Move to `test` view.

## Task 7B: Build Test View Without Practice Feedback

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Render current question**

Test view must show:

- Timer.
- `Q3 / 21` counter.
- Topic label.
- Prompt.
- Five answer choices.
- Confidence control.
- Previous and Next buttons.
- Submit button.

- [ ] **Step 2: Implement answer selection**

When a user selects a choice:

- Save `{ choiceId, confidence }`.
- If confidence is not set, default to `2`.

- [ ] **Step 3: Implement confidence selection**

The confidence control must support:

- `1 Guessing`.
- `2 Unsure`.
- `3 Confident`.

Changing confidence should update the current question's answer record without clearing the chosen answer.

- [ ] **Step 4: Implement navigation**

Rules:

- Previous disabled on first question.
- Next disabled on last question.
- Answers persist when navigating.

- [ ] **Step 5: Add keyboard shortcuts**

Add key handling:

- `1` selects A.
- `2` selects B.
- `3` selects C.
- `4` selects D.
- `5` selects E.

## Task 7C: Add Timer And Submit Behavior

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add timer effect with cleanup**

Timer rules:

- Use `setInterval` inside `useEffect`.
- Decrement once per second while `view === "test"`.
- Clear interval on unmount, view change, and submission.

- [ ] **Step 2: Make submit idempotent**

Submit should do nothing if an attempt has already been created for the current session.

- [ ] **Step 3: Auto-submit on zero**

When remaining seconds reaches zero:

- Submit immediately.
- Save attempt.
- Move to results.

- [ ] **Step 4: Warn about unanswered questions**

Manual submit should warn if questions are unanswered.

The warning should list unanswered question numbers.

## Task 7D: Add Practice Mode Feedback

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Show immediate feedback only in Practice Mode**

If `feedbackMode === "practice"` and the current question has an answer, show:

- Correct or incorrect.
- Correct answer.
- Explanation.

- [ ] **Step 2: Do not auto-advance**

Practice Mode should let the user read the explanation and click Next manually.

- [ ] **Step 3: Prevent feedback leak**

When a new session starts in Exam Mode:

- No immediate correctness feedback should show.
- Old Practice Mode feedback state must not carry over.

## Task 7E: Build Results View

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Build submit result**

On submit:

- Score selected questions.
- Save attempt.
- Build reviews from selected questions and answers.
- Set latest attempt.
- Move to `results`.

- [ ] **Step 2: Render score summary**

Show:

- Raw score.
- Percent.
- Mode.
- Duration.

- [ ] **Step 3: Render topic breakdown**

Show:

- Topic.
- Correct.
- Total.
- Percent.

- [ ] **Step 4: Render wrong-answer review**

Show wrong answers first, sorted by confidence descending.

Each wrong answer shows:

- Prompt.
- User answer.
- Confidence.
- Correct answer.
- Explanation.
- Concept tags.

- [ ] **Step 5: Render correct-answer summary**

Show one line:

`N questions answered correctly (not shown).`

- [ ] **Step 6: Add result actions**

Actions:

- Start another full mock.
- Drill weakest topic.
- Back home.

## Task 7F: Build Frameworks View And CSS

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Render Frameworks view**

Show `FRAMEWORKS_MARKDOWN` as readable static content.

No complex markdown parser is required. A `<pre>` or simple split-by-line renderer is acceptable.

- [ ] **Step 2: Add CSS**

CSS must cover:

- App shell.
- Cards.
- Buttons.
- Segmented controls.
- Choice states.
- Confidence controls.
- Timer.
- Results table.
- Wrong-answer cards.
- Responsive layout.

## Task 8: Verify Core Flows

**Files:**
- No file changes unless bugs are found.

- [ ] **Step 1: Run production build**

Run:

```bash
npm run build
```

Expected:

- Build passes.

- [ ] **Step 2: Manual test Full Mock Exam Mode**

Expected:

- Can answer questions.
- Can set confidence.
- Feedback is hidden.
- Submit shows results.

- [ ] **Step 3: Manual test zero-answer submit**

Expected:

- A fresh submit with no answers scores `0`.
- Unanswered questions count as incorrect.

- [ ] **Step 4: Manual test timer auto-submit**

Expected:

- Timer hitting zero submits once.
- Results page opens.
- No duplicate attempt is saved.

- [ ] **Step 5: Manual test Topic Drill Practice Mode**

Expected:

- Topic filter works.
- Immediate feedback appears.
- Practice feedback does not appear in a new Exam Mode session.

- [ ] **Step 6: Manual test attempt history**

Expected:

- Attempt appears on Home.
- Reload keeps attempts.
- Home shows latest 3 attempts.
- Storage keeps at most 5 attempts.

- [ ] **Step 7: Manual test Frameworks page**

Expected:

- Framework content renders.
- Back navigation works.

## Task 9: Start Dev Server For Practice

**Files:**
- No file changes.

- [ ] **Step 1: Start local server**

Run:

```bash
npm run dev
```

Expected:

- Dev server prints a local URL, usually `http://localhost:5173`.

- [ ] **Step 2: Keep the server available for Edward's practice session**

Do not continue adding features once the core flows work.

## Done Criteria

The MVP is done when:

- App starts locally.
- Full Mock works.
- Topic Drill works.
- Exam Mode hides feedback until submit.
- Practice Mode shows immediate feedback.
- Confidence rating is captured.
- Results show score and explanations.
- Wrong-and-confident answers are prioritized.
- Topic breakdown is correct.
- Latest attempts persist.
- Frameworks page exists.
- Edward can practice without developer help.

## Fallback Trigger

If the app is not usable by Tuesday, 2026-05-19 at 23:00:

- Stop building.
- Use the boss skill directly for mocks.
- Track mistakes in markdown.
- Continue app after the interview.

