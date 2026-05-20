# Final MVP Scope

## Goal

Build a small local web app that helps Edward prepare for a PM assessment on exam day, 2026-05-22.

The app should be usable by Tuesday night or Wednesday at the latest. It should not become a big software project before the interview.

## Final Product Name

**PM Assessment Gym**

## Final MVP Promise

PM Assessment Gym lets Edward:

- Take a 20-question PM mock test under a timer.
- Practice one PM topic at a time.
- Switch between exam mode and practice mode.
- Review score, topic breakdown, and explanations.
- See recent attempts.
- Review a static PM framework cheat sheet.

## In Scope Before exam day

### 1. Start Screen

Must include:

- App title.
- Mode selector:
  - Full Mock.
  - Topic Drill.
- Feedback mode selector:
  - Exam Mode.
  - Practice Mode.
- Topic selector when Topic Drill is selected.
- Start button.
- Latest 3 attempts, loaded from the last 5 stored attempts.
- Link to Frameworks page.

### 2. Test Screen

Must include:

- Timer.
- Question number.
- Topic label.
- Question prompt.
- Five answer choices.
- Previous and Next buttons.
- Submit button.
- Progress indicator.
- Answered/unanswered state.
- Confidence rating: `1` guessing, `2` unsure, `3` confident.
- Keyboard shortcuts `1` through `5` for choices.

### 3. Practice Mode Feedback

When Practice Mode is selected:

- After choosing an answer, show whether it is correct.
- Show the explanation immediately.
- Still allow the user to continue to the next question.
- Still save the attempt at the end.

### 4. Exam Mode Feedback

When Exam Mode is selected:

- Do not show correctness during the test.
- Show all feedback only after submission.

### 5. Results Screen

Must include:

- Raw score.
- Percentage score.
- Topic breakdown table.
- Wrong answers expanded by default.
- Correct-answer summary count.
- User answer.
- Correct answer.
- Explanation.
- Concept tags.
- Confidence rating, with wrong-and-confident answers highlighted as priority review.
- Suggested weakest topic to drill next.

### 6. Attempt History

Must include:

- Store last 5 attempts in localStorage.
- Show the latest 3 attempts on the Start Screen.
- Show date, mode, score, and weakest topic.
- If no attempts exist, show a useful empty state.

### 7. Frameworks Page

Must include short notes for:

- Funnel diagnosis.
- Cohort retention.
- A/B testing checklist.
- MDE and power.
- Sample ratio mismatch.
- Simpson's paradox.
- Base rates.
- Metric trees.
- RICE and ICE prioritization.

## Out Of Scope Before exam day

Do not build these before exam day:

- User accounts.
- Login.
- Cloud sync.
- SQLite.
- Prisma.
- AI feedback.
- Chatbot tutor.
- Complex dashboard.
- Readiness score formula.
- Chart-heavy analytics.
- 3-hour simulation infrastructure.
- Product case trainer.
- Admin question editor.
- Export/import.
- Multi-user support.
- Payment.
- Deployment.
- Flag-for-review.
- Question navigator grid.
- exam day countdown widget.

## Post-exam day Vision

After the interview, the app can grow into:

- Full question library.
- AI answer coach.
- Case trainer.
- Long-term progress dashboard.
- Mistake archive.
- Database storage.
- Content authoring tools.
- Company-specific prep packs.

## Decision Rule

Before exam day, accept a feature only if it improves at least one of these:

1. More realistic practice.
2. Faster wrong-answer review.
3. Better weak-topic drilling.
4. Better recall of PM frameworks.

Reject features that mainly make the app feel more complete.
