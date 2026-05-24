import type { Attempt } from "./types";

const ATTEMPTS_KEY = "pm-assessment-attempts-v1";
const KEYBOARD_TIP_KEY = "pm-assessment-keyboard-tip-dismissed-v1";
const SHORTCUT_MODE_KEY = "pm-assessment-shortcuts-enabled-v1";
const MAX_ATTEMPTS = 5;

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
