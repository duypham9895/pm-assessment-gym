import type { ActiveSessionSnapshot, Attempt, ChoiceId, Confidence, Topic } from "./types";

const ATTEMPTS_KEY = "pm-assessment-attempts-v1";
const ACTIVE_SESSION_KEY = "pm-assessment-active-session-v1";
const KEYBOARD_TIP_KEY = "pm-assessment-keyboard-tip-dismissed-v1";
const SHORTCUT_MODE_KEY = "pm-assessment-shortcuts-enabled-v1";
const MAX_ATTEMPTS = 5;

function isChoiceId(value: unknown): value is ChoiceId {
  return value === "A" || value === "B" || value === "C" || value === "D" || value === "E";
}

function isConfidence(value: unknown): value is Confidence {
  return value === 1 || value === 2 || value === 3;
}

function isTopic(value: unknown): value is Topic {
  return (
    value === "product_analytics" ||
    value === "data_literacy" ||
    value === "chart_interpretation" ||
    value === "inductive_reasoning" ||
    value === "data_interpretation" ||
    value === "ab_testing"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isActiveSessionSnapshot(value: unknown): value is ActiveSessionSnapshot {
  if (!isRecord(value)) return false;
  if (value.version !== 1) return false;
  if (typeof value.routePath !== "string") return false;
  if (typeof value.savedAt !== "string") return false;
  if (
    typeof value.remainingSeconds !== "number" ||
    !Number.isFinite(value.remainingSeconds) ||
    value.remainingSeconds < 0
  ) {
    return false;
  }
  if (!isRecord(value.confidenceDrafts)) return false;
  if (!Object.values(value.confidenceDrafts).every(isConfidence)) return false;
  if (!isRecord(value.session)) return false;

  const session = value.session;
  if (typeof session.id !== "string") return false;
  if (session.mode !== "full_mock" && session.mode !== "topic_drill") return false;
  if (session.feedbackMode !== "exam" && session.feedbackMode !== "practice") return false;
  if (session.mode === "topic_drill" && !isTopic(session.topicFilter)) return false;
  if (session.mode === "full_mock" && session.topicFilter !== undefined) return false;
  if (typeof session.startedAt !== "string") return false;
  if (
    typeof session.timeLimitSeconds !== "number" ||
    !Number.isFinite(session.timeLimitSeconds) ||
    session.timeLimitSeconds <= 0
  ) {
    return false;
  }
  if (!Array.isArray(session.questionIds) || session.questionIds.length === 0) return false;
  if (!session.questionIds.every((questionId) => typeof questionId === "string")) return false;
  if (
    typeof session.currentQuestionIndex !== "number" ||
    !Number.isInteger(session.currentQuestionIndex) ||
    session.currentQuestionIndex < 0 ||
    session.currentQuestionIndex >= session.questionIds.length
  ) {
    return false;
  }
  if (!isRecord(session.answers)) return false;

  return Object.values(session.answers).every(
    (answer) => isRecord(answer) && isChoiceId(answer.choiceId) && isConfidence(answer.confidence)
  );
}

export function loadAttempts(): Attempt[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: Attempt): Attempt[] {
  if (typeof localStorage === "undefined") return [attempt];

  const attempts = [attempt, ...loadAttempts()].slice(0, MAX_ATTEMPTS);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  return attempts;
}

export function findAttemptById(attemptId: string): Attempt | undefined {
  return loadAttempts().find((attempt) => attempt.id === attemptId);
}

export function loadActiveSessionSnapshot(): ActiveSessionSnapshot | null {
  if (typeof localStorage === "undefined") return null;

  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isActiveSessionSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveActiveSessionSnapshot(snapshot: ActiveSessionSnapshot): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(snapshot));
}

export function clearActiveSessionSnapshot(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}

export function loadKeyboardTipDismissed(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(KEYBOARD_TIP_KEY) === "true";
}

export function saveKeyboardTipDismissed(value: boolean): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEYBOARD_TIP_KEY, String(value));
}

export function loadShortcutModeEnabled(): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(SHORTCUT_MODE_KEY) !== "false";
}

export function saveShortcutModeEnabled(value: boolean): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SHORTCUT_MODE_KEY, String(value));
}
