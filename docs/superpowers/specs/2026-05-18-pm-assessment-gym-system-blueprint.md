# PM Assessment Gym System Blueprint

**Date:** 2026-05-18  
**Owner:** Edward Pham  
**Project folder:** `/Users/edwardpham/Documents/Programming/Projects/pm-assessment`  
**Primary deadline:** exam day, 2026-05-22  
**Primary input skill:** `/Users/edwardpham/Documents/PM/Interview/Mock/alooba-mock-test.skill`

## 1. Purpose

PM Assessment Gym is a local training system for Product Manager interview assessments. The first goal is to help Edward prepare for a 3-hour PM interview test on exam day, 2026-05-22. The broader goal is to become a reusable PM assessment simulator that improves product analytics, data interpretation, A/B testing, product sense, prioritization, and written case performance.

The system should feel like a focused interview training workspace, not a generic quiz toy. It should help the user practice under pressure, understand mistakes, find weak areas, and repeat targeted drills until performance improves.

## 2. What The Boss Skill Provides

The custom skill `alooba-mock-test.skill` defines an Alooba-style Senior PM mock assessment flow:

- 21 total multiple-choice questions.
- Topics:
  - Product Analytics: 4 questions.
  - Data Literacy: 3 questions.
  - Chart Interpretation: 4 questions.
  - Inductive Reasoning: 3 questions.
  - Data Interpretation: 4 questions.
  - A/B Testing: 3 questions.
- Each question has five answer choices.
- The test should wait until all answers are submitted before scoring.
- The assessment output should include:
  - Total score.
  - Topic breakdown.
  - Wrong answers only.
  - Explanation for why the correct answer is right and why the chosen answer is wrong.
  - Gap summary with one mental model or framework per weak topic.

The first product version should preserve this structure but improve it with a user interface, timing, attempt history, weak-topic drills, and a training dashboard.

## 3. Success Criteria

### Before exam day, 2026-05-22

The system is successful if Edward can:

- Run at least three timed mock PM assessments.
- Review score and topic breakdown after each attempt.
- See which topics are weakest.
- Practice short drills for weak topics.
- Run one final 3-hour simulation.
- Review a concise final prep checklist before the interview.

### After exam day

The system is successful if it becomes a long-term PM training environment that can:

- Generate or load fresh PM assessment questions.
- Track progress over time.
- Store mistakes and explanations.
- Train PM case answers with rubrics.
- Support advanced product interview scenarios.
- Help prepare for better PM roles at stronger companies.

## 4. Product Principles

1. Practice must feel close to the real interview.
2. Feedback must be specific, not motivational fluff.
3. The system should expose weak thinking patterns, not only wrong answers.
4. Short drills should be easy to start after every test.
5. The pre-exam day scope should favor usefulness over completeness.
6. The long-term architecture should allow content expansion without rewriting the app.
7. The user interface should be calm, fast, and work-focused.

## 5. User Types

### Primary User

Edward, a PM candidate preparing for timed product management assessments and interviews.

### Secondary User

A mentor, boss, or reviewer who can add questions, inspect results, and suggest study areas.

### Future User

Other PM candidates who want a structured assessment simulator.

## 6. Main Training Modes

### Mode 1: Quick Mock Test

Purpose: Run the 21-question Alooba-style test from the boss skill.

Core behavior:

- User starts test.
- Timer starts.
- User answers 21 questions.
- User can navigate between questions.
- User submits.
- System scores the attempt.
- System shows total score, topic breakdown, wrong-answer explanations, and weak-topic summary.

Recommended time limit:

- 30 minutes for a 21-question quick test.

### Mode 2: Topic Drill

Purpose: Improve weak topics after a mock test.

Core behavior:

- System suggests weak topics based on latest attempt.
- User chooses a topic.
- System gives 5 to 10 focused questions.
- Feedback can be immediate or after completion.
- System records drill accuracy.

Topics:

- Product Analytics.
- Data Literacy.
- Chart Interpretation.
- Inductive Reasoning.
- Data Interpretation.
- A/B Testing.

### Mode 3: 3-Hour Simulation

Purpose: Simulate the assessment experience.

Recommended structure:

- Part A: 21-question MCQ assessment, 30 minutes.
- Part B: Product analytics case, 45 minutes.
- Part C: A/B testing or experiment design case, 35 minutes.
- Part D: Product sense and prioritization case, 45 minutes.
- Part E: Review and written reflection, 25 minutes.

