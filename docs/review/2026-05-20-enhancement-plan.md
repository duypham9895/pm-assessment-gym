# PM Assessment Gym Enhancement Plan

**Date:** 2026-05-20  
**Role:** Second-agent product, UI/UX, and content review  
**Scope:** Enhancement plan only. No source changes.

## 1. Target User And Product Purpose

PM Assessment Gym exists to help Edward prepare for a PM interview assessment on exam day. The primary user is time-constrained, slightly anxious, and trying to convert practice into measurable readiness fast.

The product should feel like an exam-prep cockpit, not a marketing site or generic quiz app. Its job is to help Edward:

- Start the most useful practice session in under 10 seconds.
- Practice under realistic time pressure.
- Identify weak topics and false confidence.
- Review mistakes with clear explanations.
- Drill weak areas immediately.
- Refresh practical PM frameworks before or after practice.

## 2. Prioritized Feedback

### Senior UI/UX Feedback

**P0: Make the next best action obvious on every screen.**  
Home should lead with a recommendation such as "Start baseline mock" or "Drill A/B Testing from your last result." Results should lead with the next practice plan before secondary explanation.

**P0: Turn unanswered warnings into navigation.**  
The submit warning lists unanswered questions, but it should let Edward jump directly to the first unanswered question or any listed question. This preserves focus under time pressure.

**P1: Make latest attempts interpretable without mental math.**  
Recent attempts should show trend and implication, not only raw score. Example: "0/21 · Baseline incomplete · Retry full mock" or "14/21 · Weakest: Data Literacy · Drill next."

**P1: Keep dense, calm layouts.**  
The current restrained style is directionally right. Improve hierarchy with compact recommendation strips, clearer primary buttons, and less explanatory content above the fold.

**P2: Reduce home-screen education.**  
Scoring and confidence explanations are useful, but they should be secondary or collapsible. Exam-day users need action first, explanation second.

### Senior Content Writer Feedback

**P0: Replace MVP-ish copy with assessment-ready language.**  
Use direct, confident copy: "Set your baseline", "Drill weakest topic", "Review false confidence", "Refresh frameworks." Avoid copy that sounds like the app is explaining itself.

**P0: Write result copy as coaching, not reporting.**  
Results should say what the score means and what to do next. Example: "Your highest-risk miss is a confident wrong answer in A/B Testing. Review it, then run a 10-question drill."

**P1: Make confidence language sharper.**  
"Confidence does not change your score" is accurate but instructional. Better: "Confident misses are reviewed first because they are the easiest mistakes to repeat."

**P1: Improve empty and edge states.**  
For no attempts, say: "Start a Full Mock in Exam mode to set your baseline." For perfect score, say: "No weak topic found. Run another mock or refresh frameworks."

**P2: Keep framework content skimmable.**  
Frameworks should read like checklists Edward can recall during assessment, not study notes.

### Head Of Product Feedback

**P0: Optimize the core loop, not feature count.**  
The winning loop is Baseline Mock -> Results -> Weakest Drill -> Review -> Repeat. Every enhancement should shorten or strengthen this loop.

**P0: Add a concrete post-result practice plan.**  
Results should generate a simple next plan: primary drill topic, recommended feedback mode, and what to review first. This turns assessment into training.

**P1: Surface false-confidence insight as a first-class signal.**  
Wrong answers with confidence 3 are the highest product value. Show count, topic, and review CTA near the top of Results.

**P1: Make practice history actionable.**  
Latest attempts should support decisions: retry baseline, continue weakest-topic drill, or switch to frameworks. Avoid passive logs.

**P2: Keep scope exam-day focused.**  
Do not build accounts, dashboards, leaderboards, streaks, or broad analytics until the app is consistently improving readiness.

## 3. Recommended Implementation Plan

### Phase 1: Action-First Home

- Add a compact "Recommended next" strip above session controls.
- If no attempts exist, recommend Full Mock + Exam mode.
- If latest attempt has a weakest topic, recommend Topic Drill + Practice mode for that topic.
- Move scoring and confidence education below Latest Attempts or behind a compact details block.
- Rewrite home copy to prioritize readiness actions over feature explanation.

### Phase 2: Actionable Attempts

- Rework Latest Attempts into decision rows:
  - Score and mode.
  - Weakest topic.
  - One recommended action.
  - Optional small trend indicator when at least two attempts exist.
- Treat incomplete or very low-score attempts as "baseline incomplete" and recommend retrying a Full Mock.

### Phase 3: Results As A Coaching Plan

- Add a top Results section called "Next Practice Plan."
- Include:
  - Primary action: drill weakest topic.
  - Review priority: number of confident misses.
  - Secondary action: start another full mock only after reviewing mistakes.
- Add a false-confidence summary before the full wrong-answer list.
- Keep topic breakdown, but place it after the recommended plan.

### Phase 4: Faster Unanswered Recovery

- In the submit warning, add "Jump to first unanswered."
- Make each unanswered question number clickable or reuse the existing navigator behavior.
- Keep "Submit anyway" available, but secondary.

### Phase 5: Content And Microcopy Polish

- Replace generic labels with exam-prep verbs:
  - "Start" -> "Start full mock" or "Start drill."
  - "Suggested Drill" -> "Next drill."
  - "Wrong Answer Review" -> "Mistakes to fix."
- Tighten framework page headings into recall prompts.
- Add short coaching lines for result states: no wrong answers, no weak topic, incomplete attempt, and confident misses.

### Phase 6: Verification

- Test no-attempt home state.
- Test latest-attempt home state.
- Test full mock submit with unanswered questions and jump behavior.
- Test results with:
  - No wrong answers.
  - Wrong answers with confidence 3.
  - Topic drill attempts.
  - Mobile viewport.
- Confirm `npm run build` and question validation still pass.

## 4. What To Avoid

- Do not turn the home screen into a landing page.
- Do not add broad dashboards before the core practice loop is sharper.
- Do not over-explain scoring before Edward starts practice.
- Do not add gamification, streaks, badges, or social comparison.
- Do not make copy sound experimental, MVP-like, or apologetic.
- Do not bury weak-topic and false-confidence signals below raw tables.
- Do not expand the product into general PM learning; keep it focused on assessment readiness.
- Do not add heavy visual decoration. Calm, dense, legible UI is the right tone.
