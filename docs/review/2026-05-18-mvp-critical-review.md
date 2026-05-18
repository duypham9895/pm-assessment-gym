# Critical Review — PM Assessment Gym MVP

**Date:** 2026-05-18
**Reviewer lenses:** Senior PM · Senior Software Engineer · PM Interview Coach
**Docs reviewed:** `docs/mvp/00–08` + `docs/superpowers/plans/2026-05-18-pm-assessment-gym-mvp.md`
**Time to interview:** ~4 evenings (Mon evening → Fri morning)

---

## 1. Executive Summary

- **The plan is meaningfully tighter than the original blueprint** — Next.js → Vite, no Prisma, no readiness formula, no 3-hour simulation. Roughly the right shape. Roughly 70% of where it should be.
- **Task 7 ("Build App Views") is the entire build hidden inside one task.** It has 10 sub-steps and is the majority of Tuesday's work. It is the only task that can actually cause the plan to slip.
- **Question selection is deterministic (`.slice(0, needed)`).** With a fixed 21-question pool and no rotation/shuffling, mocks #2 and #3 measure recall, not reasoning. This quietly breaks the "take multiple timed mocks" success criterion.
- **Content authoring is still under-budgeted.** Task 8 "Add 21 questions" is one bullet. Realistically 4–6 hours of focused work for 21 high-quality MCQs with distractors, explanations, tags. This is the critical path and the plan does not name it as such.
- **No baseline is taken before Tuesday's build.** Monday evening is currently dead time. A paper baseline using the boss skill would set weak-topic priorities and inform which extra drill questions to author.
- **Practice Mode + Exam Mode interleaved in one Test view** is the highest-bug-density area. Most plausible failure on Wednesday is a state bug there.
- **Several small features can be cut for 1–2 hours saved:** the flag-for-review system, the question navigator grid, the review list with collapsed-correct, and the countdown widget. None move the needle on exam day performance.
- **One missing learning mechanism worth adding:** a 1–3 confidence rating per question, captured at answer time. This separates "right because I knew" from "right by guess" — the single most valuable signal for the next 4 days of practice. ~30 minutes of UI work.

---

## 2. Deadline Realism

### Is it buildable by Tuesday night?

**Probably — if Tuesday is 4+ hours of focused, uninterrupted work AND the question bank is already drafted Monday night.** Without Monday content prep, Tuesday is likely to slip.

Realistic time estimate:

| Block | Time |
|---|---|
| Scaffold (Tasks 1–6) | 60–90 min |
| Test view + Results view (Task 7 Steps 4–8) | 150–210 min |
| Home + Frameworks views (Task 7 Steps 2, 9) | 60 min |
| CSS (Task 7 Step 10) | 45–60 min |
| 21 questions with explanations (Task 8) | **240–360 min if done from scratch on Tuesday** |
| Manual verification + bug fixing | 60 min |
| **Total** | **~10–14 hours** |

This is **not a single evening** even for an experienced engineer. The plan only works if content authoring is parallelized (Monday evening) and/or if an LLM drafts question candidates that you only need to rewrite, not invent.

### What is still too much?

1. **The flag-for-review feature.** For 21 questions you can re-scan in 30 seconds, this is over-engineered. Cut.
2. **The question navigator grid with answered/unanswered/flagged/current states.** A `Q3 / 21` counter + Prev/Next + Submit-anywhere is enough. Cut the grid.
3. **The "show all questions, correct collapsed, wrong expanded" review pattern.** Adds collapse/expand state to manage. Just list wrong-answers first, then a single line: "12 correct: not shown." Cut.
4. **Frameworks as a structured data file (`frameworks.ts`).** Use one markdown string rendered with `<pre>` or `marked` (5 lines of code). Don't model bullets as objects.
5. **The exam day countdown widget.** Adds anxiety, not utility. Cut.
6. **Auto-test command in `package.json`.** No tests are being written before exam day. Don't pretend you might.

### What can stay

- Practice Mode + Exam Mode split (this is the actual product wedge).
- Topic Drill with weakest-topic CTA.
- localStorage with 5 attempts.
- Wrong-answer explanations on Results page.
- Frameworks page (just simplified format).

---

## 3. Scope Review