Total: 180 minutes.

Core behavior:

- User starts simulation.
- System locks the sequence.
- Timer runs per section.
- User completes each part.
- System generates a final readiness report.

### Mode 4: Product Case Trainer

Purpose: Practice open-ended PM interview answers.

Case types:

- Define success metrics for a product.
- Diagnose a metric drop.
- Design an A/B test.
- Prioritize roadmap ideas.
- Improve activation, retention, or conversion.
- Evaluate marketplace, travel, ecommerce, fintech, or SaaS scenarios.

Core behavior:

- User receives prompt.
- User writes structured answer.
- System evaluates answer using rubric.
- User sees missing points and improved answer outline.

### Mode 5: Mistake Review

Purpose: Make mistakes reusable learning assets.

Core behavior:

- Every wrong answer is saved.
- Each mistake stores topic, concept, chosen answer, correct answer, explanation, and date.
- User can filter by topic or concept.
- User can mark a mistake as understood.
- Mistakes reappear in future drills until mastered.

### Mode 6: Study Plan

Purpose: Tell the user what to do next.

Core behavior:

- System recommends daily practice.
- Before exam day, recommendations are deadline-driven.
- After exam day, recommendations become skill-growth driven.

Pre-exam day example:

- Monday night: baseline mock test and review.
- Tuesday: weak-topic drills and one mock test.
- Wednesday: 3-hour simulation.
- Thursday: final mock, mistake review, framework review.
- exam day: light warmup only.

## 7. Minimum Viable Product Scope

The MVP should be buildable quickly and must prioritize interview readiness.

### MVP Must Include

- Home dashboard.
- Start quick mock test.
- Question screen with timer.
- Answer selection.
- Question navigation.
- Submit assessment.
- Score page.
- Topic breakdown.
- Wrong-answer review.
- Weak-topic summary.
- Basic drill mode.
- Attempt history in browser storage.
- Final prep checklist.

### MVP Should Not Include Yet

- User authentication.
- Payments.
- Cloud sync.
- Multi-user admin panel.
- Complex AI generation pipeline.
- Full database unless needed.
- Beautiful marketing landing page.

## 8. Recommended Tech Stack

### Frontend

- Next.js.
- TypeScript.
- Tailwind CSS.
- shadcn/ui or a small local component set.
- lucide-react for icons.

### State And Storage

MVP:

- Browser localStorage for attempts and preferences.
- Static TypeScript or JSON files for seed questions.

Post-MVP:

- SQLite with Prisma.
- Optional local-first sync later.

### Testing

- Unit tests for scoring and topic breakdown.
- Component tests for quiz flow if practical.
- Playwright browser verification for the main flows.

### Content Format

Question content should live in structured data files so new question packs can be added without changing the UI.

## 9. System Architecture

### High-Level Modules

1. App shell.
2. Assessment engine.
3. Question bank.
4. Timer engine.
5. Scoring engine.
6. Feedback engine.
7. Drill engine.
8. Attempt storage.
9. Dashboard analytics.
10. Case trainer.
11. Study plan engine.

### Data Flow

1. User starts a test.
2. Assessment engine creates a session from the question bank.
3. Timer engine tracks duration.
4. User answers questions.
5. Session state stores selected answers.
6. User submits.
7. Scoring engine compares answers to answer key.
8. Feedback engine creates explanations and weak-topic summary.
9. Attempt storage saves result.
10. Dashboard updates progress and recommendations.

## 10. Proposed File Structure

This structure assumes a Next.js app.

