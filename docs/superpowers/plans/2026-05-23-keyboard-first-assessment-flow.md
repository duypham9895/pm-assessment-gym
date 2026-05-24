# Keyboard-First Assessment Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users complete the active assessment loop with keyboard shortcuts, visible shortcut affordances, persisted shortcut preferences, and an accessible help overlay without changing scoring or question-bank behavior.

**Architecture:** Add a small shortcut registry/helper module for key matching and guard logic, extend storage with two localStorage-backed preferences, and keep the assessment UI changes inside the existing `TestView` path. The global key handler stays in `App`, while focusable answer/confidence controls remain native buttons so `Tab`, `Enter`, and `Space` keep working.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, localStorage.

**Execution Note:** The standard Superpowers plan template asks for commit steps, but this goal explicitly says not to commit. Each task ends with a verification checkpoint instead of a commit.

---

## File Structure

- Create `src/shortcuts.ts`: central shortcut definitions, labels, grouped help content, key matching, editable/modal guard helpers.
- Modify `src/storage.ts`: localStorage helpers for keyboard shortcut mode and first-time tip dismissal.
- Modify `src/App.tsx`: shortcut preference state, global shortcut handling, answer/confidence focus movement, first-time tip, help overlay, badges, aria labels, and focus restoration.
- Modify `src/styles.css`: styles for shortcut badges, tip row, help overlay, focus-safe dialog layout, and responsive badge behavior.
- Modify `src/App.test.tsx`: TDD coverage for existing answer shortcuts, confidence shortcuts, question navigation, next unanswered, guard contexts, shortcut-mode off, practice locking, and help overlay focus restoration.

---

### Task 1: Shortcut Registry And Guard Tests

**Files:**
- Create: `src/shortcuts.ts`
- Modify: `src/App.test.tsx`

- [x] **Step 1: Write failing tests for preserved answer shortcut and guard contexts**

Add these tests to `src/App.test.tsx` under a new `describe("App keyboard shortcuts", ...)` block. Keep the existing helper functions and add local helpers as needed:

```tsx
function startFullMock() {
  return userEvent.setup().click(screen.getByRole("button", { name: /Start full mock/i }));
}

function expectChoiceSelected(choiceId: string) {
  expect(getChoiceButton(choiceId)).toHaveClass("selected");
}

it("preserves 1-5 answer selection shortcuts", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /Start full mock/i }));
  await user.keyboard("1");

  expectChoiceSelected("A");
});

it("ignores printable shortcuts inside editable and modal contexts", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /Start full mock/i }));

  for (const element of [
    document.createElement("input"),
    document.createElement("textarea"),
    document.createElement("select"),
  ]) {
    document.body.appendChild(element);
    element.focus();
    await user.keyboard("1");
    expect(getChoiceButton("A")).not.toHaveClass("selected");
    element.remove();
  }

  const editable = document.createElement("div");
  editable.setAttribute("contenteditable", "true");
  editable.tabIndex = 0;
  document.body.appendChild(editable);
  editable.focus();
  await user.keyboard("1");
  expect(getChoiceButton("A")).not.toHaveClass("selected");
  editable.remove();

  const dialog = document.createElement("div");
  dialog.setAttribute("role", "dialog");
  const dialogButton = document.createElement("button");
  dialogButton.textContent = "Dialog button";
  dialog.appendChild(dialogButton);
  document.body.appendChild(dialog);
  dialogButton.focus();
  await user.keyboard("1");
  expect(getChoiceButton("A")).not.toHaveClass("selected");
  dialog.remove();
});
```

- [x] **Step 2: Run tests to verify they fail for the missing modal/contenteditable guard if needed**

Run: `npm run test -- src/App.test.tsx`

Expected: the preserved `1` answer shortcut should pass against existing behavior; the guard test should fail because contenteditable and modal targets are not currently ignored.

- [x] **Step 3: Add the shortcut registry and guard helpers**

Create `src/shortcuts.ts` with the following public surface:

