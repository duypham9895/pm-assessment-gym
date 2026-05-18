# Tomorrow Handoff

Use this file on Tuesday, 2026-05-19.

## One-Sentence Build Request

Build the PM Assessment Gym MVP using:

`docs/superpowers/plans/2026-05-18-pm-assessment-gym-mvp.md`

## What To Tell Codex Tomorrow

```text
Please build the PM Assessment Gym MVP from the plan in:
docs/superpowers/plans/2026-05-18-pm-assessment-gym-mvp.md

Follow the supporting docs in docs/mvp/.
Do not build post-exam day features.
Use Vite + React + TypeScript + minimal CSS.
Prioritize the Full Mock, Topic Drill, Exam Mode, Practice Mode, confidence rating, Results page, localStorage attempt history, and Frameworks page.
Use the adjusted scope: no flag-for-review, no question navigator grid, no countdown widget, and no post-exam day features.
After building, run the app and verify the core flows.
```

## Build Order Reminder

0. Take baseline mock and draft questions if this was not done Monday night.
1. Scaffold app.
2. Add types.
3. Add question bank.
4. Add scoring with shuffled question selection.
5. Add storage.
6. Build Home view.
7. Build Test view without Practice Mode.
8. Add Practice Mode feedback.
9. Build Results view.
10. Build Frameworks view.
11. Verify manually.

## Do Not Build

- AI feedback.
- Database.
- Login.
- Complex dashboard.
- Readiness score.
- 3-hour simulation.
- Case trainer.
- Admin editor.
- Flag-for-review.
- Question navigator grid.

## Success Tomorrow

The build is successful if Edward can:

- Start a mock.
- Answer questions.
- Submit.
- See score and explanations.
- Drill a topic.
- Reload and see attempt history.
- Read the frameworks page.