```text
pm-assessment/
  app/
    page.tsx
    assessment/
      page.tsx
      [sessionId]/
        page.tsx
    results/
      [attemptId]/
        page.tsx
    drills/
      page.tsx
    simulation/
      page.tsx
    cases/
      page.tsx
    mistakes/
      page.tsx
    study-plan/
      page.tsx
  components/
    app-shell.tsx
    dashboard/
      readiness-card.tsx
      topic-progress.tsx
      recent-attempts.tsx
      next-actions.tsx
    assessment/
      assessment-header.tsx
      question-card.tsx
      answer-choice.tsx
      question-nav.tsx
      timer.tsx
      submit-dialog.tsx
    results/
      score-summary.tsx
      topic-breakdown.tsx
      wrong-answer-review.tsx
      gap-summary.tsx
    drills/
      drill-topic-picker.tsx
      drill-session.tsx
    cases/
      case-prompt.tsx
      case-answer-editor.tsx
      rubric-review.tsx
  lib/
    assessment/
      create-session.ts
      scoring.ts
      topic-breakdown.ts
      feedback.ts
      weak-topics.ts
      timer.ts
    storage/
      local-attempt-store.ts
      local-settings-store.ts
    study-plan/
      pre-exam-plan.ts
      recommendations.ts
    cases/
      rubrics.ts
      prompts.ts
  content/
    question-banks/
      alooba-senior-pm-v1.ts
      drill-product-analytics-v1.ts
      drill-data-literacy-v1.ts
      drill-chart-interpretation-v1.ts
      drill-inductive-reasoning-v1.ts
      drill-data-interpretation-v1.ts
      drill-ab-testing-v1.ts
    cases/
      product-analytics-cases.ts
      experiment-design-cases.ts
      product-sense-cases.ts
  types/
    assessment.ts
    attempts.ts
    topics.ts
    cases.ts
  docs/
    superpowers/
      specs/
        2026-05-18-pm-assessment-gym-system-blueprint.md
    review/
      llm-review-prompt.md
```

## 11. Core Data Types

### Topic

```ts
type Topic =
  | "product_analytics"
  | "data_literacy"
  | "chart_interpretation"
  | "inductive_reasoning"
  | "data_interpretation"
  | "ab_testing";
```

### Question

```ts
type Question = {
  id: string;
  topic: Topic;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  choices: {
    id: "A" | "B" | "C" | "D" | "E";
    text: string;
  }[];
  correctChoiceId: "A" | "B" | "C" | "D" | "E";
  explanation: string;
  whyWrong?: Partial<Record<"A" | "B" | "C" | "D" | "E", string>>;
  conceptTags: string[];
  estimatedSeconds: number;
};
```

### Assessment Session

```ts
type AssessmentSession = {
  id: string;
  mode: "quick_mock" | "topic_drill" | "three_hour_simulation";
  startedAt: string;
  timeLimitSeconds: number;
  questionIds: string[];
  answers: Record<string, "A" | "B" | "C" | "D" | "E">;
  currentQuestionIndex: number;
  status: "in_progress" | "submitted" | "expired";
};
```

### Attempt Result

```ts
type AttemptResult = {
  id: string;
  sessionId: string;
  mode: "quick_mock" | "topic_drill" | "three_hour_simulation";
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  totalQuestions: number;
  correctCount: number;
  percent: number;
  topicBreakdown: Record<Topic, {
    correct: number;
    total: number;
    percent: number;
  }>;
  wrongAnswers: WrongAnswerReview[];
  weakTopics: WeakTopic[];
};
```

### Wrong Answer Review

```ts
type WrongAnswerReview = {
  questionId: string;
  topic: Topic;
  conceptTags: string[];
  chosenChoiceId: "A" | "B" | "C" | "D" | "E";
  correctChoiceId: "A" | "B" | "C" | "D" | "E";
  explanation: string;
  whyChosenAnswerFailed: string;
};
```

## 12. Scoring Rules

### Quick Mock Test

- Total score = correct answers out of 21.
- Percent = correct answers divided by 21.
- Topic score = correct answers in topic divided by topic question count.

### Weak Topic Detection

A topic is weak if:

- Topic score is below 70 percent, or
- User missed at least 2 questions in that topic, or
- User repeatedly misses the same concept tag across attempts.

### Readiness Score

Initial formula:

```text
readiness = 
  50% latest mock score
  + 25% average of last 3 mock scores
  + 15% weak-topic improvement
  + 10% time management score
```

Time management score:

- 100 if user submits within time and answers all questions.
- 70 if user submits within time but leaves questions unanswered.
- 40 if user expires with more than 10 percent unanswered.

## 13. Feedback Rules

Feedback should be direct and practical.

Each result page should show:

- Score.
- Topic breakdown.
- Weak topics.
- Wrong-answer explanations.
- Suggested next action.

Feedback should avoid:

- Generic encouragement.
- Long theory dumps.
- Overexplaining correct answers the user already got right.

Feedback should include:

- Why the correct answer is right.
- Why the user's answer failed.
- The mental model to use next time.
- A short targeted drill recommendation.

## 14. Topic Mental Models

### Product Analytics

Mental models:

- Funnel step diagnosis.
- Cohort retention analysis.
- Activation vs engagement vs retention.
- Input metric vs output metric.
- Leading vs lagging indicators.