### Keep (Pre-exam day)

- Full Mock (21Q).
- Topic Drill.
- Exam Mode and Practice Mode.
- Timer (with auto-submit at zero).
- Results: total score, topic breakdown, wrong-answer list with explanations.
- localStorage for last 5 attempts.
- Frameworks page (static text).
- Keyboard shortcuts 1–5.

### Cut Before exam day

- **Flag-for-review system** (entire mechanic).
- **Question navigator grid** (use Prev/Next + counter).
- **Review list collapse/expand for correct answers** (just show wrong first).
- **exam day countdown** widget on Home.
- **Frameworks as structured data** — use plain markdown.
- **Manual `clearAttempts` function** unless an actual bug requires it.
- **`mentalModel` field on Question** — fold it into `explanation`. One less field to wire through, one less optional render path.

### Add Before exam day

- **Confidence rating per question** (1–3 scale, captured at answer-time, surfaced on review).
- **Question rotation** for Full Mock — shuffle within topic before slicing. Pre-exam day: also shuffle choice order per question.
- **A larger question pool target** — 30 questions minimum, 40 better. The plan's "21" leaves zero room for second-mock variety.

### Postpone (Post-exam day — already correctly excluded)

The "Out Of Scope" list in `01-final-scope.md` is correct and tight. Keep it as-is.

---

## 4. Product Review

### Does the app actually help improve PM assessment performance?

**Mostly yes, with one structural hole.** The loop is:

1. Take Full Mock (Exam Mode) → see weakest topic.
2. Drill weakest topic (Practice Mode) → learn concepts.
3. Re-take Full Mock or new drill (Exam Mode) → measure improvement.

This is a tight loop. **It breaks at step 3** because question selection is deterministic. If you've already seen Q5 about SRM, you'll get it right next time because you remember the answer, not because you've learned to spot SRM. The "improvement" you measure is fake.

Fix: shuffle question order within each topic before slicing, and shuffle choice positions per question. Even with a 21-question pool, this restores some signal.

### Is the feedback loop strong enough?

**For wrong answers, yes — explanation + concept tag + (optionally) mental model is good.**

**For correct answers, weak.** A correct answer with low confidence is a near-miss and the most valuable thing to surface. Without a confidence rating, you can't tell.

### Are Exam Mode and Practice Mode the right choices?

**Yes. This is the strongest product decision in the plan.** The two modes serve genuinely different jobs:

- Exam Mode: pressure simulation, time management, no-feedback discomfort.
- Practice Mode: learning loop, immediate feedback, no time anxiety.

Keep this split. Don't merge them. Don't add a third mode.

### Smaller UX notes

- **Results "Drill weakest topic" CTA** is the right primary action. Make it large and obvious.
- **Practice Mode immediate feedback** should NOT auto-advance — let the user read the explanation and click Next when ready. Otherwise it feels rushed.
- **Submit warning for unanswered questions** is good. Make sure it lists which question numbers are unanswered, not just a count.
- **Timer reaching zero** — the plan says "auto-submit if possible." Define what "if possible" means. Recommendation: hard auto-submit always, no exception.

---

## 5. Technical Review

### Stack: Vite + React + TypeScript + localStorage

**Right call.** No notes. Next.js was correctly rejected.

### File structure

**Right size.** 12 files including config. Don't split `App.tsx` before exam day even if it crosses 500 lines.

### Data model

Strong overall. Specific notes:

- **`topicBreakdown` as `Partial<Record<Topic, TopicScore>>`** — good. Topics absent from a drill won't appear with `0/0`.
- **`questionReviews` is duplicated data.** An `Attempt` stores `questionIds`, `answers`, AND `questionReviews` containing prompt/explanation already in `questions.ts`. This bloats localStorage and creates a stale-data problem: if you edit a question after taking an attempt, the stored review shows the old text. Recommendation: store only `questionIds` + `answers` + score summary. Reconstruct reviews at display time.
- **`mentalModel?: string`** — fold into `explanation`. One less optional render path. Cleaner question files.
- **`flaggedQuestionIds: string[]`** — drop entirely if you cut the flag feature.
- **No question pool version / content hash.** Minor for MVP, but if you regenerate questions, old attempts' percent could be technically inconsistent. Acceptable for exam day.