```ts
import type { ChoiceId, Confidence } from "./types";

export type ShortcutAction =
  | { type: "answer"; choiceId: ChoiceId }
  | { type: "confidence"; confidence: Confidence }
  | { type: "previousQuestion" }
  | { type: "nextQuestion" }
  | { type: "nextUnanswered" }
  | { type: "openHelp" };

export type ShortcutDefinition = {
  id: string;
  group: "Answers" | "Confidence" | "Move through answers" | "Questions" | "Unanswered questions" | "Standard controls";
  label: string;
  keys: string;
  description: string;
  printable: boolean;
};

export const ANSWER_SHORTCUTS = [
  { choiceId: "A", digit: 1 },
  { choiceId: "B", digit: 2 },
  { choiceId: "C", digit: 3 },
  { choiceId: "D", digit: 4 },
  { choiceId: "E", digit: 5 },
] as const;

export const CONFIDENCE_SHORTCUTS = [
  { confidence: 1, keys: "Shift+1", ariaKeys: "Shift 1" },
  { confidence: 2, keys: "Shift+2", ariaKeys: "Shift 2" },
  { confidence: 3, keys: "Shift+3", ariaKeys: "Shift 3" },
] as const;

export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  ...ANSWER_SHORTCUTS.map(({ choiceId, digit }) => ({
    id: `answer-${choiceId}`,
    group: "Answers" as const,
    label: `Select answer ${choiceId}`,
    keys: String(digit),
    description: `Choose answer ${choiceId}.`,
    printable: true,
  })),
  ...CONFIDENCE_SHORTCUTS.map(({ confidence, keys }) => ({
    id: `confidence-${confidence}`,
    group: "Confidence" as const,
    label: confidence === 1 ? "Guessing" : confidence === 2 ? "Unsure" : "Confident",
    keys,
    description: "Mark confidence for the current question.",
    printable: true,
  })),
  {
    id: "answer-previous",
    group: "Move through answers",
    label: "Previous answer",
    keys: "ArrowUp",
    description: "Move focus to the previous answer choice.",
    printable: false,
  },
  {
    id: "answer-next",
    group: "Move through answers",
    label: "Next answer",
    keys: "ArrowDown",
    description: "Move focus to the next answer choice.",
    printable: false,
  },
  {
    id: "question-previous",
    group: "Questions",
    label: "Previous question",
    keys: "ArrowLeft",
    description: "Go to the previous question.",
    printable: false,
  },
  {
    id: "question-next",
    group: "Questions",
    label: "Next question",
    keys: "ArrowRight",
    description: "Go to the next question.",
    printable: false,
  },
  {
    id: "next-unanswered",
    group: "Unanswered questions",
    label: "Next unanswered",
    keys: "Shift+ArrowRight",
    description: "Jump to the next unanswered question.",
    printable: false,
  },
  {
    id: "help",
    group: "Standard controls",
    label: "Shortcuts help",
    keys: "?",
    description: "Open keyboard shortcuts help.",
    printable: true,
  },
  {
    id: "close",
    group: "Standard controls",
    label: "Close help",
    keys: "Esc",
    description: "Close the shortcuts help overlay.",
    printable: false,
  },
];

export function isEditableShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest("input, textarea, select") ||
      target.closest("[contenteditable='true'], [contenteditable='']")
  );
}

export function isModalShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("dialog, [role='dialog'], [aria-modal='true']"));
}

export function getDigitFromKeyboardEvent(event: KeyboardEvent) {
  if (/^Digit[1-9]$/.test(event.code)) return Number(event.code.replace("Digit", ""));
  if (/^[1-9]$/.test(event.key)) return Number(event.key);
  return undefined;
}

export function getGlobalShortcutAction(
  event: KeyboardEvent,
  options: { shortcutModeEnabled: boolean }
): ShortcutAction | null {
  if (event.metaKey || event.ctrlKey || event.altKey) return null;
  if (isEditableShortcutTarget(event.target) || isModalShortcutTarget(event.target)) return null;

  if (event.shiftKey && event.key === "ArrowRight") return { type: "nextUnanswered" };
  if (event.key === "ArrowLeft" && !event.shiftKey) return { type: "previousQuestion" };
  if (event.key === "ArrowRight" && !event.shiftKey) return { type: "nextQuestion" };

  if (!options.shortcutModeEnabled) return null;

  const digit = getDigitFromKeyboardEvent(event);
  if (digit && event.shiftKey && digit >= 1 && digit <= 3) {
    return { type: "confidence", confidence: digit as Confidence };
  }
  if (digit && !event.shiftKey && digit >= 1 && digit <= 5) {
    return { type: "answer", choiceId: ANSWER_SHORTCUTS[digit - 1].choiceId };
  }
  if (event.key === "?" && !event.shiftKey) return { type: "openHelp" };
  if (event.key === "?" || (event.shiftKey && event.key === "/")) return { type: "openHelp" };

  return null;
}
```

- [x] **Step 4: Wire the existing answer shortcut handler through the guard helper**

In `src/App.tsx`, replace the inline `input, textarea, select` guard in the existing `keydown` effect with `getGlobalShortcutAction(event, { shortcutModeEnabled: true })`, handling only `answer` actions for now.