Common traps:

- Optimizing only top-of-funnel metrics.
- Confusing DAU growth with retention.
- Ignoring denominator changes.
- Missing cohort mix shifts.

### Data Literacy

Mental models:

- Confidence interval interpretation.
- Variance and standard error.
- Sample size and power.
- Base rate thinking.
- Distribution shape and outliers.

Common traps:

- Treating non-overlapping averages as proof.
- Ignoring sample size.
- Confusing correlation with causation.
- Overreacting to noisy small samples.

### Chart Interpretation

Mental models:

- Check axes first.
- Compare rates before counts.
- Separate trend, seasonality, and outliers.
- Look for scale manipulation.
- Verify whether dual-axis charts imply false correlation.

Common traps:

- Reading absolute differences when percentages matter.
- Missing axis truncation.
- Confusing cumulative and daily metrics.
- Ignoring segment mix.

### Inductive Reasoning

Mental models:

- Difference sequence.
- Ratio sequence.
- Alternating pattern.
- Row-column transformation.
- Odd-one-out by rule.

Common traps:

- Choosing the first visible pattern.
- Ignoring alternating positions.
- Overfitting a complicated rule.
- Missing simple arithmetic relations.

### Data Interpretation

Mental models:

- Table reading.
- Segment comparison.
- Outlier handling.
- Correlation vs causation.
- Simpson's paradox.

Common traps:

- Comparing raw numbers across unequal groups.
- Ignoring denominator.
- Treating an outlier as trend.
- Drawing causal conclusions from descriptive data.

### A/B Testing

Mental models:

- Hypothesis, metric, sample, decision.
- Minimum detectable effect.
- Power and sample size.
- P-value interpretation.
- Sample ratio mismatch.
- Novelty effect.

Common traps:

- Stopping tests early.
- Optimizing secondary metrics while primary metric fails.
- Ignoring guardrail metrics.
- Treating statistical significance as business significance.

## 15. Screen Requirements

### Home Dashboard

Purpose:

- Give the user a clear next action.
- Show readiness and weak topics.
- Make it easy to start a mock test or drill.

Content:

- Readiness score.
- Next recommended action.
- Latest mock score.
- Topic progress chart.
- Recent attempts.
- exam day countdown.

Primary actions:

- Start Quick Mock.
- Start Weak Topic Drill.
- Start 3-Hour Simulation.
- Review Mistakes.

### Assessment Start Screen

Purpose:

- Set expectations before starting.

Content:

- Assessment name.
- Number of questions.
- Time limit.
- Topic distribution.
- Rules.

Primary action:

- Start Test.

### Assessment Question Screen

Purpose:

- Let the user answer questions efficiently under time pressure.

Content:

- Timer.
- Question number.
- Topic label.
- Question prompt.
- Five answer choices.
- Question navigation.
- Answered/unanswered status.

Primary actions:

- Previous.
- Next.
- Submit.

Behavior:

- Selecting an answer should be fast.
- Navigation should preserve answers.
- Submit should warn about unanswered questions.
- Expired timer should either auto-submit or force submission.

### Results Screen

Purpose:

- Tell the user how they performed and what to do next.

Content:

- Score.
- Percent.
- Topic breakdown.
- Weak topics.
- Wrong-answer explanations.
- Next recommended drill.

Primary actions:

- Start Drill From Weak Topics.
- Review Mistakes.
- Run Another Mock.
- Go Home.

### Drill Screen

Purpose:

- Focus on one weak area.

Content:

- Topic selector.
- Concept tags.
- Short set of questions.
- Feedback mode selector: immediate or after drill.

Primary actions:

- Start Drill.
- Submit Drill.
- Retry Topic.

### 3-Hour Simulation Screen

Purpose:

- Rehearse the real test structure.

Content:

- Section list.
- Current section.
- Timer.
- Progress.
- Answer area.
- Section submission.

Sections:

- MCQ quick mock.
- Product analytics case.
- A/B test design case.
- Product prioritization case.
- Reflection and review.

### Mistake Review Screen

Purpose:

- Let the user study past errors.

Content:

- Filters by topic, concept, date, and mastered status.
- Wrong answer cards.
- Correct answer.
- Explanation.
- Mental model.
- Mark as understood button.

### Study Plan Screen

Purpose:

- Guide daily preparation.

Content:

