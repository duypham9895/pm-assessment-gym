# Testing And Fallback Plan

## Testing Goal

Before exam day, testing should prevent wrong scores and broken practice flows. It should not become a separate project.

## Minimum Manual Test

Run this every time the app changes significantly:

1. Start app.
2. Start Full Mock in Exam Mode.
3. Answer first 3 questions.
4. Navigate back and confirm answers persist.
5. Mark one answer confidence `1`, one `2`, and one `3`.
6. Submit with unanswered questions.
7. Confirm warning appears.
8. Submit with zero answers in a fresh run and confirm score is `0`.
9. Let timer hit zero in a short test and confirm auto-submit opens Results.
10. Confirm results page opens.
11. Confirm score is plausible.
12. Confirm topic breakdown totals equal total questions.
13. Confirm wrong-and-confident answers appear first in review.
14. Confirm attempt appears on home after reload.
15. Start Topic Drill.
16. Confirm only selected topic appears.
17. Start Practice Mode.
18. Confirm immediate feedback appears.
19. Switch back to Exam Mode in a new session and confirm Practice feedback does not leak.

## Minimum Automated Tests

Only add if time allows:

- `scoreQuestions` calculates total score.
- Unanswered answers count as wrong.
- Topic breakdown totals are correct.
- Weakest topic uses most wrong answers.
- Stored attempts are limited to 5.
- Wrong-and-confident answers sort before other wrong answers.

## Bugs That Must Be Fixed Before Practice

Fix immediately:

- App cannot start.
- Questions do not render.
- Choices cannot be selected.
- Answers disappear during navigation.
- Timer breaks submission.
- Timer continues after submission.
- Score is wrong.
- Results page crashes.
- Attempt history corrupts the app.

## Bugs That Can Wait Until After exam day

Postpone:

- Visual polish issues.
- Animation glitches.
- Non-critical mobile layout issues.
- Fancy empty states.
- Attempt deletion.
- Export/import.
- Better routing.

## Fallback Plan

If the app is not usable by Tuesday, 2026-05-19 at 23:00:

1. Stop building.
2. Use the boss skill directly in chat to run mock tests.
3. Track answers and wrong topics in a markdown file.
4. Use `docs/mvp/06-content-authoring-plan.md` to create practice questions manually.
5. Resume app building only after the interview.

## Partial Slip Fallback

If the app partly works by Tuesday, 2026-05-19 at 23:00:

- If Home and Test work but Results is buggy, keep using the Test flow and score manually from answer keys.
- If Results works but topic breakdown is buggy, ignore topic breakdown and review wrong answers manually.
- If Practice Mode is buggy but Exam Mode works, disable Practice Mode and use Results explanations after submit.
- If localStorage is buggy, use the app for live attempts and track results in markdown.

Do not spend Wednesday rebuilding non-blocking pieces. Wednesday is for practice.

## Fallback Markdown Template

Use this if the app slips:

```md
# PM Mock Attempt

Date:
Mode:
Score:

## Topic Breakdown

- Product Analytics:
- Data Literacy:
- Chart Interpretation:
- Inductive Reasoning:
- Data Interpretation:
- A/B Testing:

## Wrong Answers

### Q1

Topic:
Concept:
My answer:
Correct answer:
Why I missed it:
Mental model:

## Next Drill

Topic:
Reason:
```

## Practice Protection Rule

From Wednesday onward:

- If adding a feature takes more than 30 minutes, stop.
- If a bug does not block practice, postpone it.
- If content is weak, improve content before code.
