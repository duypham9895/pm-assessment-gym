# PM Assessment Gym: Pre-exam day Battle Plan

**Status:** Strategic Filter of Original Blueprint  
**Deadline:** exam day, 2026-05-22  
**Focus:** Interview Readiness > App Completeness

---

## 1. The "Ruthless MVP" Scope
This is the only code that matters before exam day morning.

### A. The Test Runner (`/test`)
*   **Modes:** 
    *   `EXAM`: Timed, no feedback until end.
    *   `PRACTICE`: No timer, immediate "Correct/Incorrect" + Explanation after each choice.
*   **Features:** Timer (count down), Question Navigation, "Flag for Review" button, Progress Bar.
*   **Logic:** Support filtering questions by `Topic` for targeted drills.

### B. The Results Page (`/results/[id]`)
*   **Score Summary:** Total % and Raw Score.
*   **Weakness Table:** Group results by `Topic` (e.g., A/B Testing: 1/4 - 25%).
*   **The Review List:** A vertical list of *all* questions answered, highlighting the Correct Answer and the "Why" (Explanation).

### C. The Simple Dashboard (`/`)
*   **Action Buttons:** "Start Mock Exam", "Drill Weakest Topic".
*   **History:** A simple list of past scores (Date | Score | Mode).
*   **Countdown:** Large "T-Minus X Days" banner to keep pressure on.

---

## 2. Technical Shortcut Architecture
Zero infrastructure, maximum speed.

*   **State:** `useState` + `localStorage` (via a simple `useEffect` hook).
*   **Data Store:** A single `questions.ts` file exporting a large array.
*   **Styling:** Tailwind + Shadcn UI (Card, Button, Progress, Table).
*   **Navigation:** Next.js App Router (minimal folders).

---

## 3. High-Impact Content Inventory
You need questions, not code. Aim for this distribution in your `questions.ts`:

| Topic | Count | Focus Areas |
| :--- | :--- | :--- |
| **Product Analytics** | 15 | Funnels, Retention, Metric Trees |
| **Data Literacy** | 10 | Distributions, Sample Size, Base Rates |
| **A/B Testing** | 15 | P-values, MDE, Guardrail Metrics, SRM |
| **Data Interpretation**| 10 | Simpson's Paradox, Segment Mix, Table Reading |
| **Chart Reading** | 10 | Dual-axes, Log scales, Truncated Y-axes |
| **TOTAL** | **60** | *Enough for 2 Mocks + 3-4 specialized drills* |

---

## 4. Daily Execution Checklist

### Monday (Today): The Skeleton
- [ ] Initialize Next.js + Shadcn.
- [ ] Define `Question` and `Attempt` types.
- [ ] **Hard Task:** Manually input 21 questions from the `alooba-mock-test.skill` into `questions.ts`.
- [ ] Create the `/test` page shell.

### Tuesday: The Loop
- [ ] Build the `QuestionCard` (Choices + Feedback logic).
- [ ] Build the `Timer` and `Navigation`.
- [ ] Build the `Scoring` logic (Calculates % and Topic breakdown).
- [ ] Build the `/results` page.
- [ ] **Practice:** Take your first "Digital Mock" tonight.

### Wednesday: Content & Drills
- [ ] Add 20-30 *new* questions (Search for "PM Analytics Interview Questions").
- [ ] Implement the "Flag" and "Filter by Topic" features.
- [ ] Build the `/` Dashboard to show past scores.
- [ ] **Practice:** Drill your two weakest topics for 2 hours.

### Thursday: The Simulation
- [ ] Add "Immediate Feedback" toggle to Practice Mode.
- [ ] Finalize the "Mental Model" quick-reference page.
- [ ] **Simulation:** 
    *   30m: App Mock Test.
    *   120m: Written cases (Product Sense/Metrics) in a Google Doc.
    *   30m: Self-review using the app's Frameworks.

### exam day: Game Day
- [ ] **Warmup:** 10 random questions in "Practice Mode" (immediate feedback).
- [ ] Review the "Mistake Review" (filter Results for all 'incorrect').
- [ ] **Rest:** Stop 2 hours before the interview.

---

## 5. PM Framework Cheat Sheet (Static Page)
*Build this as a single `/frameworks` page for quick tab-switching.*

*   **A/B Testing:** "Is the MDE realistic? Did we check for SRM? Is this statistically significant or just a 'winning' trend?"
*   **Metrics:** "North Star -> Input Metrics (Reach, Depth, Frequency) -> Output Metrics (Revenue, Retention)."
*   **Diagnosis:** "Is the drop global or segment-specific? Is it a tracking bug or a seasonal trend? What changed in the release?"
*   **Prioritization:** "Impact vs. Effort. Does it move the North Star? What is the Confidence level (ICE)?"

---

## 6. The "Kill" List (Do NOT Build)
*   **NO** SQLite/Prisma (Use JSON + LocalStorage).
*   **NO** User Login/Auth.
*   **NO** AI-Generated Feedback (Just write good static explanations).
*   **NO** Animated Progress Charts (Just text and simple progress bars).
*   **NO** Simulation "Section Locks" (Just follow a timer manually).
