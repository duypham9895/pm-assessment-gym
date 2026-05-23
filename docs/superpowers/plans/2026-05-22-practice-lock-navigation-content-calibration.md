# Practice Lock, Navigator, And Content Calibration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the observed quiz-use issues by locking revealed practice answers, making the question navigator status neutral, and recalibrating full mocks to better match the Alvin Alooba-style skill.

**Architecture:** Keep the current single-page Vite React app. Add small pure selection helpers in `src/scoring.ts`, keep question configuration in `src/questions.ts`, add focused automated tests for answer locking and selection rules, and keep visual changes in `src/styles.css`. Avoid broad UI redesign or new product modes.

**Tech Stack:** Vite, React, TypeScript, CSS, localStorage, Vitest, Testing Library.

---

## Scope Guardrails

- Fix the three issues reported from real usage.
- Do not add a new route or dashboard.
- Do not replace the whole question bank in this pass.
- Do not show correct or wrong status in the question navigator.
- Do not make Exam mode immutable before submit.
- Do not remove Practice mode feedback.
- Keep the existing answer confidence scale.
- Update docs and validation when the full mock length changes.

## Root Causes To Address

- `src/App.tsx` lets `selectChoice` overwrite an existing answer after Practice feedback is visible.
- `src/App.tsx` lets keyboard shortcuts call the same overwrite path after Practice feedback is visible.
- `src/App.tsx` lets confidence change after seeing Practice correctness, which makes review priority less trustworthy.
- `src/styles.css` styles `.nav-pill--answered` with success colors, so answered wrong questions look visually correct.
- `src/questions.ts` currently sets a 20-question full mock with A/B Testing at 4 and Chart/Data Interpretation at 3, while Alvin's `alooba-mock-test.skill` uses 21 questions with Chart Interpretation 4, Data Interpretation 4, and A/B Testing 3.
- `src/scoring.ts` samples by topic only; it does not enforce a hard/medium/easy mix.
- `src/scoring.ts` has no recent-repeat avoidance, so repeated attempts can feel stale.
- Some distractors in `src/questions.ts` are too obviously wrong, which makes the bank feel easier than the Alvin skill even when the topic coverage is broad.

## File Structure

- Modify: `package.json` - add test scripts and test dependencies.
- Modify: `vite.config.ts` - configure Vitest jsdom environment.
- Create: `src/test/setup.ts` - Testing Library matcher setup.
- Create: `src/App.test.tsx` - regression tests for answer locking and Exam editability.
- Create: `src/scoring.test.ts` - regression tests for mock length, topic distribution, difficulty mix, and repeat avoidance.
- Modify: `src/App.tsx` - prevent answer/confidence mutation after Practice reveal and pass lock state to UI.
- Modify: `src/styles.css` - make answered navigator pills neutral and keep locked choices visually readable.
- Modify: `src/questions.ts` - align full mock distribution with Alvin and add per-topic difficulty distribution.
- Modify: `src/scoring.ts` - support difficulty-balanced full mock selection and recent-repeat avoidance.
- Modify: `src/storage.ts` - no functional change expected; only read if tests expose attempt-shape issues.
- Modify: `scripts/validate-question-bank.mjs` - validate 21-question Alvin distribution and warn on weak distractor phrases.
- Modify: `README.md` - update visible product claims from 20-question mock to 21-question Alvin-style mock.
- Create: `docs/review/2026-05-22-question-bank-calibration.md` - record the content calibration rubric and first-pass flagged distractors.

---

## Task 1: Add Regression Test Harness

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`

- [x] **Step 1: Install test dependencies**

Run:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Expected: `package.json` and `package-lock.json` include the new dev dependencies.

- [x] **Step 2: Add test scripts**

Modify `package.json` scripts to include:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "validate:questions": "node scripts/validate-question-bank.mjs",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview"
  }
}
```

- [x] **Step 3: Configure Vitest**