- [x] **Step 5: Run tests to verify the guard tests pass**

Run: `npm run test -- src/App.test.tsx`

Expected: all `App.test.tsx` tests pass.

---

### Task 2: Confidence And Question Navigation Shortcuts

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`

- [x] **Step 1: Write failing shortcut behavior tests**

Add tests for confidence, previous/next question, and next unanswered:

```tsx
it("sets confidence with Shift+1 through Shift+3", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /Start full mock/i }));
  await user.keyboard("{Shift>}1{/Shift}");
  expect(screen.getByRole("button", { name: /1 Guessing/i })).toHaveAttribute("aria-pressed", "true");

  await user.keyboard("{Shift>}3{/Shift}");
  expect(screen.getByRole("button", { name: /3 Confident/i })).toHaveAttribute("aria-pressed", "true");
});

it("navigates questions with ArrowLeft and ArrowRight", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /Start full mock/i }));
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: /Question 2, current/i })).toBeInTheDocument();

  await user.keyboard("{ArrowLeft}");
  expect(screen.getByRole("tab", { name: /Question 1, current/i })).toBeInTheDocument();
});

it("jumps to the next unanswered question with Shift+ArrowRight", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /Start full mock/i }));
  await user.keyboard("1");
  await user.keyboard("{Shift>}{ArrowRight}{/Shift}");

  expect(screen.getByRole("tab", { name: /Question 2, current/i })).toBeInTheDocument();
});
```

- [x] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/App.test.tsx`

Expected: confidence and navigation shortcut tests fail because those actions are not wired yet.

- [x] **Step 3: Handle new registry actions in the global keydown effect**

Update the `keydown` effect in `src/App.tsx` to:

- call `getGlobalShortcutAction(event, { shortcutModeEnabled })`
- `preventDefault()` for handled actions
- call `selectChoice`, `setCurrentConfidence`, `moveQuestion(-1)`, `moveQuestion(1)`, or `jumpToNextUnanswered`
- ignore `previousQuestion` on the first question and `nextQuestion` on the last question by relying on `moveQuestion`

Keep `selectChoice` and `setCurrentConfidence` as the locking boundary so practice mode remains protected.

- [x] **Step 4: Focus the question heading after question changes**

Add a `questionHeadingRef` and a `useEffect` keyed by `view`, `session?.id`, and `session?.currentQuestionIndex`:

```tsx
useEffect(() => {
  if (view !== "test") return;
  questionHeadingRef.current?.focus({ preventScroll: true });
}, [session?.currentQuestionIndex, session?.id, view]);
```

Pass the ref to `TestView` and set the question `<h1>` to `tabIndex={-1}`.

- [x] **Step 5: Run tests**

Run: `npm run test -- src/App.test.tsx`

Expected: the new confidence and question navigation tests pass.

---

### Task 3: Answer And Confidence Focus Navigation

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`

- [x] **Step 1: Write failing focus navigation tests**

Add tests that verify answer focus movement and native selection:

```tsx
it("moves focus through answers with ArrowUp and ArrowDown, then selects with Space", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /Start full mock/i }));
  getChoiceButton("A").focus();

  await user.keyboard("{ArrowDown}");
  expect(getChoiceButton("B")).toHaveFocus();

  await user.keyboard(" ");
  expectChoiceSelected("B");

  await user.keyboard("{ArrowUp}");
  expect(getChoiceButton("A")).toHaveFocus();
});

it("does not treat ArrowRight inside confidence controls as question navigation", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /Start full mock/i }));
  screen.getByRole("button", { name: /1 Guessing/i }).focus();

  await user.keyboard("{ArrowRight}");

  expect(screen.getByRole("tab", { name: /Question 1, current/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /2 Unsure/i })).toHaveFocus();
});
```

- [x] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/App.test.tsx`

Expected: focus movement tests fail because answer/confidence arrow key handlers do not exist yet.

- [x] **Step 3: Add scoped key handlers to `TestView`**

Inside `TestView`, create button refs:

```tsx
const answerButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
const confidenceButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
```

Add `onKeyDown` to `.choices` that handles `ArrowUp` and `ArrowDown` by moving focus between enabled answer buttons without selecting. Add `onKeyDown` to `.confidence-options` that handles `ArrowLeft` and `ArrowRight` by moving focus between confidence buttons. Leave `Enter` and `Space` to native button activation.

- [x] **Step 4: Run tests**

Run: `npm run test -- src/App.test.tsx`

Expected: focus navigation tests pass and existing practice locking tests remain green.

---

