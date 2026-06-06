import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FULL_MOCK_DIFFICULTY_DISTRIBUTION,
  FULL_MOCK_DISTRIBUTION,
  QUESTIONS,
  TOPIC_ORDER,
} from "./questions";
import { buildConfidenceSummary, selectFullMockQuestions } from "./scoring";
import type { QuestionReview } from "./types";

afterEach(() => vi.restoreAllMocks());

function countBy<T extends string>(items: T[]) {
  return items.reduce(
    (counts, item) => ({ ...counts, [item]: (counts[item] ?? 0) + 1 }),
    {} as Record<T, number>
  );
}

describe("selectFullMockQuestions", () => {
  it("selects the Alvin-style 21 question topic distribution", () => {
    const selected = selectFullMockQuestions(QUESTIONS);
    const topicCounts = countBy(selected.map((question) => question.topic));

    expect(selected).toHaveLength(21);
    for (const topic of TOPIC_ORDER) {
      expect(topicCounts[topic]).toBe(FULL_MOCK_DISTRIBUTION[topic]);
    }
  });

  it("selects the configured difficulty mix", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.42);

    const selected = selectFullMockQuestions(QUESTIONS);
    const difficultyCounts = countBy(selected.map((question) => question.difficulty));
    const expectedDifficultyCounts = Object.values(FULL_MOCK_DIFFICULTY_DISTRIBUTION)
      .flatMap((distribution) => Object.entries(distribution))
      .reduce(
        (counts, [difficulty, count]) => ({
          ...counts,
          [difficulty]: (counts[difficulty] ?? 0) + count,
        }),
        {} as Record<string, number>
      );

    expect(difficultyCounts).toEqual(expectedDifficultyCounts);
  });

  it("prefers fresh questions before falling back to recent questions", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.42);

    const recentQuestionIds = new Set(
      QUESTIONS.filter((question) => question.topic === "product_analytics")
        .slice(0, 4)
        .map((question) => question.id)
    );

    const selected = selectFullMockQuestions(QUESTIONS, { recentQuestionIds });
    const selectedIds = new Set(selected.map((question) => question.id));

    for (const questionId of recentQuestionIds) {
      expect(selectedIds.has(questionId)).toBe(false);
    }
  });

  it("falls back to recent questions when a required difficulty bucket has no fresh candidates", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.42);

    const recentQuestionIds = new Set(
      QUESTIONS.filter(
        (question) => question.topic === "ab_testing" && question.difficulty === "hard"
      ).map((question) => question.id)
    );

    const selected = selectFullMockQuestions(QUESTIONS, { recentQuestionIds });
    const selectedHardAbQuestions = selected.filter(
      (question) => question.topic === "ab_testing" && question.difficulty === "hard"
    );

    expect(selectedHardAbQuestions).toHaveLength(
      FULL_MOCK_DIFFICULTY_DISTRIBUTION.ab_testing.hard
    );
    expect(selectedHardAbQuestions.some((question) => recentQuestionIds.has(question.id))).toBe(
      true
    );
  });
});

describe("buildConfidenceSummary", () => {
  it("groups reviews into calibration buckets for results guidance", () => {
    const reviews = [
      { questionId: "false-confidence", isCorrect: false, confidence: 3 },
      { questionId: "lucky-correct-guess", isCorrect: true, confidence: 1 },
      { questionId: "lucky-correct-unsure", isCorrect: true, confidence: 2 },
      { questionId: "needs-drill-guess", isCorrect: false, confidence: 1 },
      { questionId: "needs-drill-unanswered", isCorrect: false },
      { questionId: "known-strength", isCorrect: true, confidence: 3 },
    ] as QuestionReview[];

    const summary = buildConfidenceSummary(reviews);

    expect(summary.falseConfidence.map((review) => review.questionId)).toEqual([
      "false-confidence",
    ]);
    expect(summary.luckyCorrect.map((review) => review.questionId)).toEqual([
      "lucky-correct-guess",
      "lucky-correct-unsure",
    ]);
    expect(summary.needsDrill.map((review) => review.questionId)).toEqual([
      "needs-drill-guess",
      "needs-drill-unanswered",
    ]);
    expect(summary.knownStrength.map((review) => review.questionId)).toEqual([
      "known-strength",
    ]);
  });
});
