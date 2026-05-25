import { describe, expect, it } from "vitest";
import {
  addQuestionVisibleSeconds,
  buildTimingSummary,
  markQuestionSeen,
  recordQuestionAnswered,
} from "./questionTiming";
import { QUESTIONS } from "./questions";
import { buildQuestionReviews } from "./scoring";
import type { AnswerRecord, QuestionTimingMap } from "./types";

describe("question timing", () => {
  it("tracks first seen, answered time, last changed time, visible seconds, and answer changes", () => {
    let timings: QuestionTimingMap = {};

    timings = markQuestionSeen(timings, "q1", "2026-05-24T01:00:00.000Z");
    timings = addQuestionVisibleSeconds(timings, "q1", 12, "2026-05-24T01:00:00.000Z");
    timings = recordQuestionAnswered(timings, "q1", {
      at: "2026-05-24T01:00:15.000Z",
      changedChoice: false,
    });
    timings = recordQuestionAnswered(timings, "q1", {
      at: "2026-05-24T01:00:25.000Z",
      changedChoice: true,
    });
    timings = recordQuestionAnswered(timings, "q1", {
      at: "2026-05-24T01:00:35.000Z",
      changedChoice: false,
    });

    expect(timings.q1).toEqual({
      firstSeenAt: "2026-05-24T01:00:00.000Z",
      answeredAt: "2026-05-24T01:00:15.000Z",
      lastChangedAt: "2026-05-24T01:00:35.000Z",
      totalVisibleSeconds: 12,
      answerChangeCount: 1,
    });
  });

  it("summarizes slow missed questions, over-investment, and time-expired pacing risk", () => {
    const questions = QUESTIONS.slice(0, 3);
    const wrongChoice = questions[0].choices.find(
      (choice) => choice.id !== questions[0].correctChoiceId
    )!;
    const answers: Record<string, AnswerRecord> = {
      [questions[0].id]: { choiceId: wrongChoice.id, confidence: 3 },
      [questions[1].id]: { choiceId: questions[1].correctChoiceId, confidence: 2 },
    };
    const reviews = buildQuestionReviews(questions, answers);
    const timings: QuestionTimingMap = {
      [questions[0].id]: {
        firstSeenAt: "2026-05-24T01:00:00.000Z",
        answeredAt: "2026-05-24T01:03:00.000Z",
        lastChangedAt: "2026-05-24T01:03:00.000Z",
        totalVisibleSeconds: 180,
        answerChangeCount: 2,
      },
      [questions[1].id]: {
        firstSeenAt: "2026-05-24T01:03:00.000Z",
        answeredAt: "2026-05-24T01:03:30.000Z",
        lastChangedAt: "2026-05-24T01:03:30.000Z",
        totalVisibleSeconds: 30,
        answerChangeCount: 0,
      },
      [questions[2].id]: {
        firstSeenAt: "2026-05-24T01:04:00.000Z",
        totalVisibleSeconds: 90,
        answerChangeCount: 0,
      },
    };

    const summary = buildTimingSummary({
      questions,
      reviews,
      questionTimings: timings,
      durationSeconds: 300,
      timeLimitSeconds: 300,
    });

    expect(summary.slowestMisses[0]).toMatchObject({
      questionId: questions[0].id,
      attemptQuestionNumber: 1,
      totalVisibleSeconds: 180,
    });
    expect(summary.overInvestedQuestions[0].questionId).toBe(questions[0].id);
    expect(summary.unansweredTimeExpired).toBe(true);
    expect(summary.pacingCaveat).toMatch(/pacing/i);
  });
});