### Task 4: Preferences And First-Time Tip Persistence

**Files:**
- Modify: `src/storage.ts`
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`

- [x] **Step 1: Write failing preference tests**

Add tests for shortcut mode off and first-time tip persistence:

```tsx
it("disables printable global shortcuts when shortcut mode is off", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /Start full mock/i }));
  await user.click(screen.getByRole("button", { name: /Shortcuts/i }));
  await user.click(screen.getByRole("button", { name: "Off" }));
  await user.keyboard("{Escape}");

  await user.keyboard("1");
  await user.keyboard("?");

  expect(getChoiceButton("A")).not.toHaveClass("selected");
  expect(screen.queryByRole("dialog", { name: /Keyboard shortcuts/i })).not.toBeInTheDocument();

  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: /Question 2, current/i })).toBeInTheDocument();
});

it("persists first-time keyboard tip dismissal", async () => {
  const user = userEvent.setup();
  const { unmount } = render(<App />);

  await user.click(screen.getByRole("button", { name: /Start full mock/i }));
  expect(screen.getByText(/Use 1-5 to answer/i)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Got it" }));
  expect(screen.queryByText(/Use 1-5 to answer/i)).not.toBeInTheDocument();

  unmount();
  render(<App />);
  await user.click(screen.getByRole("button", { name: /Start full mock/i }));
  expect(screen.queryByText(/Use 1-5 to answer/i)).not.toBeInTheDocument();
});
```

- [x] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/App.test.tsx`

Expected: tests fail because the visible shortcuts button, preference setting, and dismissible tip do not exist yet.

- [x] **Step 3: Add storage helpers**

In `src/storage.ts`, add:

```ts
const KEYBOARD_TIP_KEY = "pm-assessment-keyboard-tip-dismissed-v1";
const SHORTCUT_MODE_KEY = "pm-assessment-shortcuts-enabled-v1";

export function loadKeyboardTipDismissed() {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(KEYBOARD_TIP_KEY) === "true";
}

export function saveKeyboardTipDismissed(value: boolean) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEYBOARD_TIP_KEY, String(value));
}

export function loadShortcutModeEnabled() {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(SHORTCUT_MODE_KEY) !== "false";
}

export function saveShortcutModeEnabled(value: boolean) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SHORTCUT_MODE_KEY, String(value));
}
```

- [x] **Step 4: Add state and first-time tip UI**

In `App`, initialize `keyboardTipDismissed` and `shortcutModeEnabled` from storage. Pass both values and handlers to `TestView`. Replace the old static keyboard hint with:

```tsx
{keyboardTipDismissed ? (
  <button className="shortcut-reminder" type="button" onClick={onOpenShortcuts} aria-label="Show keyboard shortcuts.">
    Shortcuts
  </button>
) : (
  <div className="keyboard-tip">
    <p>Use 1-5 to answer, Shift+1-3 for confidence, and arrows to move between questions.</p>
    <button type="button" className="secondary-button compact-button" onClick={onDismissKeyboardTip}>
      Got it
    </button>
    <button type="button" className="utility-button" onClick={onOpenShortcuts} aria-label="Show keyboard shortcuts.">
      Shortcuts
    </button>
  </div>
)}
```

- [x] **Step 5: Run tests**

Run: `npm run test -- src/App.test.tsx`

Expected: preference and tip tests pass.

---

### Task 5: Help Overlay And Focus Management

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`

- [x] **Step 1: Write failing help overlay tests**

Add:

```tsx
it("opens shortcut help with question mark, closes with Escape, and restores focus", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /Start full mock/i }));
  const shortcutButton = screen.getByRole("button", { name: /Show keyboard shortcuts/i });
  shortcutButton.focus();

  await user.keyboard("?");

  expect(screen.getByRole("dialog", { name: /Keyboard shortcuts/i })).toBeInTheDocument();

  await user.keyboard("{Escape}");

  expect(screen.queryByRole("dialog", { name: /Keyboard shortcuts/i })).not.toBeInTheDocument();
  expect(shortcutButton).toHaveFocus();
});
```

- [x] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/App.test.tsx`

Expected: help overlay test fails until the dialog exists and focus restoration is implemented.

- [x] **Step 3: Implement `ShortcutsHelpOverlay`**

Add a local component in `src/App.tsx` that renders when `isShortcutHelpOpen` is true:

- outer `.shortcut-overlay` backdrop
- inner `.shortcut-dialog` with `role="dialog"`, `aria-modal="true"`, `aria-labelledby="shortcut-help-title"`
- grouped rows from `SHORTCUT_DEFINITIONS`
- close button
- segmented `Keyboard shortcuts` setting with `On` and `Off`
- `Escape` close handling
- `Tab` focus trap between focusable elements inside the dialog