### Scoring functions

- `scoreQuestions` is clean. ✓
- `getWeakestTopic` tie-breaker is correct (most wrong → lowest %). ✓
- **`selectFullMockQuestions` is the bug**. Pure `.slice(0, needed)` means same 21 questions every time. Fix: shuffle the topic-filtered array first.

```ts
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

Add `shuffle` then `shuffle(filtered).slice(0, needed)`. 5 lines. Critical for practice value.

### Timer

- `setInterval` is fine, but the plan doesn't mention cleanup. Wire `useEffect` cleanup that clears the interval on unmount, on submit, and on view change. This is the most likely React bug.
- Auto-submit when timer hits zero must be hard-wired: no "if possible" language. The submit function should be idempotent.

### Storage

- `try/catch` around `JSON.parse` is correct.
- **No quota handling.** localStorage has a 5MB limit. With 5 attempts × ~10–20KB each, you're at ~50–100KB — fine. But if you also store `questionReviews`, that grows. Removing review duplication (above) makes this a non-issue.

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Task 7 takes 2× longer than imagined | High | Build slips past Tue | Cut flag/navigator/collapsed-review now |
| Question pool stays at 21, no rotation | High | Practice value collapses after mock #1 | Add shuffle + author 30 questions |
| Timer/submit state bug | Medium | Lose an attempt mid-flow | Idempotent submit + cleanup on unmount |
| Practice Mode reveal-state bug | Medium | Spoiled answers leak into Exam Mode | Reset reveal state on view change |
| localStorage corruption from an old schema | Low | Home view crashes | Already handled with try/catch |

---

## 6. Content Review

### Is the content authoring plan realistic?

**Plan: yes. Allocation: no.** The authoring plan is well-shaped (boss-skill draft → hand-rewrite → tag → validate), but it is treated as Task 8 — one bullet at the bottom of the implementation plan. **In reality, content is 40–60% of the total pre-exam day effort.** It deserves its own time block, not a checkbox.

### Are the PM topics right?

**Mostly.** They match what the boss skill says is on the Alooba Senior PM mock. But the plan treats the boss skill's topic list as ground truth for the test. Confirm:

- Is the actual assessment Alooba? Is it the same Senior PM track?
- Does it include written cases, free-text, SQL, or only MCQ? If anything beyond MCQ, the gym is missing that practice format entirely.

15 minutes to verify the actual format. Worth it before locking content priorities.

### What question types are missing?

For an Alooba-style PM assessment, also consider:

1. **Numerical reasoning.** Quick arithmetic under pressure (percent change, weighted averages, CAGR). Often paired with chart questions.
2. **SQL/pseudocode reading.** If Alooba's Senior PM track includes this, you have zero practice.
3. **Estimation / Fermi.** Sometimes embedded in product analytics questions.
4. **Read-and-infer from short text.** Inductive Reasoning in a PM context is usually *not* pure number patterns — it's "given these three research findings, which conclusion is best supported?" The plan correctly flags this in §6 but does not show an example. Add one to the content authoring doc.

### What makes a question high quality?

The plan's checklist is good. Strengthen with:

- **Realistic, specific scenario.** Real product names or close analogs. "A travel marketplace's checkout conversion drops 14%..." beats "A company's metric drops."
- **Distractors should each represent a common wrong mental model**, not random plausible-sounding text. The A/B example in `06-content-authoring-plan.md` does this well — keep that bar.
- **Explanation must say why the distractor failed**, at least for the 1–2 most tempting wrong choices.
- **Answer in 45–90 seconds**, but include 1–2 harder 90–120 second questions per mock to simulate end-of-test fatigue.

---

## 7. Implementation Plan Review

### Task order

Mostly correct. Specific issues:

- **Task 3 (Add Question Bank)** is placed before Task 7 (Build Views). That's right *if* questions exist. If not, you'll scaffold the app and have nothing to put in it. **Move actual question authoring to Monday evening.**
- **Task 8 (Add Initial Question Content)** is positioned after Task 7. This means you'll have a working UI with an empty array. Bad sequencing. Move content authoring before Task 7 starts.
- **Task 9 (Verify Core Flows)** is good and in the right place.

### Ambiguous steps

- Task 4 Step 1: "Prefer unused or least recently used questions only if easy to implement" — undefined behavior. Either delete this line or explicitly say "shuffle then slice."
- Task 7 Step 7: "Submit handler" — doesn't specify what happens when timer auto-fires submit while user is still in Practice Mode mid-question.
- Task 8 Step 1: "Add 21 questions" — entire content effort hidden in one bullet.
- Task 10 Step 2: "Tell Edward" is theater — Edward is the one running this. Cut.

### Too-large tasks

- **Task 7 is the entire app.** Should be split into:
  - 7a: Home view + state model + start handler.
  - 7b: Test view (no Practice Mode yet).
  - 7c: Add Practice Mode feedback.
  - 7d: Submit handler + Results view.
  - 7e: Frameworks view.
  - 7f: CSS.
- **Task 8 should be its own work block** (3–6 hours) labeled "Content Authoring" with its own time budget on Monday.

### What I would rewrite

1. Promote Content Authoring to Task 0 (Monday night).
2. Split Task 7 into 7a–7f.
3. Add a "Task 4.5: Add shuffle utility and use it in selection."
4. Add a "Task 7.5: Smoke test before content" — verify the Test view works with 2–3 dummy questions before authoring the real 21.

---

## 8. Testing And Fallback Review

### Is the testing plan enough?

**Yes — for the deadline.** The manual checklist in `07-testing-and-fallback-plan.md` covers the critical paths. Automated tests are correctly marked optional.

One addition: **explicitly test "submit with 0 answers"** and "submit when timer hits 0 mid-question." Both are common boundary bugs.

### Is the fallback plan strong enough?

**Yes, and this is the strongest part of the plan.** A clear stop-trigger (Tue 23:00), a concrete alternative (boss skill in chat), and a markdown template. This is the kind of fallback most plans never include. Keep it.

One refinement: **also define a smaller mid-build fallback**, not just total-abandonment. For example: if Test view works but Results view is buggy by Tue 23:00, ship without the topic breakdown and read it from the console. Partial slip ≠ full slip.

### Most dangerous bugs before exam day

In rough order of likely cost:

1. **Scoring bug** (off-by-one, unanswered counted as correct). One unit test prevents this. Worth the 15 min.
2. **Practice Mode reveal leaking into Exam Mode** (after switching modes mid-session). Reset reveal state on mode change.
3. **Timer not stopping on submit.** Memory leak + might trigger duplicate submits.
4. **localStorage write race** (saving an attempt that hasn't fully scored). Use `await`-style sequencing or save synchronously after scoring.
5. **Refresh during a test loses everything.** Acceptable risk for MVP but should be documented in the testing plan.

---

## 9. Recommended Changes

Concrete edits to the plan files:

### `01-final-scope.md`

- **Delete** "Flag for review" from `## 2. Test Screen → Must include`.
- **Delete** "exam day countdown" from `## 1. Start Screen → Must include`.
- **Change** "Last 5 attempts" → "Last 3 attempts" in Start Screen (5 is more than you'll usefully read).
- **Add** "Confidence rating (1–3) per question, captured at answer time" to `## 2. Test Screen → Must include`.

### `02-product-spec.md`

- **Delete** the Question Navigator block ("Small numbered buttons" with different states) — replace with: "Question counter `Q3 / 21` and Prev/Next buttons. No grid."
- **Change** "Before exam day, show all questions in the review list" → "Before exam day, show all wrong answers expanded, with a single summary line: `12 questions answered correctly (not shown)`."
- **Add** a section "Confidence Rating" describing the 1–3 scale (1 = guessing, 2 = unsure, 3 = confident) and how it surfaces on the Results page (wrong-but-confident questions are flagged as priority review).

### `04-technical-architecture.md`

- **Add** to "Why Vite": *Single-page app with internal views via `useState`. No React Router.*
- **Add** a "Question Selection" subsection: *Shuffle topic-filtered questions before slicing. Also shuffle choice positions per question per attempt to prevent positional memorization.*
- **Change** "Timer can be implemented with setInterval" → "Timer uses setInterval inside a useEffect with cleanup. Auto-submit on zero is hard-wired and idempotent."

### `05-data-model-and-scoring.md`

- **Delete** `flaggedQuestionIds` from `TestSession` and `Attempt` (if flag is cut).
- **Delete** `questionReviews` from `Attempt`. Reconstruct reviews at display time from `questionIds` + `answers` + the current question bank.
- **Add** `confidence: 1 | 2 | 3` (optional) to the answers structure — or store as `answers: Record<string, { choice: ChoiceId; confidence?: 1 | 2 | 3 }>`.
- **Change** `mentalModel?: string` on Question → delete. Fold into explanation.

### `06-content-authoring-plan.md`

- **Add** a concrete Inductive Reasoning example using a PM-context inference (research findings → best supported conclusion), not a number sequence.
- **Add** a "Pre-exam day Authoring Schedule": *Monday night: draft 15 questions. Tuesday morning/lunch: draft remaining 6. Wednesday: add 10 drill questions for weakest topic.*
- **Change** the "Strong Target" of 60 questions to "Pre-exam day Realistic Target: 30 questions."

### `07-testing-and-fallback-plan.md`

- **Add** test case: *Submit with 0 answers shows results with 0/21.*
- **Add** test case: *Timer hits 0 mid-question auto-submits and shows results.*
- **Add** test case: *Switch mode mid-session — Practice reveal does not leak to Exam.*
- **Add** a "Partial Slip Fallback" section: if Tue 23:00 has a working Test view but broken Results, ship without the topic breakdown; read scores from console.

### `08-tomorrow-handoff.md`

- **Move** Task 0 (Content Authoring) ahead of Task 1 (Scaffold) in the build order.
- **Add** "Take baseline tonight (Mon)" as the actual first action.

### `superpowers/plans/2026-05-18-pm-assessment-gym-mvp.md`

- **Add** Task 0: Author 15 candidate questions (Monday evening, before scaffolding).
- **Split** Task 7 into Tasks 7a–7f as described in §7 of this review.
- **Add** Task 4.5: Add `shuffle` utility and use it in `selectFullMockQuestions` and choice ordering.
- **Delete** Task 10 Step 2 ("Tell Edward the URL") — Edward is running this.
- **Change** Task 8 → move to between Task 6 and Task 7 (content before UI), reflecting that the bank should exist before the views consume it.

---

## 10. Final Recommendation

**Build this plan, with the cuts and additions in §9. Do NOT build it as-written.**

The plan is genuinely smaller than the original blueprint and is buildable in principle. But it under-budgets content, hides the actual majority of the work inside Task 7, and has one structural bug (deterministic selection) that quietly destroys the practice loop after mock #1.

Order of operations:

1. **Tonight (Mon evening, ~2 hours):**
   - Take a baseline mock using the boss skill in chat. Record score per topic. **Without this, Tuesday starts blind.**
   - Draft 10–15 candidate questions using the boss skill or another LLM. Rewrite each by hand.

2. **Tuesday (~4 hours of code + 2 hours of content):**
   - Scaffold + types + scoring (with `shuffle`) + storage + frameworks.
   - Add the 21 questions to `questions.ts`.
   - Build Home + Test + Results + Frameworks views.
   - Take a timed mock using your own app. Find bugs.

3. **Wednesday (~1 hour code + 2 hours practice):**
   - Add 10 more questions for your weakest topic.
   - Take 2 timed mocks. Review every wrong answer with the boss skill as tutor.

4. **Thursday (~3 hours practice, 0 code):**
   - 1 Topic Drill in weakest topic.
   - 1 full Mock.
   - Re-read frameworks.
   - **No new features. Bug fixes only if they block practice.**

5. **exam day morning (~30 min):**
   - 10-question warmup (Practice Mode).
   - Skim wrong-answer history.
   - Stop touching the app 2–3 hours before the interview.

**If by Tuesday 23:00 the app doesn't work end-to-end, invoke the fallback plan immediately.** Don't push to Wednesday. The boss skill in chat + a markdown notebook is faster than debugging React under deadline pressure.

The gym should help you practice. It should never become the project that prevents practice. If you notice yourself optimizing the app instead of taking mocks on Wednesday or Thursday, that is the signal to stop building and start practicing.
