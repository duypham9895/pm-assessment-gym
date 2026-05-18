import type { Attempt } from "./types";

const ATTEMPTS_KEY = "pm-assessment-attempts-v1";
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
