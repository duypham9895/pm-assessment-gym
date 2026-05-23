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
