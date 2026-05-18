# Critical Review — PM Assessment Gym Blueprint

**Date:** 2026-05-18
**Reviewer lenses:** Senior PM · Senior Software Engineer · PM Interview Coach
**Blueprint reviewed:** `docs/superpowers/specs/2026-05-18-pm-assessment-gym-system-blueprint.md`
**Time to interview:** ~4 evenings (Mon evening → Fri morning, interview Fri 2026-05-22)

---

## Executive Summary

- **The plan is 5–10× too big for the deadline.** 14 phases, 6 modes, 26+ files. A realistic 4-evening build is closer to 1 mode, ~5 files, and zero "engines."
- **Building the gym competes with actual interview practice.** This is the single largest unstated risk. Every hour writing TypeScript is an hour not reviewing frameworks or doing real questions.
- **Content is the real bottleneck, not code.** Writing 21 high-quality questions with plausible distractors and explanations is 6–10 hours of focused work. The blueprint treats this as a checkbox.
- **The 3-hour simulation and Product Case Trainer are based on guesswork.** Alooba's listed topics are all MCQ. There is no evidence the test includes written cases. Building a 5-section simulator with rubric self-review is high effort against unverified scope.
- **Cut ruthlessly:** AI feedback, SQLite/Prisma, mistake review filtering, case trainer, dashboard charts, study plan engine, readiness formula, 3-hour simulation. None of these improves exam day performance more than 90 minutes of real practice would.
- **The PM coach view:** Score is not won by the gym. It is won by (a) doing 60–100 representative MCQ questions with deliberate review and (b) memorizing 4–5 core frameworks cold (funnel, cohort, A/B test design, Simpson's paradox, MDE/power). The app should be a thin harness for (a). Nothing more before exam day.
- **The senior engineer view:** Architecture is fine in shape but too elaborate for the time budget. Next.js + Tailwind + shadcn for a single-user local tool is overkill. A single-page React (Vite) or even one static HTML+JS file ships in half the time and removes a class of yak-shaving.
- **Final recommendation:** Build a radically smaller MVP (one mode, ~6 hours total). Spend the saved time **practicing**, not building.

---

## Biggest Problems In The Current Plan

1. **Scope-to-deadline mismatch.** 14 phases × ~10 steps each ≈ 140 discrete tasks before exam day. Even at 10 minutes each that is 23 hours of pure execution time, before debugging, content writing, or actually practicing.
2. **The build-vs-practice trade-off is invisible.** §22 lists "Overbuilding" as a risk but mitigates it with vague advice ("treat AI feedback as post-exam day"). The mitigation is far too weak — the entire blueprint is overbuilt.
3. **Content authoring is treated as trivial.** Each question needs a real scenario, 5 plausible distractors, an explanation of why correct is right and why each wrong is wrong, concept tags, and difficulty calibration. 21 questions = realistically 6–10 hours. Drill packs (5–10 per topic × 6 topics) = another 10–15 hours. This is the critical path and it is buried in §16.
4. **Simulation mode is unverified scope.** Part B (Product Analytics case), Part C (A/B testing case), Part D (Prioritization case) — these come from PM interview folklore, not from Alooba's listed topics. Building infrastructure for them could be wasted.
5. **AI Feedback (Phase 11)** before exam day is impossible to make trustworthy. Hallucinated rubric scores would actively mislead Edward into thinking weak answers are strong.
6. **Readiness formula is theatre.** `50% latest + 25% avg-of-last-3 + 15% weak-topic improvement + 10% time management` looks rigorous but with N=2–3 attempts it is statistical noise. Worse, it gives a false sense of progress.
7. **Weak-topic detection at N=21 questions is fragile.** "Topic score below 70%" with only 3–4 questions per topic means a single missed question flips weak/strong. The thresholding logic in §12 will fire false positives constantly.
8. **No baseline measurement.** The plan never has Edward take a paper/manual baseline test first. Without that, "improvement" is unmeasurable and weak-topic identification starts cold.
9. **Mistake Review (Phase 7) is over-designed.** Filters by topic, concept, date, mastered status — for a 1-person tool with maybe 30–50 mistakes over a week. A flat list ordered by topic is enough.
10. **Study Plan engine (Phase 8) is solved by a paper checklist.** Encoding the May 18–22 schedule as code is busywork. The schedule already exists in §20 of the blueprint.
11. **Drill packs depend on content that does not exist.** "5–10 focused questions per topic × 6 topics" = 30–60 additional questions on top of the mock. No realistic path to this before Wednesday.
12. **File structure premature.** 11 modules in `lib/`, separate folders for `study-plan/`, `cases/`, `drills/`, `dashboard/` — most of these will not exist before exam day. Empty folders are debt.
13. **Testing strategy is over-specified for the deadline.** Unit tests + component tests + Playwright + manual verification across all flows? For a 4-evening build for one user? Pick one (Playwright on the happy path) or skip automated tests entirely and rely on manual.
14. **No fallback if the build slips.** There is no version of "if I lose Wednesday, here is the still-useful slice." The plan is a tower; the absence of layered MVPs means partial completion = unusable.

---

## What To Keep Before exam day

Only these elements directly help exam day performance:

- **One static question bank** of ~21–30 Alooba-style MCQs across the 6 topics.
- **Question display + 5 answer choices + timer** (single screen, navigable).
- **Submit → score + topic breakdown + wrong-answer explanations.**
- **localStorage for attempt history** (just the last 3–5 attempts).
- **Hand-written paper plan for Tue/Wed/Thu** (no code needed).
- **A short framework cheat-sheet** as a static markdown or HTML page (funnel, cohort, A/B test, Simpson's paradox, MDE/power, RICE).

That is the entire useful pre-exam day surface area.

---

## What To Postpone Until After exam day

All of these are reasonable as v2 ambitions but **none of them improves exam day's score enough to justify the time cost**:

- 3-hour simulation mode.
- Product Case Trainer + rubrics.
- AI feedback layer (Phase 11) — entire phase.
- Mistake review page with filters (use the wrong-answer view inline on the results page).
- Drill mode as a separate route — see "Updated Plan Recommendations" below for a 10-minute substitute.
- Dashboard charts / readiness score / topic progress chart.
- Study plan page as a coded engine.
- SQLite / Prisma / export-import.
- Multi-user, admin, content authoring tools.
- Phase 14 polish + full Playwright suite.

---

## Missing PM Practice Areas

If you genuinely have time after the MVP works, these are gaps **specifically for Alooba-style and Senior PM assessments**:

1. **Numerical reasoning / quick math under pressure.** Alooba routinely pairs chart interpretation with arithmetic. Practice mental math on percentages, growth rates, weighted averages.
2. **SQL / data manipulation basics.** Many "Technical PM" assessments include reading SQL output or pseudocode. Worth checking whether Alooba's Senior PM track includes this.
3. **Estimation / Fermi problems.** Common in PM interviews even when not labeled. Not in the blueprint at all.
4. **Trade-off / judgment questions.** "Which would you do first?" with no clearly correct answer — Alooba uses these to test PM reasoning, not just data skills.
5. **Reading research/PRD excerpts and answering inference questions.** This is what "Inductive Reasoning" likely includes in a PM context — but the blueprint treats it as IQ-test pattern matching (§14), which is the wrong mental model.
6. **Roadmap prioritization scoring.** RICE and ICE are mentioned in the framework library but no questions test them.
7. **Guardrail metric selection** as a standalone skill — not just inside A/B test design.

**Reality check before adding any of these:** verify what is actually on the Alooba Senior PM test (look at the boss skill, look for sample questions, look at Alooba's public marketing). Do not build for imagined scope.

---

## Revised Pre-MVP

**Total target: ~6 hours of build, leaving 12+ hours for content + practice.**

One screen, one flow:

1. **Start screen** — pick "Full Mock (21Q)" or "Topic Set: [topic]" from a dropdown.
2. **Question screen** — prompt + 5 choices + topic label + timer + Prev/Next/Submit. Keyboard 1–5 to select.
3. **Results screen** — total score, topic breakdown table, list of wrong answers each with: question, your answer, correct answer, explanation, concept tag.
4. **localStorage** stores the last 5 attempts. A tiny `<details>` on the start screen shows past scores.
5. **Static `/frameworks` page** — one markdown rendered as HTML, containing the 5–6 core frameworks.

That is the whole app.

No dashboard. No readiness score. No mistake filtering. No drill route — "Topic Set: A/B Testing" filters the question bank, that is the drill. No study plan page — you have it on paper.

---

## Revised Build Sequence

This sequence assumes ~2.5 hours/evening of focused work.

### Monday evening (2026-05-18) — **content + baseline, NOT scaffold**

1. **Take a baseline mock test now, on paper or in the boss skill chat.** ~30 min. Record score per topic. Without this, nothing else is calibrated.
2. **Start drafting 21 MCQs as JSON.** 90 min. Aim for at least 12 done tonight. Use the boss skill to generate candidates, then rewrite by hand. This is the critical path.
3. Skip all scaffolding tonight. Engineers will tell you to scaffold first; that is the trap.

### Tuesday evening (2026-05-19) — **ship the engine**

1. `npm create vite@latest pm-gym -- --template react-ts` (Vite, not Next.js — 30 sec dev start, no SSR complexity).
2. Tailwind via CDN or skip styling entirely — use semantic HTML and ~30 lines of CSS. 15 min.
3. Build all three screens (start, question, results) in **one file** (`App.tsx`) if you can — under 300 lines. ~2 hr.
4. Wire localStorage for attempt persistence. 15 min.
5. **Take one full timed mock using your own app.** 30 min. Find bugs by using it.
6. Finish remaining MCQs to reach 21–25 total.

### Wednesday evening (2026-05-20) — **practice, not features**

1. Take 2 timed mocks. Review every wrong answer with the boss skill or an LLM as your tutor (not your app).
2. Add ~10 more questions in the 2 weakest topics — by hand.
3. Add the static `/frameworks` markdown page. 20 min max.
4. Resist all temptation to add features.

### Thursday evening (2026-05-21) — **drill weak topics, stabilize**

1. Take 1 timed mock filtered to your weakest topic. Review.
2. Take 1 full timed mock. Compare to Monday baseline.
3. Re-read frameworks page. Memorize the A/B test checklist (hypothesis → primary metric → MDE → guardrails → decision).
4. Fix any app bug that blocks practice. **Do not add features.**

### exam day morning (2026-05-22) — **calm prep**

1. 10-question warmup mock. Easy mode if available.
2. Skim wrong-answer history.
3. Re-read frameworks page once.
4. Stop touching the app. Stop heavy practice 2–3 hours before the test.

---

## Technical Feedback

**Stack:**

- Next.js is unnecessary for a single-user local app. **Vite + React + TypeScript** boots in seconds, no routing complexity, no SSR overhead. App Router/Pages Router decisions cost nothing in features but minutes in friction.
- Tailwind + shadcn/ui for a 3-screen tool is overkill. Pure CSS or even inline styles work. shadcn requires copying components and configuration that costs ~30 min you don't have.
- `lucide-react` is fine but unnecessary — emojis or SVG-in-HTML work for a v1.
- **localStorage is correct** for MVP. The blueprint got this right.
- **SQLite/Prisma is correct as post-MVP.** Also right. But Phase 13 is months away, not next month.

**Data model:**

- `Question`, `AssessmentSession`, `AttemptResult` shapes are reasonable.
- Missing: a `questionBankVersion` or content hash so explanations stay aligned if you edit a question after it has been answered.
- Missing: a `confidence: 1–5` rating per question — a very small UX addition that gives you a **calibration score** (a real PM signal: are you sure when you are right and unsure when you are wrong?). This is worth adding if anything.
- `whyWrong?: Partial<Record<...>>` is fine but in practice you will not write per-choice failures for 21+5×6 questions. Make it a single string at the question level for the chosen-wrong path, defer per-choice rationales.
- `weakTopics: WeakTopic[]` — the `WeakTopic` type is referenced but never defined in the blueprint. Minor.

**Scoring:**

- `readiness` formula should be cut. It does not help you and the inputs are too noisy at N=2–3.
- Weak-topic threshold at 70% with only 3–4 questions per topic is noisy. Use "missed ≥2 in topic" only; drop the percent rule.

**Testing:**

- Unit tests for scoring? Yes — 10 minutes of work, prevents an embarrassing wrong total. Keep this one.
- Playwright? **Skip before exam day.** Manual click-through is faster for one user.
- Component tests? Skip.

**File structure:**

- The proposed structure is correct *as an end state*. For Monday–Thursday, collapse it to:
  ```
  pm-gym/
    src/
      App.tsx              // all three screens
      questions.ts         // the bank
      scoring.ts           // pure functions
      storage.ts           // localStorage wrappers
      frameworks.md        // static study page
      types.ts
    index.html
  ```
  ~6 files. Expand later.

---

## Product Feedback

**The feedback loop is the entire product. The current loop is too long.**

Loop today: take 21Q test (30 min) → review wrong answers → maybe drill → take another mock.

Tighter loop you actually need: **answer → see if right → see why → next.** A "review mode" where you immediately see the explanation after each question, with no scoring pressure, is more useful for *learning* than the timed-mock-then-review pattern. The blueprint includes "immediate or after-drill" feedback for drills only — extend that to a standalone "Learn" mode for the mock bank itself. ~5 lines of UI change.

**Dashboard:**

- Cut entirely before exam day. A `<details>` showing "Last 5 attempts: 14/21, 16/21, 17/21" is enough.
- A readiness gauge is theatre; replace with the literal last 5 scores and your topic-by-topic best/worst.

**Drill mode:**

- Do not build a separate route. Add a "Filter by topic" dropdown on the start screen. Same engine, different question subset. This deletes most of Phase 6.

**Study plan:**

- Do not encode. The plan is in §20 of the blueprint. Print it or save as `study-plan.md` and open it in your editor. Coding it adds zero value over a checklist.

**Mistake review:**

- The wrong-answer review on the results page IS mistake review. Adding a separate filterable mistake archive is post-exam day work.

**3-hour simulation:**

- **Verify scope before building.** If the real test is all MCQ (which Alooba's listed topics imply), the simulation is the wrong rehearsal. The simulation primarily teaches *endurance and time management*, which you can rehearse by taking 3 back-to-back timed mocks in your simple app — no Section A/B/C/D infrastructure needed.

**Final prep checklist:**

- Worth keeping. 10–12 bullets, static markdown, no engine.

---

## Updated Plan Recommendations

These are the concrete edits to make to the blueprint. Each one is a section replacement or deletion.

### Edit 1: Replace §7 "Minimum Viable Product Scope" with:

> ### MVP Must Include
>
> - One start screen with mode picker (Full Mock 21Q, or filtered by topic).
> - Question screen: prompt, 5 choices, topic label, timer, Prev/Next/Submit, keyboard 1–5.
> - Results screen: total score, topic breakdown, wrong-answer list with explanations.
> - localStorage for last 5 attempts, surfaced on start screen.
> - Static `frameworks.md` study page.
>
> ### MVP Excludes (post-exam day)
>
> - Dashboard, readiness score, charts, drill route, mistake review page, study plan engine, 3-hour simulation, case trainer, AI feedback, SQLite, authentication.

### Edit 2: Replace §8 "Recommended Tech Stack" with:

> - **Vite + React + TypeScript.**
> - Minimal CSS (no Tailwind/shadcn required for MVP).
> - localStorage. No database.
> - One unit test file for `scoring.ts`. No Playwright before exam day.

### Edit 3: Delete §9 module 7 (Drill engine), §9 module 9 (Dashboard analytics), §9 module 10 (Case trainer), §9 module 11 (Study plan engine).

### Edit 4: Replace §10 "Proposed File Structure" with the 6-file collapsed structure shown in Technical Feedback above.

### Edit 5: Cut §12 "Readiness Score" entirely. Replace weak-topic detection with: *"A topic is weak if the user missed ≥2 questions in that topic in their latest attempt."* No percent rule.

### Edit 6: Delete §17 entirely (case rubrics — post-exam day).

### Edit 7: Replace §18 phases. Keep only Phase 0 (already done), Phase 1 scaffold (1 hour), Phase 2 question bank (collapsed into content writing), Phase 3 timed UI, Phase 4 scoring. Delete Phases 6–14 from pre-exam day scope. Mark them "Post-exam day."

### Edit 8: Add a new top-level section §1.5 "Build-vs-Practice Budget":

> The total time budget Monday→Thursday is ~10 hours of evening work. Allocation:
> - Content writing (questions + explanations): 5 hours.
> - Code: 4 hours.
> - Actual practice using the app + LLM tutor + paper review: 12+ hours.
> If code time exceeds budget, cut features, do not extend the schedule.

### Edit 9: Replace §20 daily plan with the "Revised Build Sequence" above. The current daily plan understates content authoring and overstates how many code features fit in a single evening.

### Edit 10: Add to §22 "Risks":

> ### Risk: Building the gym eats the practice time
> Mitigation: Hard time-box code work to 2.5 hours/evening. After that, close the editor and use existing materials.
>
> ### Risk: Building for the wrong test
> Mitigation: Spend 15 minutes confirming what Alooba's Senior PM test actually contains before adding any non-MCQ infrastructure.

### Edit 11: Add §29 "Fallback plan if Tuesday build slips":

> If by Tuesday 23:00 the app is not running with at least 15 questions:
> - Stop building.
> - Use the boss skill chat directly for mocks Wed–Thu.
> - Track wrong answers in a plain markdown file.
> - Resume building only after the interview.

---

## Final Recommendation

**Reduce scope hard. Build the 6-hour MVP. Spend the saved time practicing.**

Specifically:

1. Cut the blueprint to one mode, three screens, six files.
2. Treat **content authoring as the critical path**, not engine code.
3. Take a paper baseline tonight — before writing any code.
4. Code Tuesday evening only. Practice Wed and Thu.
5. If anything slips, fall back to using the boss skill chat directly. The app is a nice-to-have. The practice is not.

The honest answer is that **a Senior PM does not win this interview by building a tool**. They win it by doing 60–100 representative questions with deliberate review, and by being able to recite 5 frameworks from memory under pressure. The gym helps if it accelerates that. If it slows it down, it actively hurts.

Build the minimum. Practice the maximum. Ship the interview, not the app.
