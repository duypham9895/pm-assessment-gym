import { TOPIC_LABELS } from "./questions";
import type { Question, QuestionReview, QuestionTimingMap } from "./types";

export type TimingSummaryItem = {
  questionId: string;
  attemptQuestionNumber: number;
  topicLabel: string;
  totalVisibleSeconds: number;
  estimatedSeconds: number;
  answerChangeCount: number;
  answered: boolean;
  isCorrect: boolean;
};

export type TimingSummary = {
  hasTiming: boolean;
  slowestMisses: TimingSummaryItem[];
  overInvestedQuestions: TimingSummaryItem[];
  unansweredTimeExpired: boolean;
  unansweredCount: number;
  pacingCaveat: string;
};

function ensureTimingRecord(
  timings: QuestionTimingMap,
  questionId: string,
  at: string
): QuestionTimingMap[string] {
  return (
    timings[questionId] ?? {
      firstSeenAt: at,
      totalVisibleSeconds: 0,
      answerChangeCount: 0,
    }
  );
}

export function markQuestionSeen(
  timings: QuestionTimingMap,
  questionId: string,
  at: string
): QuestionTimingMap {
  if (timings[questionId]) return timings;

  return {
    ...timings,
    [questionId]: ensureTimingRecord(timings, questionId, at),
  };
}

export function addQuestionVisibleSeconds(
  timings: QuestionTimingMap,
  questionId: string,
  seconds: number,
  at: string
): QuestionTimingMap {
  if (seconds <= 0) return markQuestionSeen(timings, questionId, at);

  const current = ensureTimingRecord(timings, questionId, at);
  return {
    ...timings,
    [questionId]: {
      ...current,
      totalVisibleSeconds: current.totalVisibleSeconds + seconds,
    },
  };
}

export function recordQuestionAnswered(
  timings: QuestionTimingMap,
  questionId: string,
  options: { at: string; changedChoice: boolean }
): QuestionTimingMap {
  const current = ensureTimingRecord(timings, questionId, options.at);
  return {
    ...timings,
    [questionId]: {
      ...current,
      answeredAt: current.answeredAt ?? options.at,
      lastChangedAt: options.at,
      answerChangeCount: current.answerChangeCount + (options.changedChoice ? 1 : 0),
    },
  };
}

export function buildTimingSummary({
  questions,
  reviews,
  questionTimings,
  durationSeconds,
  timeLimitSeconds,
}: {
  questions: Question[];
  reviews: QuestionReview[];
  questionTimings?: QuestionTimingMap;
  durationSeconds: number;
  timeLimitSeconds?: number;
}): TimingSummary {
  if (!questionTimings || Object.keys(questionTimings).length === 0) {
    return {
      hasTiming: false,
      slowestMisses: [],
      overInvestedQuestions: [],
      unansweredTimeExpired: false,
      unansweredCount: reviews.filter((review) => !review.chosenChoiceId).length,
      pacingCaveat: "Timing is available for attempts submitted after pacing tracking was added.",
    };
  }

  const reviewById = new Map(reviews.map((review) => [review.questionId, review]));
  const items = questions.map((question, index) => {
    const timing = questionTimings[question.id];
    const review = reviewById.get(question.id);
    return {
      questionId: question.id,
      attemptQuestionNumber: index + 1,
      topicLabel: TOPIC_LABELS[question.topic],
      totalVisibleSeconds: timing?.totalVisibleSeconds ?? 0,
      estimatedSeconds: question.estimatedSeconds,
      answerChangeCount: timing?.answerChangeCount ?? 0,
      answered: Boolean(review?.chosenChoiceId),
      isCorrect: Boolean(review?.isCorrect),
    };
  });

  const unansweredCount = reviews.filter((review) => !review.chosenChoiceId).length;
  const unansweredTimeExpired = Boolean(
    timeLimitSeconds && durationSeconds >= timeLimitSeconds && unansweredCount > 0
  );
  const slowestMisses = items
    .filter((item) => !item.isCorrect)
    .sort((a, b) => b.totalVisibleSeconds - a.totalVisibleSeconds)
    .slice(0, 3);
  const overInvestedQuestions = items
    .filter((item) => {
      const threshold = Math.max(90, Math.round(item.estimatedSeconds * 1.35));
      return item.totalVisibleSeconds >= threshold;
    })
    .sort((a, b) => b.totalVisibleSeconds - a.totalVisibleSeconds)
    .slice(0, 3);

  const pacingCaveat = unansweredTimeExpired
    ? "Pacing signal: time expired with unanswered questions, so separate concept gaps from completion strategy."
    : overInvestedQuestions.length > 0
      ? "Pacing signal: a few questions took materially longer than their target, so check whether the time bought accuracy."
      : "Pacing signal: no major over-invested or time-expired pattern appears in this attempt.";

  return {
    hasTiming: true,
    slowestMisses,
    overInvestedQuestions,
    unansweredTimeExpired,
    unansweredCount,
    pacingCaveat,
  };
}