- Today plan.
- Tomorrow plan.
- exam day warmup.
- Weak-topic priorities.
- Recommended time blocks.

## 16. Content Requirements

### Question Bank Requirements

Each question should:

- Have one clearly correct answer.
- Be answerable in 45 to 90 seconds.
- Use realistic PM/product analytics scenarios.
- Include plausible distractors.
- Include a clear explanation.
- Include concept tags.

### Initial Content Pack

Minimum for MVP:

- 21-question senior PM mock test.
- 5 drill questions per topic.
- 3 product analytics case prompts.
- 3 A/B testing case prompts.
- 3 product sense/prioritization prompts.

Better pre-exam day target:

- 2 full mock tests.
- 10 drill questions per topic.
- 1 complete 3-hour simulation template.

## 17. Open-Ended Case Rubrics

### Product Analytics Case Rubric

Score dimensions:

- Problem framing.
- North Star and supporting metrics.
- Funnel or cohort logic.
- Segmentation.
- Diagnosis of root causes.
- Tradeoffs and next steps.

### A/B Testing Case Rubric

Score dimensions:

- Clear hypothesis.
- Primary metric.
- Guardrail metrics.
- Sample size or power awareness.
- Experiment design.
- Decision criteria.
- Risk handling.

### Product Sense Case Rubric

Score dimensions:

- User and problem clarity.
- Goal definition.
- Segmentation.
- Solution options.
- Prioritization logic.
- Success metrics.
- Risks and tradeoffs.

### Prioritization Case Rubric

Score dimensions:

- Clear business goal.
- User impact.
- Effort or complexity.
- Confidence.
- Dependency awareness.
- Decision explanation.

## 18. Implementation Phases

### Phase 0: Documentation And Alignment

Goal:

- Create the system blueprint and confirm scope before coding.

Steps:

1. Read the boss mock-test skill.
2. Summarize its assessment structure.
3. Define product goal and deadline.
4. Define MVP and post-MVP scope.
5. Write the system blueprint.
6. Write an LLM review prompt.
7. Review feedback from another LLM.
8. Finalize build scope.

Deliverables:

- System blueprint document.
- Review prompt document.
- Finalized implementation plan.

Acceptance criteria:

- Another LLM or reviewer can understand exactly what will be built.
- Scope is divided into pre-exam day and post-exam day work.
- No major feature is ambiguous.

### Phase 1: Project Scaffold

Goal:

- Create the web app foundation.

Steps:

1. Initialize Next.js project.
2. Add TypeScript.
3. Add Tailwind CSS.
4. Add linting and formatting.
5. Add base app layout.
6. Add route structure.
7. Add shared type definitions.
8. Add initial content folder.
9. Add local storage utility.
10. Run development server.
11. Verify home page loads.

Deliverables:

- Working local web app.
- Basic navigation.
- Empty pages for core modes.

Acceptance criteria:

- `npm run dev` starts the app.
- User can open the dashboard.
- Routes exist for assessment, results, drills, simulation, mistakes, and study plan.

### Phase 2: Question Bank And Assessment Engine

Goal:

- Load structured questions and create test sessions.

Steps:

1. Define `Topic`, `Question`, `AssessmentSession`, and `AttemptResult` types.
2. Create first 21-question mock test content file.
3. Add topic distribution validation.
4. Build session creation function.
5. Build answer update function.
6. Build question navigation state.
7. Build unanswered question detection.
8. Add unit tests for session creation.
9. Add unit tests for answer updates.
10. Connect session state to UI.

Deliverables:

- Structured question bank.
- Session creation logic.
- In-progress assessment state.

Acceptance criteria:

- Starting a mock creates a 21-question session.
- Topic distribution matches the boss skill.
- User answers persist during navigation.

### Phase 3: Timed Assessment UI

Goal:

- Create the realistic test-taking experience.

Steps:

1. Build assessment start screen.
2. Build timer component.
3. Build question card.
4. Build answer choice component.
5. Build question navigation component.
6. Build submit dialog.
7. Add unanswered question warning.
8. Add expired-time behavior.
9. Add keyboard shortcuts if time allows.
10. Verify mobile and desktop layout.

Deliverables:

- Full test-taking interface.

Acceptance criteria:

- User can complete all 21 questions.
- Timer is visible.
- User can move between questions.
- User can submit.
- Submission creates a result.

### Phase 4: Scoring And Results

Goal:

- Score attempts and show useful feedback.

Steps:

