import { afterEach, describe, expect, it } from "vitest";
import {
  clearActiveSessionSnapshot,
  loadActiveSessionSnapshot,
  saveActiveSessionSnapshot,
} from "./storage";
import type { ActiveSessionSnapshot } from "./types";

function createSnapshot(
  overrides: Partial<ActiveSessionSnapshot> = {}
): ActiveSessionSnapshot {
  return {
    version: 1,
    routePath: "/full-mock/practice",
    savedAt: "2026-05-24T01:00:00.000Z",
    remainingSeconds: 1700,
    confidenceDrafts: { "question-2": 3 },
    session: {
      id: "session-active",
      mode: "full_mock",
      feedbackMode: "practice",
      startedAt: "2026-05-24T00:55:00.000Z",
      timeLimitSeconds: 1800,
      questionIds: ["question-1", "question-2"],
      answers: {
        "question-1": { choiceId: "A", confidence: 1 },
      },
      currentQuestionIndex: 1,
    },
    ...overrides,
  };
}

afterEach(() => {
  window.localStorage.clear();
});

describe("active session storage", () => {
  it("saves and loads an active session snapshot", () => {
    const snapshot = createSnapshot();

    saveActiveSessionSnapshot(snapshot);

    expect(loadActiveSessionSnapshot()).toEqual(snapshot);
  });

  it("clears an active session snapshot", () => {
    saveActiveSessionSnapshot(createSnapshot());

    clearActiveSessionSnapshot();

    expect(loadActiveSessionSnapshot()).toBeNull();
  });

  it("returns null for malformed active session snapshots", () => {
    window.localStorage.setItem("pm-assessment-active-session-v1", JSON.stringify({ bad: true }));

    expect(loadActiveSessionSnapshot()).toBeNull();
  });

  it("returns null for active session snapshots with invalid indexes", () => {
    window.localStorage.setItem(
      "pm-assessment-active-session-v1",
      JSON.stringify(
        createSnapshot({
          session: {
            ...createSnapshot().session,
            currentQuestionIndex: 0.5,
          },
        })
      )
    );

    expect(loadActiveSessionSnapshot()).toBeNull();
  });
});
