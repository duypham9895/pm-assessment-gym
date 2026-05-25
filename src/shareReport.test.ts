import { describe, expect, it } from "vitest";
import { QUESTIONS, TOPIC_LABELS } from "./questions";
import { buildQuestionReviews, scoreQuestions } from "./scoring";
import {
  buildShareReviewPacket,
  parseShareReviewPacketText,
  renderShareReviewMarkdown,
  type ShareCandidateContext,
} from "./shareReport";
import type { AnswerRecord, Attempt, Question } from "./types";

function wrongChoiceFor(question: Question) {
  return question.choices.find((choice) => choice.id !== question.correctChoiceId)!;
}

function makeContext(overrides: Partial<ShareCandidateContext> = {}): ShareCandidateContext {
  return {
    identityMode: "anonymous",
    targetRoleOrAssessment: "Senior PM analytical screen",
    feedbackRequest: "Tell me whether my misses are mostly metrics, statistics, or product judgment.",
    testConditions: "timed_uninterrupted",
    deadline: "2026-06-01",
    ...overrides,
  };
}

function makeAttempt() {
  const questions = QUESTIONS.slice(0, 3);
  const wrongQuestion = questions[0];
  const correctQuestion = questions[1];
  const unansweredQuestion = questions[2];
  const wrongChoice = wrongChoiceFor(wrongQuestion);
  const answers: Record<string, AnswerRecord> = {
    [wrongQuestion.id]: { choiceId: wrongChoice.id, confidence: 3 },
    [correctQuestion.id]: { choiceId: correctQuestion.correctChoiceId, confidence: 1 },
  };
  const attempt: Attempt = {
    id: "attempt-local-id-should-not-share",
    sessionId: "session-local-id-should-not-share",
    mode: "full_mock",
    feedbackMode: "exam",
    startedAt: "2026-05-24T01:00:00.000Z",
    submittedAt: "2026-05-24T01:30:00.000Z",
    durationSeconds: 1800,
    questionIds: questions.map((question) => question.id),
    answers,
    score: scoreQuestions(questions, answers),
    questionTimings: {
      [wrongQuestion.id]: {
        firstSeenAt: "2026-05-24T01:00:00.000Z",
        answeredAt: "2026-05-24T01:02:00.000Z",
        lastChangedAt: "2026-05-24T01:02:40.000Z",
        totalVisibleSeconds: 160,
        answerChangeCount: 1,
      },
      [correctQuestion.id]: {
        firstSeenAt: "2026-05-24T01:03:00.000Z",
        answeredAt: "2026-05-24T01:03:40.000Z",
        lastChangedAt: "2026-05-24T01:03:40.000Z",
        totalVisibleSeconds: 40,
        answerChangeCount: 0,
      },
      [unansweredQuestion.id]: {
        firstSeenAt: "2026-05-24T01:28:00.000Z",
        totalVisibleSeconds: 120,
        answerChangeCount: 0,
      },
    },
  };
  const reviews = buildQuestionReviews(questions, answers);

  return { attempt, questions, reviews, wrongQuestion, unansweredQuestion, wrongChoice };
}

describe("share review packets", () => {
  it("derives a senior brief without leaking local storage or raw attempt identifiers", () => {
    const { attempt, questions, reviews, wrongQuestion, unansweredQuestion, wrongChoice } =
      makeAttempt();

    const packet = buildShareReviewPacket({
      attempt,
      questions,
      reviews,
      context: makeContext(),
      options: { detailPreset: "senior_brief" },
      createdAt: "2026-05-24T02:00:00.000Z",
    });

    expect(packet.version).toBe(1);
    expect(packet.candidateContext.displayLabel).toBe("Anonymous candidate");
    expect(packet.attempt.answeredCount).toBe(2);
    expect(packet.attempt.unansweredCount).toBe(1);
    expect(packet.score.highConfidenceWrongCount).toBe(1);
    expect(packet.topics[0].label).toBe(TOPIC_LABELS[wrongQuestion.topic]);
    expect(packet.priorityMistakes.map((mistake) => mistake.questionId)).toEqual([
      wrongQuestion.id,
      unansweredQuestion.id,
    ]);
    expect(packet.priorityMistakes[0]).toMatchObject({
      priorityReason: "confident_wrong",
      prompt: wrongQuestion.prompt,
      chosenChoiceText: wrongChoice.text,
      correctChoiceId: wrongQuestion.correctChoiceId,
      explanation: wrongQuestion.explanation,
    });
    expect(packet.timing?.slowestMisses[0].questionId).toBe(wrongQuestion.id);
    expect(packet.timing?.unansweredTimeExpired).toBe(true);
    expect(JSON.stringify(packet)).not.toContain(attempt.id);
    expect(JSON.stringify(packet)).not.toContain(attempt.sessionId);
    expect(JSON.stringify(packet)).not.toContain("localStorage");
    expect(JSON.stringify(packet)).not.toContain("pm-assessment-theme");
  });

  it("renders safe summaries without prompt text, correct answer text, or explanations", () => {
    const { attempt, questions, reviews, wrongQuestion } = makeAttempt();

    const packet = buildShareReviewPacket({
      attempt,
      questions,
      reviews,
      context: makeContext({ identityMode: "display_label", displayLabel: "Edward" }),
      options: { detailPreset: "safe_summary" },
      createdAt: "2026-05-24T02:00:00.000Z",
    });
    const markdown = renderShareReviewMarkdown(packet);
    const correctText = wrongQuestion.choices.find(
      (choice) => choice.id === wrongQuestion.correctChoiceId
    )!.text;

    expect(packet.candidateContext.displayLabel).toBe("Edward");
    expect(packet.priorityMistakes[0].prompt).toBeUndefined();
    expect(packet.priorityMistakes[0].correctChoiceText).toBeUndefined();
    expect(packet.priorityMistakes[0].explanation).toBeUndefined();
    expect(markdown).toContain("Safe Summary");
    expect(markdown).not.toContain(wrongQuestion.prompt);
    expect(markdown).not.toContain(correctText);
    expect(markdown).not.toContain(wrongQuestion.explanation);
  });

  it("renders importable Markdown with senior-review sections", () => {
    const { attempt, questions, reviews, wrongQuestion } = makeAttempt();
    const packet = buildShareReviewPacket({
      attempt,
      questions,
      reviews,
      context: makeContext(),
      options: { detailPreset: "senior_brief" },
      createdAt: "2026-05-24T02:00:00.000Z",
    });

    const markdown = renderShareReviewMarkdown(packet);

    expect(markdown).toContain("# PM Assessment Review Packet");
    expect(markdown).toContain("## Candidate Context");
    expect(markdown).toContain("## Topic Breakdown");
    expect(markdown).toContain("## Confidence Calibration");
    expect(markdown).toContain("## Timing Review");
    expect(markdown).toContain("## Reviewer Prompts");
    expect(markdown).toContain(wrongQuestion.prompt);
    expect(markdown).toContain("```json");

    const parsed = parseShareReviewPacketText(markdown);
    expect(parsed.ok).toBe(true);
    expect(parsed.ok ? parsed.packet.score.correctCount : 0).toBe(packet.score.correctCount);
  });

  it("returns a safe parse failure for invalid imported packet text", () => {
    const parsed = parseShareReviewPacketText("not a PM Assessment packet");

    expect(parsed.ok).toBe(false);
    expect(parsed.ok ? "" : parsed.message).toMatch(/could not be read/i);
  });
});