1. Build scoring function.
2. Build topic breakdown function.
3. Build weak-topic detection.
4. Build wrong-answer review generation.
5. Build result persistence.
6. Build score summary UI.
7. Build topic breakdown UI.
8. Build wrong-answer review UI.
9. Build gap summary UI.
10. Add unit tests for scoring.
11. Add unit tests for weak-topic detection.

Deliverables:

- Results page.
- Attempt records.
- Weak-topic summary.

Acceptance criteria:

- Total score is correct.
- Topic scores are correct.
- Wrong-answer explanations show only missed questions.
- Weak topics are clearly identified.

### Phase 5: Attempt History And Dashboard

Goal:

- Make practice progress visible.

Steps:

1. Build local attempt store.
2. Save every submitted attempt.
3. Load recent attempts.
4. Compute latest score.
5. Compute average score.
6. Compute topic progress.
7. Compute readiness score.
8. Build dashboard cards.
9. Build recent attempts list.
10. Build next recommended action.

Deliverables:

- Home dashboard with progress and recommendations.

Acceptance criteria:

- User sees latest score.
- User sees topic weakness.
- User sees suggested next action.
- Attempts persist after page reload.

### Phase 6: Topic Drill Mode

Goal:

- Let the user practice weak topics directly.

Steps:

1. Create drill question content per topic.
2. Build drill topic picker.
3. Build drill session creation.
4. Build immediate feedback option.
5. Build end-of-drill feedback option.
6. Save drill attempts.
7. Recommend drills from weak topics.
8. Add drill results to dashboard.
9. Add unit tests for drill selection.

Deliverables:

- Topic drill mode.

Acceptance criteria:

- User can select a weak topic.
- User can complete a 5 to 10 question drill.
- Drill results are saved.
- Dashboard uses drill history in recommendations.

### Phase 7: Mistake Review

Goal:

- Turn missed questions into a study system.

Steps:

1. Define mistake review data structure.
2. Save wrong answers into mistake store.
3. Build mistake list.
4. Add topic filter.
5. Add concept tag filter.
6. Add mastered/unmastered status.
7. Add mark-as-understood action.
8. Add retry similar drill action.
9. Add mistake count to dashboard.

Deliverables:

- Mistake review page.

Acceptance criteria:

- User can inspect missed questions.
- User can filter by topic.
- User can mark mistakes as understood.
- Unmastered mistakes influence recommendations.

### Phase 8: Study Plan And exam day Prep

Goal:

- Help the user use remaining time wisely before the interview.

Steps:

1. Encode the May 18 to May 22 preparation schedule.
2. Build today/tomorrow/final-day recommendations.
3. Connect recommendations to latest attempt data.
4. Add final prep checklist.
5. Add light warmup mode for exam day.
6. Add "do not overpractice today" warning on exam day.

Deliverables:

- Study plan page.
- Interview countdown plan.

Acceptance criteria:

- User sees a concrete plan for each remaining day.
- Plan adapts to weak topics.
- exam day plan favors calm review over heavy new practice.

### Phase 9: 3-Hour Simulation

Goal:

- Rehearse a full assessment experience.

Steps:

1. Define simulation section model.
2. Create MCQ section using quick mock.
3. Create product analytics case prompt.
4. Create A/B testing case prompt.
5. Create product sense/prioritization prompt.
6. Build simulation start screen.
7. Build section timer.
8. Build section navigation.
9. Save written answers.
10. Build simulation summary.
11. Add rubric self-review for written cases.

Deliverables:

- 3-hour simulation mode.

Acceptance criteria:

- User can start a 180-minute simulation.
- Each section has its own instructions and timer.
- Written answers are saved.
- Final summary shows MCQ score and written-case self-review prompts.

### Phase 10: Product Case Trainer

Goal:

- Train open-ended PM interview answers.

Steps:

1. Add case prompt bank.
2. Build case category picker.
3. Build answer editor.
4. Build rubric display.
5. Build self-score flow.
6. Build example answer outline.
7. Save case attempts.
8. Show case history.
9. Add case recommendations to dashboard.

Deliverables:

- Product case training mode.

Acceptance criteria:

- User can practice product analytics, A/B testing, and product sense cases.
- User can compare answer to rubric.
- Case attempts are saved.

### Phase 11: AI Feedback Layer

Goal:

- Add optional LLM feedback once core system works.

Steps:

1. Define feedback prompt templates.
2. Add user-configurable API key flow if needed.
3. Send case answer and rubric to model.
4. Return structured feedback.
5. Save feedback with attempt.
6. Add retry-improved-answer flow.
7. Add safeguards against vague feedback.

Deliverables:

- AI-assisted case review.

Acceptance criteria:

- AI feedback references the rubric.
- Feedback includes missing points and improved answer outline.
- User can compare first answer and improved answer.

### Phase 12: Content Expansion

Goal:

- Increase practice variety.

Steps:

1. Add multiple full mock tests.
2. Add more drill questions per topic.
3. Add company-specific PM scenarios.
4. Add travel marketplace scenarios.
5. Add SaaS growth scenarios.
6. Add ecommerce conversion scenarios.
7. Add fintech risk scenarios.
8. Add more chart interpretation questions.
9. Add harder A/B testing questions.
10. Add question quality review checklist.

Deliverables:

- Larger question and case library.

Acceptance criteria:

- User can run multiple fresh mocks.
- Repeated tests do not feel identical.
- Questions remain calibrated to 45 to 90 seconds.

### Phase 13: Data Persistence Upgrade

Goal:

- Move beyond browser-only storage if long-term usage needs it.

Steps:

1. Add SQLite.
2. Add Prisma.
3. Create schema for attempts, answers, mistakes, case attempts, and settings.
4. Migrate localStorage data.
5. Add export/import.
6. Add backup file.

Deliverables:

- Durable local database.

Acceptance criteria:

- Attempt history survives browser storage clearing if exported.
- Data can be backed up and restored.

### Phase 14: Polish And Verification

Goal:

- Make the app reliable and pleasant.

Steps:

1. Verify all key flows manually.
2. Add Playwright tests for quick mock.
3. Add Playwright tests for results review.
4. Add Playwright tests for drill mode.
5. Check mobile layout.
6. Check timer behavior.
7. Check empty states.
8. Check localStorage failure handling.
9. Check content typos.
10. Fix visual issues.

Deliverables:

- Stable app ready for repeated practice.

Acceptance criteria:

- User can complete all major flows without errors.
- UI does not overlap on desktop or mobile.
- Scores remain correct across repeated attempts.

## 19. Pre-exam day Build Priority

The deadline means the build should be staged carefully.

### Must Build Before exam day

1. App scaffold.
2. Quick mock test.
3. Timer.
4. Scoring.
5. Results review.
6. Weak-topic summary.
7. Drill mode.
8. Attempt history.
9. Study plan.

### Nice To Build Before exam day

1. 3-hour simulation.
2. Mistake review.
3. Case trainer.
4. Dashboard charts.

### Safe To Build After exam day

1. AI feedback.
2. Database.
3. More content packs.
4. Multi-user features.
5. Content authoring tools.

## 20. Recommended Daily Execution Plan

### Monday, 2026-05-18

Focus:

- Documentation and app foundation.

Steps:

1. Finalize blueprint.
2. Scaffold app.
3. Build static dashboard.
4. Add assessment route.
5. Add question data model.
6. Add first question bank.

Practice:

- Take one baseline mock test manually or in-app if ready.

### Tuesday, 2026-05-19

Focus:

- Test flow and scoring.

Steps:

1. Finish question UI.
2. Add timer.
3. Add submit flow.
4. Add scoring.
5. Add result page.
6. Add weak-topic detection.
7. Add first drills.

Practice:

- Take one timed mock.
- Review all wrong answers.
- Drill weakest two topics.

### Wednesday, 2026-05-20

Focus:

- Simulation and case practice.

Steps:

1. Add attempt history.
2. Add dashboard recommendations.
3. Add 3-hour simulation shell.
4. Add case prompts.
5. Add rubrics.

Practice:

- Run one 3-hour simulation.
- Write down top 5 mistakes.

### Thursday, 2026-05-21

Focus:

- Stabilize and polish.

Steps:

1. Fix bugs from simulation.
2. Improve results explanations.
3. Add mistake review if not done.
4. Verify key flows.
5. Prepare exam day checklist.

Practice:

- One final timed mock.
- Drill only weak topics.
- Review frameworks.

### exam day, 2026-05-22

Focus:

- Calm readiness.

Steps:

1. Do one short 10-question warmup.
2. Review mistake summaries.
3. Review PM frameworks.
4. Stop heavy practice.

Practice:

- No full mock unless the interview is late in the day and energy is high.

## 21. PM Framework Library

