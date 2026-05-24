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
  group:
    | "Answers"
    | "Confidence"
    | "Move through answers"
    | "Questions"
    | "Unanswered questions"
    | "Standard controls";
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
] as const satisfies ReadonlyArray<{ choiceId: ChoiceId; digit: number }>;

export const CONFIDENCE_SHORTCUTS = [
  { confidence: 1, keys: "Shift+1", ariaKeys: "Shift 1" },
  { confidence: 2, keys: "Shift+2", ariaKeys: "Shift 2" },
  { confidence: 3, keys: "Shift+3", ariaKeys: "Shift 3" },
] as const satisfies ReadonlyArray<{ confidence: Confidence; keys: string; ariaKeys: string }>;

export const SHORTCUT_DEFINITIONS = [
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
] as const satisfies readonly ShortcutDefinition[];

export function isEditableShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  const contentEditableElement = target.closest("[contenteditable]");
  return Boolean(
    target.closest("input, textarea, select") ||
      (contentEditableElement &&
        contentEditableElement.getAttribute("contenteditable") !== "false")
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
  if (event.key === "?" || (event.shiftKey && event.key === "/")) {
    return { type: "openHelp" };
  }

  return null;
}
