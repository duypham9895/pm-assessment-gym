# Product Spec

## Product Summary

PM Assessment Gym is a local interview-prep app for PM assessment practice. It focuses on timed multiple-choice PM questions similar to the Alooba-style mock test from the boss skill.

The app should be calm, direct, and fast. It should avoid a marketing-style landing page. The first screen should immediately let the user practice.

## Primary User

Edward, preparing for a PM interview assessment on exam day, 2026-05-22.

## User Goals

Edward wants to:

- Know his current PM assessment level.
- Practice under time pressure.
- Identify weak topics.
- Review mistakes with clear explanations.
- Drill weak topics.
- Memorize key PM frameworks before the test.

## Main Topics

The app should support these topics:

1. Product Analytics.
2. Data Literacy.
3. Chart Interpretation.
4. Inductive Reasoning.
5. Data Interpretation.
6. A/B Testing.

## Modes

### Full Mock

Purpose:

- Simulate a screening-style Senior PM assessment with 20 questions.

Behavior:

- Uses the correct topic distribution:
  - Product Analytics: 4.
  - Data Literacy: 3.
  - Chart Interpretation: 3.
  - Inductive Reasoning: 3.
  - Data Interpretation: 3.
  - A/B Testing: 4.
- Default timer: 30 minutes.
- User can navigate freely.
- User submits and receives results.

### Topic Drill

Purpose:

- Practice one weak topic.

Behavior:

- User selects a topic.
- App filters question bank to that topic.
- Default timer: 90 seconds per selected question.
- If fewer than 10 questions exist for the topic, use all available questions.
- User receives results just like a full mock.

### Exam Mode

Purpose:

- Simulate assessment pressure.

Behavior:

- No correctness feedback during test.
- User sees feedback only after submit.

### Practice Mode

Purpose:

- Learn concepts quickly.

Behavior:

- After choosing an answer, show:
  - Correct or incorrect.
  - Correct answer.
  - Explanation.
- User can continue to the next question.

### Confidence Rating

Purpose:

- Separate answers Edward truly knows from answers he guessed correctly.

Behavior:

- Each answered question can include a confidence rating:
  - `1` = guessing.
  - `2` = unsure.
  - `3` = confident.
- If the user selects a choice without setting confidence, default to `2`.
- Results should prioritize questions that were wrong with confidence `3`.

## Screen 1: Start Screen

### Purpose

Let Edward start useful practice in under 10 seconds.

### Required UI

- Title: `PM Assessment Gym`.
- Subtitle: `MVP practice for PM assessment readiness`.
- Mode segmented control:
  - `Full Mock`.
  - `Topic Drill`.
- Feedback mode segmented control:
  - `Exam`.
  - `Practice`.
- Topic dropdown if `Topic Drill` is selected.
- Start button.
- Latest 3 attempts area.
- Frameworks link.

### Empty State

If no attempts exist:

`No attempts yet. Start with a Full Mock in Exam Mode to create your baseline.`

## Screen 2: Test Screen

### Purpose

Support fast, focused question answering under time pressure.

### Required UI

- Sticky top bar:
  - Mode.
  - Timer.
  - Progress.
  - Submit button.
- Question area:
  - Question number.
  - Topic.
  - Prompt.
  - Choices A to E.
- Bottom controls:
  - Previous.
  - Next.
- Question counter:
  - `Q3 / 20`.
- Confidence control:
  - `1 Guessing`.
  - `2 Unsure`.
  - `3 Confident`.

### Behavior

- User can click a choice.
- User can press `1`, `2`, `3`, `4`, or `5` to select A to E.
- User can move between questions without losing answers.
- Submit warns if questions are unanswered.
- Timer reaching zero always auto-submits.

## Screen 3: Results Screen

### Purpose

Turn test performance into the next practice action.

### Required UI

- Score card:
  - `Score: 16/20`.
  - `76%`.
- Topic breakdown:
  - Topic.
  - Correct.
  - Total.
  - Percent.
- Suggested drill:
  - Weakest topic.
  - Button: `Drill this topic`.
- Review list:
  - Question prompt.
  - User answer.
  - Correct answer.
  - Explanation.
  - Concept tags.
  - Confidence rating.
- Action buttons:
  - `Start another full mock`.
  - `Drill weakest topic`.
  - `Back home`.

### Review List Rule

Before exam day, show wrong answers expanded by default. Correct answers should be summarized with one line, such as `12 questions answered correctly (not shown)`.

Wrong answers with confidence `3` should appear first because they reveal false confidence.

## Screen 4: Frameworks Page

### Purpose

Give Edward a fast PM mental model reference before and after practice.

### Required Sections

- Funnel diagnosis.
- Cohort retention.
- A/B testing.
- MDE and power.
- Sample ratio mismatch.
- Simpson's paradox.
- Base rates.
- Chart reading.
- Metric trees.
- Prioritization.

### Behavior

- Static content.
- No interactivity required.
- Should be readable on mobile and desktop.

## Product Acceptance Criteria

The product is ready for MVP if:

- Edward can complete a Full Mock.
- Edward can complete a Topic Drill.
- Exam Mode hides feedback until submission.
- Practice Mode shows feedback immediately.
- Confidence rating is captured and shown in review.
- Results are correct.
- Topic breakdown is correct.
- Attempt history persists after refresh.
- Frameworks page is available.
- The app can be used repeatedly without blocking practice.