The system should include short references for:

### Metrics

- North Star Metric.
- Input/output metrics.
- HEART framework.
- Pirate metrics: acquisition, activation, retention, referral, revenue.
- Funnel analysis.
- Cohort retention.

### Experimentation

- Hypothesis.
- Primary metric.
- Guardrail metrics.
- MDE.
- Power.
- P-value.
- Sample ratio mismatch.
- Novelty effect.

### Prioritization

- RICE.
- ICE.
- Impact vs effort.
- MoSCoW.
- Opportunity sizing.

### Product Sense

- User segmentation.
- Jobs to be Done.
- Pain point framing.
- Solution tradeoffs.
- MVP definition.

### Root Cause Analysis

- Metric tree.
- Funnel decomposition.
- Segment comparison.
- Cohort comparison.
- External factors.
- Instrumentation checks.

## 22. Risks And Mitigations

### Risk: Too Much Product, Not Enough Practice

Mitigation:

- Build the quick mock and scoring first.
- Do not spend too much time on visual polish before the first working test.

### Risk: Question Quality Is Weak

Mitigation:

- Keep the boss skill's structure.
- Require explanations and concept tags for every question.
- Review questions manually before relying on scores.

### Risk: Overbuilding Before exam day

Mitigation:

- Treat AI feedback, database, and admin tools as post-exam day.
- Prioritize flows that directly improve readiness.

### Risk: Local Storage Data Loss

Mitigation:

- MVP accepts this risk.
- Add export/import after core flows work.

### Risk: Scoring Bugs

Mitigation:

- Unit test scoring with known answers.
- Validate topic totals match expected distribution.

## 23. Testing Strategy

### Unit Tests

Test:

- Session creation.
- Topic distribution.
- Answer selection.
- Scoring.
- Topic breakdown.
- Weak-topic detection.
- Readiness score.

### Browser Tests

Test:

- User can start mock.
- User can answer all questions.
- User can submit.
- User can view results.
- User can start a drill from weak topic.

### Manual Verification

Check:

- Timer display.
- Submit warning.
- Results correctness.
- Persistence after reload.
- Mobile layout.
- Empty history state.

## 24. Build Order Recommendation

Build in this exact order:

1. Scaffold Next.js app.
2. Add topic and question types.
3. Add first question bank.
4. Build session creation.
5. Build assessment screen.
6. Build timer.
7. Build submit flow.
8. Build scoring.
9. Build results page.
10. Save attempts.
11. Build dashboard.
12. Build weak-topic drills.
13. Build mistake review.
14. Build study plan.
15. Build 3-hour simulation.
16. Build case trainer.
17. Add AI feedback.
18. Expand content.

## 25. Definition Of Done For MVP

The MVP is done when:

- A user can start a 21-question mock test.
- A user can answer questions under a timer.
- A user can submit and receive a correct score.
- Topic breakdown matches the boss skill distribution.
- Wrong answers show explanations.
- Weak topics are identified.
- A user can launch a drill from a weak topic.
- Attempt history persists after refresh.
- Dashboard recommends the next useful practice action.
- The app runs locally without setup confusion.

## 26. Definition Of Done For Full System

The full system is done when:

- Multiple mock tests exist.
- Drills exist for every topic.
- Mistake review is useful and filterable.
- 3-hour simulation works end to end.
- Case trainer supports multiple PM interview types.
- Dashboard shows meaningful progress over time.
- AI feedback can evaluate written cases.
- Data can be exported or stored durably.
- The user can use it repeatedly for future PM interviews.

## 27. Questions For Review

Ask another LLM or reviewer:

1. Is this plan too large for the deadline?
2. Which features should be cut from the pre-exam day scope?
3. Are the PM topics sufficient for a Senior PM assessment?
4. Are any key PM interview skills missing?
5. Is the data model enough for scoring and progress tracking?
6. Is localStorage acceptable for MVP?
7. Are the phases in the right order?
8. What should be tested first?
9. How should open-ended case feedback be improved?
10. What is the biggest risk in this plan?

## 28. Recommended Final Scope For First Build

For the first implementation pass, build only:

1. Dashboard.
2. Quick mock test.
3. Timer.
4. Results page.
5. Topic breakdown.
6. Wrong-answer review.
7. Attempt history.
8. Weak-topic drill mode.
9. Study plan page.

This is enough to help with the interview. Everything else can be layered in after the core practice loop works.
