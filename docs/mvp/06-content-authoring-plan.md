# Content Authoring Plan

## Why Content Is The Critical Path

The app is only useful if the questions are realistic. A weak question bank makes the app misleading.

Before exam day, content quality matters more than UI polish.

## Minimum Content Needed

### Absolute Minimum

- 20 questions total.
- Exact boss-skill topic distribution:
  - Product Analytics: 4.
  - Data Literacy: 3.
  - Chart Interpretation: 4.
  - Inductive Reasoning: 3.
  - Data Interpretation: 4.
  - A/B Testing: 3.

### Better Target

- 30 questions total.
- Enough for:
  - One full mock.
  - Topic drills for weak areas.
  - Some variety in repeated mocks.

### Strong Target

- 40 questions total.
- Suggested distribution:
  - Product Analytics: 8.
  - Data Literacy: 6.
  - Chart Interpretation: 7.
  - Inductive Reasoning: 5.
  - Data Interpretation: 7.
  - A/B Testing: 7.

## Question Quality Checklist

Each question must have:

- Realistic PM scenario.
- Specific numbers or concrete decision context.
- One clearly correct answer.
- Four plausible wrong answers.
- Explanation.
- Concept tags.
- Difficulty.
- Estimated time.

## Bad Question Pattern

Avoid:

- Pure vocabulary questions.
- "All of the above."
- Trick questions.
- Questions where two answers could be correct.
- Long reading passages.
- Explanations that only repeat the answer.

## Good Question Pattern

Use this shape:

```ts
{
  id: "ab-001",
  topic: "ab_testing",
  difficulty: "medium",
  prompt: "A checkout experiment shows +3.2% conversion with p=0.04, but the treatment group has 18% fewer users than control. What should the PM do first?",
  choices: [
    { id: "A", text: "Ship the variant because p < 0.05." },
    { id: "B", text: "Check for sample ratio mismatch before making a decision." },
    { id: "C", text: "Extend the test until conversion lift reaches 5%." },
    { id: "D", text: "Switch the primary metric to revenue per visitor." },
    { id: "E", text: "Ignore the issue because conversion is statistically significant." }
  ],
  correctChoiceId: "B",
  explanation: "An unexpected imbalance between control and treatment traffic can indicate sample ratio mismatch, which can invalidate the test result. The PM should investigate assignment, logging, or eligibility issues before trusting the p-value.",
  conceptTags: ["sample-ratio-mismatch", "experiment-validity"],
  estimatedSeconds: 75
}
```

## PM-Context Inductive Reasoning Example

Use PM-relevant inference, not only number sequences:

```ts
{
  id: "ir-001",
  topic: "inductive_reasoning",
  difficulty: "medium",
  prompt: "User interviews show new users understand the product value, analytics show 62% drop off during account setup, and support tickets mention verification emails arriving late. Which conclusion is best supported?",
  choices: [
    { id: "A", text: "The product value proposition is unclear." },
    { id: "B", text: "The setup flow likely has an operational or delivery problem worth investigating." },
    { id: "C", text: "The team should redesign the pricing page first." },
    { id: "D", text: "Retention is the primary issue." },
    { id: "E", text: "Users are not in the target segment." }
  ],
  correctChoiceId: "B",
  explanation: "The evidence points to a setup-stage issue, not top-of-funnel value clarity. The best next step is to investigate the verification email and account setup path before changing unrelated surfaces.",
  conceptTags: ["evidence-based-inference", "activation-dropoff"],
  estimatedSeconds: 75
}
```

## Topic Content Guidance

### Product Analytics

Focus areas:

- Funnel diagnosis.
- Activation.
- Retention.
- Cohorts.
- Metric trees.
- North Star vs input metrics.

Example concepts:

- Conversion drop at one funnel step.
- DAU up but retention down.
- Cohort behavior differs from aggregate behavior.
- Feature adoption vs business impact.

### Data Literacy

Focus areas:

- Confidence intervals.
- Sample size.
- Base rates.
- Variance.
- Weighted averages.

Example concepts:

- Small sample noise.
- Average hides distribution.
- Confidence interval interpretation.
- Base rate changes conclusion.

### Chart Interpretation

Focus areas:

- Axis scale.
- Trend vs seasonality.
- Dual-axis charts.
- Rate vs count.
- Cumulative vs daily metrics.

Example concepts:

- Truncated y-axis exaggeration.
- Daily active users vs cumulative users.
- Percent change vs absolute change.
- Segment-mix effects.

### Inductive Reasoning

Focus areas:

- Pattern recognition.
- Table rules.
- Sequence rules.
- Logical inference.

Important note:

Do not make this only IQ-style number puzzles. Include PM-relevant inference where possible, such as choosing the best conclusion from a product research or metrics pattern.

### Data Interpretation

Focus areas:

- Table reading.
- Correlation vs causation.
- Outliers.
- Simpson's paradox.
- Segment comparison.

Example concepts:

- Overall conversion improves while key segment worsens.
- Outlier explains average movement.
- Correlation does not prove campaign impact.

### A/B Testing

Focus areas:

- Hypothesis.
- Primary metric.
- Guardrails.
- MDE.
- Power.
- P-value.
- SRM.
- Novelty effect.
- Early stopping.

Example concepts:

- Significant but tiny lift.
- Guardrail metric regression.
- Underpowered experiment.
- Novelty effect after launch.

## Content Creation Workflow

### Step 1: Generate Candidates

Use the boss skill or another LLM to generate candidate questions in the correct distribution.

### Step 2: Rewrite By Hand

For each question:

- Shorten prompt.
- Make numbers specific.
- Remove ambiguity.
- Make distractors plausible.
- Ensure only one correct answer.

### Step 3: Add Tags

Add 1 to 3 concept tags.

Examples:

- `funnel-diagnosis`
- `cohort-retention`
- `sample-size`
- `confidence-interval`
- `dual-axis-chart`
- `simpsons-paradox`
- `sample-ratio-mismatch`
- `mde`

### Step 4: Validate

Check:

- 5 choices.
- Correct answer exists.
- Explanation is useful.
- Question can be answered in 45 to 90 seconds.

### Step 5: Use In App

Add to `src/questions.ts`.

## Content Priority Before exam day

1. 20-question full mock.
2. Extra A/B Testing questions.
3. Extra Product Analytics questions.
4. Extra Data Interpretation questions.
5. Extra Chart Interpretation questions.
6. Extra Data Literacy questions.
7. Extra Inductive Reasoning questions.

## Pre-exam day Authoring Schedule

### Monday Night

- Take one baseline mock using the boss skill in chat.
- Record score by topic.
- Draft 10 to 15 candidate questions.
- Rewrite the best candidates by hand.

### Tuesday

- Finish enough questions to reach at least 20.
- If possible, reach 30 questions before doing polish.
- Add questions to `src/questions.ts`.

### Wednesday

- Add 5 to 10 extra questions for the weakest topic from Tuesday's practice.
- Do not add broad new content if weak-topic drills are still thin.

### Thursday

- No large content expansion.
- Fix only unclear or broken questions discovered during practice.

## Content Acceptance Criteria

Content is ready enough if:

- At least 20 questions exist.
- Distribution matches the boss skill.
- Every question has explanation and concept tags.
- Edward can run one full mock and learn from the result.