Modify `vite.config.ts` to:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
  },
});
```

- [x] **Step 4: Add Testing Library setup**

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [x] **Step 5: Run tests to confirm the harness is active**

Run:

```bash
npm run test
```

Expected: FAIL with "No test files found" or PASS with zero tests, depending on Vitest version. Either result confirms the command runs.

---

## Task 2: Add Failing UI Tests For Answer Locking

**Files:**
- Create: `src/App.test.tsx`

- [x] **Step 1: Create test helpers**

Create `src/App.test.tsx` with:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { QUESTIONS } from "./questions";

function getVisibleQuestion() {
  const heading = screen.getByRole("heading", { level: 1 });
  const question = QUESTIONS.find((candidate) => candidate.prompt === heading.textContent);
  if (!question) {
    throw new Error(`Could not map visible prompt to question: ${heading.textContent}`);
  }
  return question;
}

function getChoiceButton(choiceId: string) {
  return screen.getByRole("button", { name: new RegExp(`^Choice ${choiceId} `) });
}

function getFirstDifferentChoice(choiceId: string) {
  return ["A", "B", "C", "D", "E"].find((candidate) => candidate !== choiceId)!;
}

function getFirstWrongChoice(correctChoiceId: string) {
  return ["A", "B", "C", "D", "E"].find((candidate) => candidate !== correctChoiceId)!;
}

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("App answer locking", () => {
  it("locks a practice answer after feedback is revealed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Practice" }));
    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const question = getVisibleQuestion();
    const wrongChoice = getFirstWrongChoice(question.correctChoiceId);
    const wrongButton = getChoiceButton(wrongChoice);

    await user.click(wrongButton);

    expect(screen.getByText("Incorrect")).toBeInTheDocument();
    expect(wrongButton).toHaveClass("selected");

    await user.click(getChoiceButton(question.correctChoiceId));

    expect(screen.getByText("Incorrect")).toBeInTheDocument();
    expect(wrongButton).toHaveClass("selected");
  });

  it("ignores keyboard answer changes after practice feedback is revealed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Practice" }));
    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const question = getVisibleQuestion();
    const wrongChoice = getFirstWrongChoice(question.correctChoiceId);
    const replacementChoice = getFirstDifferentChoice(wrongChoice);
    const wrongButton = getChoiceButton(wrongChoice);

    await user.click(wrongButton);
    await user.keyboard(String(["A", "B", "C", "D", "E"].indexOf(replacementChoice) + 1));

    expect(wrongButton).toHaveClass("selected");
  });

  it("locks confidence after practice feedback is revealed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Practice" }));
    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const question = getVisibleQuestion();
    const wrongChoice = getFirstWrongChoice(question.correctChoiceId);

    await user.click(screen.getByRole("button", { name: "3 Confident" }));
    await user.click(getChoiceButton(wrongChoice));
    await user.click(screen.getByRole("button", { name: "1 Guessing" }));

    expect(screen.getByRole("button", { name: "3 Confident" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("still allows exam answers to be changed before submit", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const firstChoice = getChoiceButton("A");
    const secondChoice = getChoiceButton("B");

    await user.click(firstChoice);
    expect(firstChoice).toHaveClass("selected");

    await user.click(secondChoice);
    expect(secondChoice).toHaveClass("selected");
    expect(firstChoice).not.toHaveClass("selected");
  });
});
```

- [x] **Step 2: Run UI tests and confirm current failure**

Run:

```bash
npm run test -- src/App.test.tsx
```

Expected before implementation: at least the Practice locking tests FAIL because `selectChoice` currently overwrites the answer.

---

## Task 3: Lock Practice Answers And Confidence

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [x] **Step 1: Add a lock helper**

Add near the other helper functions in `src/App.tsx`:

```ts
function isPracticeAnswerLocked(session: TestSession, questionId: string) {
  return session.feedbackMode === "practice" && Boolean(session.answers[questionId]);
}
```

- [x] **Step 2: Guard `selectChoice`**

Modify `selectChoice` in `src/App.tsx`:

```ts
  const selectChoice = useCallback(
    (choiceId: ChoiceId) => {
      setSession((previous) => {
        if (!previous) return previous;
        const questionId = previous.questionIds[previous.currentQuestionIndex];
        const previousAnswer = previous.answers[questionId];
        if (isPracticeAnswerLocked(previous, questionId)) return previous;

        return {
          ...previous,
          answers: {
            ...previous.answers,
            [questionId]: {
              choiceId,
              confidence: previousAnswer?.confidence ?? confidenceDrafts[questionId] ?? 2,
            },
          },
        };
      });
    },
    [confidenceDrafts]
  );
```

- [x] **Step 3: Guard `setCurrentConfidence`**

Modify the inner `setSession` block in `setCurrentConfidence`:

```ts
      setSession((previous) => {
        if (!previous) return previous;
        const questionId = previous.questionIds[previous.currentQuestionIndex];
        const previousAnswer = previous.answers[questionId];
        if (!previousAnswer) return previous;
        if (isPracticeAnswerLocked(previous, questionId)) return previous;

        return {
          ...previous,
          answers: {
            ...previous.answers,
            [questionId]: {
              ...previousAnswer,
              confidence,
            },
          },
        };
      });
```

- [x] **Step 4: Pass lock state into `TestView`**

Add a prop in `TestViewProps`:

```ts
  isAnswerLocked: boolean;
```

Pass it from `App`:

```tsx
          isAnswerLocked={
            currentQuestion ? isPracticeAnswerLocked(session, currentQuestion.id) : false
          }
```

Destructure it in `TestView`:

```ts
  isAnswerLocked,
```

- [x] **Step 5: Disable locked choices**

Modify each choice button:

```tsx
                disabled={isAnswerLocked}
```

Keep the selected class logic unchanged so the chosen answer remains visible.

- [x] **Step 6: Disable locked confidence buttons**

Modify each confidence button:

```tsx
                disabled={isAnswerLocked}
```

- [x] **Step 7: Keep locked choices readable**

Add to `src/styles.css` near the choice styles:

```css
.choice-button:disabled {
  cursor: not-allowed;
  opacity: 1;
}

.choice-button:disabled:not(.selected):not(.correct):not(.wrong) {
  color: var(--text-muted);
  background: var(--surface-elev);
}

.confidence-options button:disabled {
  cursor: not-allowed;
}
```

- [x] **Step 8: Run UI tests**

Run:

```bash
npm run test -- src/App.test.tsx
```

Expected: PASS.

---

## Task 4: Make Question Navigator Status Neutral

**Files:**
- Modify: `src/styles.css`
- Modify: `src/App.test.tsx`

- [x] **Step 1: Change answered navigator styling**

Replace `.nav-pill--answered` in `src/styles.css` with:

```css
.nav-pill--answered {
  border-color: var(--border);
  color: var(--text);
  background: var(--surface-muted);
}
```

- [x] **Step 2: Keep current state visually distinct**

Keep `.nav-pill--current` unchanged:

```css
.nav-pill--current {
  border-color: var(--accent);
  color: var(--on-accent);
  background: var(--accent);
}
```

- [x] **Step 3: Add a regression test for neutral answered class**

Append this test inside the existing `describe("App answer locking", () => { ... })` block in `src/App.test.tsx`, before the closing `});`:

```tsx
  it("uses neutral answered state in the question navigator", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Practice" }));
    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const question = getVisibleQuestion();
    const wrongChoice = getFirstWrongChoice(question.correctChoiceId);
    await user.click(getChoiceButton(wrongChoice));
    await user.click(screen.getByRole("button", { name: "Next" }));

    const firstNavigatorButton = screen.getByRole("tab", { name: /Question 1, answered/i });
    expect(firstNavigatorButton).toHaveClass("nav-pill--answered");
    expect(firstNavigatorButton).not.toHaveClass("nav-pill--correct");
    expect(firstNavigatorButton).not.toHaveClass("nav-pill--wrong");
  });
```

- [x] **Step 4: Run UI tests**

Run:

```bash
npm run test -- src/App.test.tsx
```

Expected: PASS.

---