- [x] **Step 4: Restore opener focus**

Store the active element in `shortcutHelpOpenerRef` before opening. When closing the overlay, return focus to that element if it is still in the document; otherwise focus the visible shortcuts button.

- [x] **Step 5: Run tests**

Run: `npm run test -- src/App.test.tsx`

Expected: help overlay tests pass.

---

### Task 6: Badges, Aria Labels, And Responsive Polish

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/App.test.tsx`

- [x] **Step 1: Add/adjust tests for visible badges**

Add a test:

```tsx
it("shows shortcut badges for answers, confidence, and question navigation", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /Start full mock/i }));

  expect(screen.getByText("Shift+1")).toBeInTheDocument();
  expect(screen.getByText("Shift+2")).toBeInTheDocument();
  expect(screen.getByText("Shift+3")).toBeInTheDocument();
  expect(screen.getByText("←")).toBeInTheDocument();
  expect(screen.getByText("Shift+→")).toBeInTheDocument();
  expect(screen.getByText("→")).toBeInTheDocument();
});
```

- [x] **Step 2: Run tests to verify missing badge coverage fails if needed**

Run: `npm run test -- src/App.test.tsx`

Expected: fails until confidence and navigation badges are rendered.

- [x] **Step 3: Add badges and aria labels**

Update `TestView`:

- answer buttons use `aria-label="Choice A. Select answer A. Keyboard shortcut 1. <choice text>"`
- confidence buttons use `aria-label="Set confidence to Guessing. Keyboard shortcut Shift 1."`
- previous button title/aria label: `Go to previous question. Keyboard shortcut Left Arrow.`
- next unanswered button title/aria label: `Jump to next unanswered question. Keyboard shortcut Shift Right Arrow.`
- next button title/aria label: `Go to next question. Keyboard shortcut Right Arrow.`
- badge elements use `aria-hidden="true"` where the aria label already announces the shortcut.

- [x] **Step 4: Add CSS**

Add styles for:

- `.shortcut-badge`
- `.keyboard-tip`
- `.shortcut-reminder`
- `.shortcut-overlay`
- `.shortcut-dialog`
- `.shortcut-dialog-header`
- `.shortcut-groups`
- `.shortcut-group`
- `.shortcut-row`
- `.shortcut-setting`

Keep colors tied to existing CSS variables. On `max-width: 760px`, hide or compress secondary badges where needed and keep the help button visible.

- [x] **Step 5: Run tests**

Run: `npm run test -- src/App.test.tsx`

Expected: all App tests pass.

---

### Task 7: Final Verification And Browser QA

**Files:**
- Modify as needed based on verification findings only.

- [x] **Step 1: Run complete automated verification**

Run:

```bash
npm run test
npm run build
npm run validate:questions
```

Expected: all commands exit 0.

- [x] **Step 2: Start a dev server if needed**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [x] **Step 3: Browser-check keyboard flow**

Using the in-app Browser plugin or equivalent browser automation:

- open the local Vite URL
- start a full mock
- press `1` and verify answer A is selected
- press `Shift+2` and verify Unsure is active
- press `ArrowRight` and verify the next question is current
- press `Shift+ArrowRight` and verify next unanswered navigation works
- open shortcuts with the visible button or `?`
- toggle shortcuts Off and verify `1` no longer selects answers while `ArrowRight` still moves questions
- close the overlay and verify focus returns to the opener

- [x] **Step 4: Final diff review**

Run:

```bash
git diff -- src/App.tsx src/App.test.tsx src/storage.ts src/shortcuts.ts src/styles.css docs/superpowers/plans/2026-05-23-keyboard-first-assessment-flow.md
git status --short
```

Expected: only the scoped files above plus the user-provided PRD are changed/untracked. Do not commit.

---

## Self-Review Checklist

- [x] PRD must-haves are mapped to tasks 1-7.
- [x] No scoring, question-bank, or app-wide structure changes are required.
- [x] Single-character shortcuts can be disabled through persisted shortcut mode.
- [x] Global shortcuts are ignored in editable/contenteditable/modal contexts.
- [x] Practice mode locking remains enforced by `selectChoice` and `setCurrentConfidence`.
- [x] Visible shortcut badges exist for answers, confidence, and navigation controls.
- [x] Help overlay is reachable by visible button and `?`, closes with `Esc`, traps focus, and restores focus.
- [x] Required commands are run before claiming completion.
