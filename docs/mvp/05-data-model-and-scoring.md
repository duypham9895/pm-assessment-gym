# Data Model And Scoring

## Topics

```ts
export type Topic =
  | "product_analytics"
  | "data_literacy"
  | "chart_interpretation"
  | "inductive_reasoning"
  | "data_interpretation"
  | "ab_testing";
```

## Topic Labels

```ts
export const TOPIC_LABELS: Record<Topic, string> = {
  product_analytics: "Product Analytics",
  data_literacy: "Data Literacy",
  chart_interpretation: "Chart Interpretation",
  inductive_reasoning: "Inductive Reasoning",
  data_interpretation: "Data Interpretation",
  ab_testing: "A/B Testing",
};
```

## Question Type

```ts
export type ChoiceId = "A" | "B" | "C" | "D" | "E";
export type Confidence = 1 | 2 | 3;

export type AnswerRecord = {
  choiceId: ChoiceId;
  confidence: Confidence;
};

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
```

## Session Type

```ts
export type SessionMode = "full_mock" | "topic_drill";
export type FeedbackMode = "exam" | "practice";

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
```

## Attempt Type

```ts
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

## Score Summary

```ts
export type ScoreSummary = {
  correctCount: number;
  totalCount: number;
  percent: number;
  topicBreakdown: Partial<Record<Topic, TopicScore>>;
  weakestTopic?: Topic;
};

export type TopicScore = {
  correct: number;
  total: number;
  percent: number;
};
```

## Question Review

```ts
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
```

## Full Mock Topic Distribution

The full mock should match the boss skill:

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

Total = 21 questions.

## Scoring Rules

### Total Score

```text
correctCount = number of questions where answer.choiceId === correctChoiceId
totalCount = number of questions in attempt
percent = Math.round((correctCount / totalCount) * 100)
```

Unanswered questions count as incorrect.

### Topic Breakdown

For each topic:

```text
topic.correct = correct answers in topic
topic.total = attempted questions in topic
topic.percent = Math.round((topic.correct / topic.total) * 100)
```

If a topic has no questions in a drill, it can be omitted or shown as `0/0`.

### Weakest Topic

Before exam day, avoid complex weak-topic math.

Use this rule:

```text
weakestTopic = topic with the most wrong answers
```

Tie-breakers:

1. Lower percent.
2. More questions in topic.
3. First topic in fixed topic order.

Do not use a readiness formula before exam day.

## Question Selection Rules

### Full Mock

Selection should:

1. Group questions by topic.
2. Shuffle the topic-filtered questions.
3. Select the required number per topic from `FULL_MOCK_DISTRIBUTION`.
4. If not enough questions exist for a topic, use all available and show a console warning.

Before exam day, deterministic selection is not acceptable because repeated mocks become memorization practice.

### Topic Drill

Selection should:

1. Filter questions by selected topic.
2. Shuffle the filtered questions.
3. Use up to 10 questions.
4. If fewer than 10 exist, use all available.

### Choice Order

Choice order can stay stable for the first MVP build.

Shuffle answer choices only after the core flow is stable. If choices are shuffled, keep scoring tied to `choice.id`, not array index.

## Review Generation

Do not store full question review text inside each attempt.

Store:

- `questionIds`.
- `answers`.
- `score`.

When displaying Results, reconstruct reviews from the current question bank. This keeps localStorage small and avoids duplicated prompt/explanation data.

## Confidence Review Rules

Each answer should include confidence:

- `1`: guessing.
- `2`: unsure.
- `3`: confident.

Results should sort wrong answers by:

1. Wrong with confidence `3`.
2. Wrong with confidence `2`.
3. Wrong with confidence `1`.

This makes false confidence visible quickly.

## localStorage Shape

Key:

```text
pm-assessment-attempts-v1
```

Value:

```ts
type StoredAttempts = Attempt[];
```

Storage rules:

- Save newest attempt first.
- Keep only 5 attempts.
- Show only the latest 3 attempts on the Home view.
- If parsing fails, return an empty array.

## Validation Rules

Before a question enters the bank:

- Must have exactly 5 choices.
- Must have one correct choice.
- Correct choice must exist in choices.
- Must have at least one concept tag.
- Must have an explanation.
- Must have a topic.

## Minimum Scoring Tests

If tests are added, test these:

1. Perfect score returns 100 percent.
2. Unanswered question counts as incorrect.
3. Topic breakdown totals match selected questions.
4. Weakest topic is topic with most wrong answers.
5. localStorage keeps only last 5 attempts.
6. Wrong-and-confident answers sort before other wrong answers in review.