## Task 5: Align Full Mock With Alvin Skill

**Files:**
- Modify: `src/questions.ts`
- Modify: `README.md`
- Modify: `scripts/validate-question-bank.mjs`

- [x] **Step 1: Update the topic distribution**

Modify `FULL_MOCK_DISTRIBUTION` in `src/questions.ts`:

```ts
export const FULL_MOCK_DISTRIBUTION: Record<Topic, number> = {
  product_analytics: 4,
  data_literacy: 3,
  chart_interpretation: 4,
  inductive_reasoning: 3,
  data_interpretation: 4,
  ab_testing: 3,
};
```

- [x] **Step 2: Add per-topic difficulty targets**

Add after `FULL_MOCK_DISTRIBUTION`:

```ts
export const FULL_MOCK_DIFFICULTY_DISTRIBUTION: Record<
  Topic,
  Partial<Record<Question["difficulty"], number>>
> = {
  product_analytics: { medium: 3, hard: 1 },
  data_literacy: { medium: 2, hard: 1 },
  chart_interpretation: { medium: 3, hard: 1 },
  inductive_reasoning: { medium: 2, hard: 1 },
  data_interpretation: { easy: 1, medium: 2, hard: 1 },
  ab_testing: { easy: 1, medium: 1, hard: 1 },
};
```

- [x] **Step 3: Update question validator expected length**

Modify `scripts/validate-question-bank.mjs`:

```js
const expectedFullMockLength = 21;
```

- [x] **Step 4: Validate difficulty target sums**

Add after the full mock length validation in `scripts/validate-question-bank.mjs`:

```js
const expectedDifficultyTotal = Object.values(FULL_MOCK_DIFFICULTY_DISTRIBUTION ?? {})
  .flatMap((distribution) => Object.values(distribution))
  .reduce((total, count) => total + count, 0);

if (expectedDifficultyTotal !== expectedFullMockLength) {
  recordError(
    `Expected full mock difficulty distribution to use ${expectedFullMockLength} questions, found ${expectedDifficultyTotal}.`
  );
}
```

Also update the export extraction:

```js
const {
  FULL_MOCK_DIFFICULTY_DISTRIBUTION,
  FULL_MOCK_DISTRIBUTION,
  QUESTIONS,
  TOPIC_ORDER,
} = sandbox.module.exports;
```

- [x] **Step 5: Update README claims**

Change README feature bullets and mode copy:

```md
- 21-question Alvin-style mock with a 30-minute timer and auto-submit
```

```md
- **Full Mock** - 21 questions across all topics, 30 minute timer, exam-style feedback at the end.
```

- [x] **Step 6: Run question validation**

Run:

```bash
npm run validate:questions
```

Expected before scoring updates: validation should PASS once the script can load the new distribution exports.

---

## Task 6: Add Difficulty-Balanced And No-Repeat Selection

**Files:**
- Modify: `src/scoring.ts`
- Modify: `src/App.tsx`
- Create: `src/scoring.test.ts`

- [x] **Step 1: Add failing scoring tests**

