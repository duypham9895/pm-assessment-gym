# Share Flow Fast First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Refactor the Results share workflow so a Safe Summary packet is immediately copyable, while senior-review context remains optional enrichment.

**Architecture:** Keep share packet derivation in `src/shareReport.ts`, keep modal orchestration in `src/App.tsx`, and keep visual treatment in `src/styles.css`. Preserve the existing packet schema and `/shared-review` parser by generating defaults through the existing `ShareCandidateContext` fields.

**Tech Stack:** React + TypeScript, Vite, Vitest, Testing Library, localStorage, Markdown packet rendering.

---

## File Structure

- Modify `src/shareReport.ts`: add default context derivation and keep packet schema version `1`.
- Modify `src/shareReport.test.ts`: add tests for default context inference and Safe Summary content omission.
- Modify `src/App.tsx`: refactor `ShareReviewDialog` so copy is enabled on open, Safe Summary is default, and senior context is expandable.
- Modify `src/App.test.tsx`: replace gated-copy expectations with ungated default copy, Senior Brief opt-in, optional context reveal, and preview update coverage.
- Modify `src/styles.css`: add summary-first modal styles and responsive optional-context layout.
- Modify `README.md`: document immediately copyable Safe Summary, optional context, and trusted Senior Brief behavior.

## Task 1: Add Default Share Context Tests

**Files:**
- Modify: `src/shareReport.test.ts`
- Modify: `src/shareReport.ts`

- [x] **Step 1: Write failing tests for default share context**

Add `getDefaultShareContext` to the import list and add tests that exercise exam and practice defaults:

```ts
import {
  buildShareReviewPacket,
  getDefaultShareContext,
  parseShareReviewPacketText,
  renderShareReviewMarkdown,
  type ShareCandidateContext,
} from "./shareReport";

it("derives ungated default context for an exam attempt", () => {
  const { attempt } = makeAttempt();

  const context = getDefaultShareContext(attempt);

  expect(context).toMatchObject({
    identityMode: "anonymous",
    displayLabel: "",
    targetRoleOrAssessment: "PM analytical assessment practice",
    testConditions: "timed_uninterrupted",
  });
  expect(context.feedbackRequest).toMatch(/reasoning risk/i);
});

it("marks practice attempts as learning artifacts by default", () => {
  const { attempt } = makeAttempt();

  const context = getDefaultShareContext({ ...attempt, feedbackMode: "practice" });

  expect(context.testConditions).toBe("practice_learning");
});
```

- [x] **Step 2: Run the focused test and verify it fails**

Run: `npm run test -- src/shareReport.test.ts`

Expected: FAIL because `getDefaultShareContext` is not exported.

- [x] **Step 3: Implement default context helper**

Add this exported helper in `src/shareReport.ts` near the label helpers:

```ts
export function getDefaultShareContext(attempt: Attempt): ShareCandidateContext {
  return {
    identityMode: "anonymous",
    displayLabel: "",
    targetRoleOrAssessment: "PM analytical assessment practice",
    feedbackRequest:
      "Review my highest-risk PM reasoning patterns and the next practice step I should take.",
    testConditions:
      attempt.feedbackMode === "practice" ? "practice_learning" : "timed_uninterrupted",
    deadline: "",
    targetCompanyOrProductArea: "",
    selfAssessment: "",
    seniorQuestion: "",
  };
}
```

- [x] **Step 4: Run the focused test and verify it passes**

Run: `npm run test -- src/shareReport.test.ts`
Expected: PASS for `src/shareReport.test.ts`.

## Task 2: Update App Tests For Ungated Share Flow

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`

- [x] **Step 1: Replace the gated copy test with ungated default behavior**

Replace the test named `requires senior review context before copying` with:

```ts
it("opens share with an immediately copyable Safe Summary", async () => {
  const user = userEvent.setup();
  const attempt = createShareAttempt();
  const firstQuestion = QUESTIONS.find((question) => question.id === attempt.questionIds[0])!;
  saveAttempt(attempt);
  renderAt("/results/attempt-share");

  await user.click(screen.getByRole("button", { name: "Share for review" }));

  expect(screen.getByRole("dialog", { name: "Share review packet" })).toBeInTheDocument();
  const copyButton = screen.getByRole("button", { name: "Copy packet" });
  expect(copyButton).toBeEnabled();
  expect(screen.getByRole("button", { name: "Safe Summary" })).toHaveAttribute("aria-pressed", "true");
  const preview = screen.getByLabelText("Markdown preview") as HTMLTextAreaElement;
  expect(preview.value).toContain("# PM Assessment Review Packet");
  expect(preview.value).toContain("Safe Summary");
  expect(preview.value).not.toContain(firstQuestion.prompt);
  expect(preview.value).not.toContain(firstQuestion.explanation);
});
```

- [x] **Step 2: Update copy test labels**

In the copy success and fallback tests, remove `fillRequiredShareFields(user)` and click `Copy packet` instead of `Copy review packet`.

- [x] **Step 3: Add optional context reveal test**

Add this test after the ungated default test:

```ts
it("reveals optional senior context and updates the preview", async () => {
  const user = userEvent.setup();
  saveAttempt(createShareAttempt());
  renderAt("/results/attempt-share");

  await user.click(screen.getByRole("button", { name: "Share for review" }));
  const preview = screen.getByLabelText("Markdown preview") as HTMLTextAreaElement;

  expect(screen.queryByLabelText("Target role or assessment")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Add senior context" }));

  expect(screen.getByLabelText("Target role or assessment")).toBeInTheDocument();
  await user.clear(screen.getByLabelText("Target role or assessment"));
  await user.type(screen.getByLabelText("Target role or assessment"), "Meta analytics PM screen");
  await user.clear(screen.getByLabelText("Feedback request"));
  await user.type(screen.getByLabelText("Feedback request"), "Find my sharpest coaching point.");

  expect(preview.value).toContain("Meta analytics PM screen");
  expect(preview.value).toContain("Find my sharpest coaching point.");
});
```

- [x] **Step 4: Run focused app tests and verify failures**

Run: `npm run test -- src/App.test.tsx`
Expected: FAIL because the dialog title/button labels/default preview still reflect the old gated flow.

## Task 3: Implement The Summary-First Share Dialog

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [x] **Step 1: Update imports and state defaults**

Import `getDefaultShareContext` from `src/shareReport.ts`. In `ShareReviewDialog`, initialize context state from `getDefaultShareContext(attempt)`, set `detailPreset` to `safe_summary`, and add `isContextOpen` state initialized to `false`.

- [x] **Step 2: Remove context gating from preview and copy**

Build `markdownPreview` from current state on every render without `isContextComplete`. `handleCopy` should return only if `markdownPreview` is empty, which should not happen in normal state.

- [x] **Step 3: Refactor modal markup**

Change the dialog title to `Share review packet`; change helper copy to `Copy a clean result summary now, or add senior context for deeper coaching.` Add a `Ready to copy` block above the preset control. Rename primary action to `Copy packet`. Move all context fields inside an optional section toggled by `Add senior context` / `Hide senior context` with `aria-expanded`.

- [x] **Step 4: Update focus behavior**

Focus the copy button on open using a `copyButtonRef`, since there is no required input. Keep preview fallback focus/select behavior.

- [x] **Step 5: Add summary-first CSS**

Add classes for `.share-ready-panel`, `.share-ready-copy`, `.share-context-toggle`, `.share-optional-context`, and responsive behavior that keeps the modal usable on mobile.

- [x] **Step 6: Run focused app tests and verify pass**

Run: `npm run test -- src/App.test.tsx`
Expected: PASS for `src/App.test.tsx`.

## Task 4: Update Share Report Tests And README

**Files:**
- Modify: `src/shareReport.test.ts`
- Modify: `README.md`

- [x] **Step 1: Ensure Safe Summary omission is covered by default helper**

Add or adjust a `src/shareReport.test.ts` assertion that `buildShareReviewPacket` with `getDefaultShareContext(attempt)` and `safe_summary` omits prompt, correct answer text, and explanation from the rendered Markdown.

- [x] **Step 2: Update README share feature bullets**

Change README share bullets to mention immediately copyable Safe Summary, optional senior context, trusted Senior Brief, and no-backend `/shared-review` import.

- [x] **Step 3: Run focused share tests**

Run: `npm run test -- src/shareReport.test.ts`
Expected: PASS.

## Task 5: Full Verification And Rendered QA

**Files:**
- Verify: all touched files

- [x] **Step 1: Run required project checks**

Run:

```bash
npm run test
npm run validate:questions
npm run build
```

Expected: all commands exit 0. `validate:questions` may print warning-only distractor notes, but no validation errors.

- [x] **Step 2: Run browser QA**

Start Vite with `npm run dev -- --host 127.0.0.1`, open the app, create or load a result, open Share, verify default copyable Safe Summary, switch to Senior Brief, reveal optional context, and check desktop plus mobile viewport for clipping or overlap.

- [x] **Step 3: Final status review**

Run `git status --short` and inspect the touched-file diff. Confirm unrelated untracked files are preserved and not reverted.