Create `src/scoring.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import {
  FULL_MOCK_DIFFICULTY_DISTRIBUTION,
  FULL_MOCK_DISTRIBUTION,
  QUESTIONS,
  TOPIC_ORDER,
} from "./questions";
import { selectFullMockQuestions } from "./scoring";

function countBy<T extends string>(items: T[]) {
  return items.reduce(
    (counts, item) => ({ ...counts, [item]: (counts[item] ?? 0) + 1 }),
    {} as Record<T, number>
  );
}

describe("selectFullMockQuestions", () => {
  it("selects the Alvin-style 21 question topic distribution", () => {
    const selected = selectFullMockQuestions(QUESTIONS);
    const topicCounts = countBy(selected.map((question) => question.topic));

    expect(selected).toHaveLength(21);
    for (const topic of TOPIC_ORDER) {
      expect(topicCounts[topic]).toBe(FULL_MOCK_DISTRIBUTION[topic]);
    }
  });

  it("selects the configured difficulty mix", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.42);

    const selected = selectFullMockQuestions(QUESTIONS);
    const difficultyCounts = countBy(selected.map((question) => question.difficulty));
    const expectedDifficultyCounts = Object.values(FULL_MOCK_DIFFICULTY_DISTRIBUTION)
      .flatMap((distribution) => Object.entries(distribution))
      .reduce(
        (counts, [difficulty, count]) => ({
          ...counts,
          [difficulty]: (counts[difficulty] ?? 0) + count,
        }),
        {} as Record<string, number>
      );

    expect(difficultyCounts).toEqual(expectedDifficultyCounts);
  });

  it("prefers fresh questions before falling back to recent questions", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.42);

    const recentQuestionIds = new Set(
      QUESTIONS.filter((question) => question.topic === "product_analytics")
        .slice(0, 4)
        .map((question) => question.id)
    );

    const selected = selectFullMockQuestions(QUESTIONS, { recentQuestionIds });
    const selectedIds = new Set(selected.map((question) => question.id));

    for (const questionId of recentQuestionIds) {
      expect(selectedIds.has(questionId)).toBe(false);
    }
  });
});
```

- [x] **Step 2: Run scoring tests and confirm failure**

Run:

```bash
npm run test -- src/scoring.test.ts
```

Expected before implementation: the difficulty mix and no-repeat tests FAIL.

- [x] **Step 3: Import difficulty distribution**

Modify the import in `src/scoring.ts`:

```ts
import {
  FULL_MOCK_DIFFICULTY_DISTRIBUTION,
  FULL_MOCK_DISTRIBUTION,
  TOPIC_ORDER,
} from "./questions";
```

- [x] **Step 4: Add selection options type**

Add near the imports in `src/scoring.ts`:

```ts
type SelectionOptions = {
  recentQuestionIds?: Set<string>;
};
```

- [x] **Step 5: Add helper to prefer fresh candidates**

Add after `shuffle`:

```ts
function preferFreshQuestions(
  questions: Question[],
  recentQuestionIds: Set<string> | undefined
) {
  if (!recentQuestionIds || recentQuestionIds.size === 0) return questions;

  const freshQuestions = questions.filter((question) => !recentQuestionIds.has(question.id));
  const recentQuestions = questions.filter((question) => recentQuestionIds.has(question.id));
  return [...freshQuestions, ...recentQuestions];
}
```

- [x] **Step 6: Add difficulty picker**

Add after `preferFreshQuestions`:

```ts
function selectQuestionsByDifficulty(
  topicQuestions: Question[],
  topic: Topic,
  recentQuestionIds: Set<string> | undefined
) {
  const difficultyDistribution = FULL_MOCK_DIFFICULTY_DISTRIBUTION[topic];
  const topicTargetCount = Object.values(difficultyDistribution).reduce(
    (sum, count) => sum + count,
    0
  );
  const selected: Question[] = [];
  const selectedIds = new Set<string>();

  for (const difficulty of ["hard", "medium", "easy"] as Question["difficulty"][]) {
    const needed = difficultyDistribution[difficulty] ?? 0;
    if (needed === 0) continue;

    const candidates = preferFreshQuestions(
      shuffle(topicQuestions.filter((question) => question.difficulty === difficulty)),
      recentQuestionIds
    );

    for (const question of candidates) {
      if (selected.length >= topicTargetCount) break;
      if (selectedIds.has(question.id)) continue;
      if (selected.filter((item) => item.difficulty === difficulty).length >= needed) break;
      selected.push(question);
      selectedIds.add(question.id);
    }
  }

  return selected;
}
```

- [x] **Step 7: Use difficulty picker in full mock selection**

Replace `selectFullMockQuestions` in `src/scoring.ts`:

```ts
export function selectFullMockQuestions(
  questions: Question[],
  options: SelectionOptions = {}
): Question[] {
  const selected = TOPIC_ORDER.flatMap((topic) => {
    const needed = FULL_MOCK_DISTRIBUTION[topic];
    const topicQuestions = questions.filter((question) => question.topic === topic);

    if (topicQuestions.length < needed) {
      console.warn(
        `Only ${topicQuestions.length} ${topic} questions available; expected ${needed}.`
      );
    }

    const difficultySelected = selectQuestionsByDifficulty(
      topicQuestions,
      topic,
      options.recentQuestionIds
    );

    if (difficultySelected.length >= needed) {
      return difficultySelected.slice(0, needed);
    }

    const fallbackCandidates = preferFreshQuestions(shuffle(topicQuestions), options.recentQuestionIds);
    const selectedIds = new Set(difficultySelected.map((question) => question.id));
    const fallbackSelected = fallbackCandidates.filter((question) => !selectedIds.has(question.id));

    return [...difficultySelected, ...fallbackSelected].slice(0, needed);
  });

  return shuffle(selected);
}
```

- [x] **Step 8: Pass recent attempts from `App`**

Modify `startSession` in `src/App.tsx`:

```ts
      const recentQuestionIds = new Set(
        attempts.slice(0, 3).flatMap((attempt) => attempt.questionIds)
      );
      const nextQuestions =
        nextMode === "full_mock"
          ? selectFullMockQuestions(QUESTIONS, { recentQuestionIds })
          : selectTopicQuestions(QUESTIONS, nextTopic);
```

Update the `startSession` dependency array:

```ts
    [attempts, selectedFeedbackMode, selectedMode, selectedTopic]
```

- [x] **Step 9: Run scoring tests**

Run:

```bash
npm run test -- src/scoring.test.ts
```

Expected: PASS.

---

## Task 7: Add Weak-Distractor Warnings And First Content Fixes

**Files:**
- Modify: `scripts/validate-question-bank.mjs`
- Modify: `src/questions.ts`
- Create: `docs/review/2026-05-22-question-bank-calibration.md`

- [x] **Step 1: Add weak distractor warning phrases**

Add near the constants in `scripts/validate-question-bank.mjs`:

```js
const weakDistractorPhrases = [
  "app's color palette",
  "logo color",
  "number of engineers",
  "number of app store reviews",
  "hide",
  "stop measuring",
  "ignore the chart",
];
```

- [x] **Step 2: Warn on weak distractors**

Add inside the question loop after duplicate choice text validation:

```js
    for (const choice of question.choices) {
      const normalizedChoice = choice.text.trim().toLowerCase();
      for (const phrase of weakDistractorPhrases) {
        if (normalizedChoice.includes(phrase)) {
          recordWarning(`${question.id} has a weak distractor phrase: "${phrase}".`);
        }
      }
    }
```

- [x] **Step 3: Replace the known weak `dl-005` distractors**

Modify `dl-005` in `src/questions.ts`:

```ts
    choices: [
      { id: "A", text: "Base rates and the false positive burden on operations." },
      { id: "B", text: "Only recall, because catching most fraud is enough to judge success." },
      { id: "C", text: "Only total alert volume, because more alerts always means more fraud found." },
      { id: "D", text: "Week-over-week flagged transactions without normalizing by transaction volume." },
      { id: "E", text: "Whether the model score improved on the training data only." },
    ],
```

- [x] **Step 4: Create content calibration note**

Create `docs/review/2026-05-22-question-bank-calibration.md`:

```md
# Question Bank Calibration Notes

Date: 2026-05-22

## Goal

Make PM Assessment Gym feel closer to Alvin's Alooba-style Senior PM mock: concrete scenarios, specific numbers, 45-90 second reasoning, one correct answer, and plausible-but-wrong distractors.

## Alvin Skill Calibration

- Full mock length: 21 questions.
- Product Analytics: 4.
- Data Literacy: 3.
- Chart Interpretation: 4.
- Inductive Reasoning: 3.
- Data Interpretation: 4.
- A/B Testing: 3.
- Wrong-answer review should explain why the correct answer is right and why the chosen answer fails.

## Distractor Quality Rule

Each wrong answer should represent a common PM mistake:

- Optimizing a top-line metric while ignoring guardrails.
- Trusting aggregate data while missing cohort or segment mix.
- Acting on a statistically weak signal.
- Confusing correlation with causation.
- Picking a vanity or activity metric instead of a value metric.
- Changing metrics after seeing results.
- Overreacting to one sample, one outlier, or one chart.

## Weak Distractor Rule

Avoid joke or throwaway options such as logo color, app color, number of engineers, hiding the chart, or stopping measurement unless the question is explicitly about stakeholder behavior. These options make the correct answer too obvious.

## First-Pass Fixes

- `dl-005`: replaced joke distractors with plausible model-evaluation mistakes around recall, alert volume, normalization, and training data.

## Next Audit Pass

Audit 20 questions per pass. For each question, mark:

- `keep`: all distractors are plausible.
- `rewrite-distractors`: correct concept is good but wrong answers are too easy.
- `rewrite-question`: prompt is too vague, too easy, or has ambiguous answers.
- `replace`: question does not match the Alvin PM assessment shape.
```

- [x] **Step 5: Run question validation**

Run:

```bash
npm run validate:questions
```

Expected: PASS, with warnings allowed for remaining weak distractors.

---

## Task 8: Full Verification

**Files:**
- Read-only verification across app.

- [x] **Step 1: Run all automated checks**

Run:

```bash
npm run test
npm run validate:questions
npm run build
```

Expected: all commands PASS.

- [x] **Step 2: Manual check Practice locking**

Run:

```bash
npm run dev
```

Open the Vite URL. In Practice mode:

1. Start a full mock.
2. Choose a wrong answer.
3. Confirm feedback appears.
4. Try clicking the correct answer.
5. Try pressing `1` to `5`.
6. Try changing confidence.

Expected: original selected answer and confidence stay unchanged after feedback appears.

- [x] **Step 3: Manual check Exam editability**

In Exam mode:

1. Start a full mock.
2. Choose one answer.
3. Choose a different answer on the same question.

Expected: answer changes before submit.

- [x] **Step 4: Manual check navigator**

In Practice mode:

1. Answer a question incorrectly.
2. Move to the next question.
3. Look at the first question in the navigator.

Expected: answered question has one neutral answered color, not green/red correctness coloring.

- [x] **Step 5: Manual check Alvin-style mock**

Start a Full Mock and confirm:

1. Question count is 21.
2. Timer is 30 minutes.
3. Topic distribution follows 4/3/4/3/4/3.
4. Questions include a harder mix, not mostly easy recall.

Expected: the mock feels closer to Alvin's chat skill and less like a simple quiz.

---

## Commit Plan

- [x] **Commit 1: Test harness**

```bash
git add package.json package-lock.json vite.config.ts src/test/setup.ts
git commit -m "test: add app regression test harness"
```

- [x] **Commit 2: Practice locking and navigator fix**

```bash
git add src/App.tsx src/App.test.tsx src/styles.css
git commit -m "fix: lock practice answers after feedback"
```

- [x] **Commit 3: Alvin mock calibration**

```bash
git add src/questions.ts src/scoring.ts src/scoring.test.ts scripts/validate-question-bank.mjs README.md
git commit -m "feat: calibrate full mock selection"
```

- [x] **Commit 4: Content calibration notes**

```bash
git add docs/review/2026-05-22-question-bank-calibration.md
git commit -m "docs: record question bank calibration rubric"
```

---

## Done Criteria

- Practice mode answer cannot be changed after feedback appears.
- Practice mode keyboard shortcuts cannot change a revealed answer.
- Practice mode confidence cannot change after feedback appears.
- Exam mode answers remain editable before submit.
- Navigator uses neutral answered styling only.
- Full Mock uses 21 questions.
- Full Mock matches Alvin topic distribution: 4/3/4/3/4/3.
- Full Mock selection uses the configured difficulty distribution.
- Full Mock avoids recent questions when enough fresh questions exist.
- Question validation passes.
- Build passes.
- The first weak-distractor cleanup is recorded and at least `dl-005` is fixed.
