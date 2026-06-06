import {
  FULL_MOCK_DIFFICULTY_DISTRIBUTION,
  FULL_MOCK_DISTRIBUTION,
  TOPIC_ORDER,
} from "./questions";
import type {
  AnswerRecord,
  Question,
  QuestionReview,
  ScoreSummary,
  Topic,
} from "./types";

export type ConfidenceSummary = {
  falseConfidence: QuestionReview[];
  luckyCorrect: QuestionReview[];
  needsDrill: QuestionReview[];
  knownStrength: QuestionReview[];
};

type SelectionOptions = {
  recentQuestionIds?: Set<string>;
};

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function preferFreshQuestions(
  questions: Question[],
  recentQuestionIds: Set<string> | undefined
) {
  if (!recentQuestionIds || recentQuestionIds.size === 0) return questions;

  const freshQuestions = questions.filter((question) => !recentQuestionIds.has(question.id));
  const recentQuestions = questions.filter((question) => recentQuestionIds.has(question.id));
  return [...freshQuestions, ...recentQuestions];
}

function selectQuestionsByDifficulty(
  topicQuestions: Question[],
  topic: Topic,
  recentQuestionIds: Set<string> | undefined
) {
  const difficultyDistribution = FULL_MOCK_DIFFICULTY_DISTRIBUTION[topic];
  const topicTargetCount = Object.values(difficultyDistribution).reduce(
    (sum, count) => sum + count,
    0
  );
  const selected: Question[] = [];
  const selectedIds = new Set<string>();

  for (const difficulty of ["hard", "medium", "easy"] as Question["difficulty"][]) {
    const needed = difficultyDistribution[difficulty] ?? 0;
    if (needed === 0) continue;

    const candidates = preferFreshQuestions(
      shuffle(topicQuestions.filter((question) => question.difficulty === difficulty)),
      recentQuestionIds
    );

    for (const question of candidates) {
      if (selected.length >= topicTargetCount) break;
      if (selectedIds.has(question.id)) continue;
      if (selected.filter((item) => item.difficulty === difficulty).length >= needed) break;
      selected.push(question);
      selectedIds.add(question.id);
    }
  }

  return selected;
}

export function selectFullMockQuestions(
  questions: Question[],
  options: SelectionOptions = {}
): Question[] {
  const selected = TOPIC_ORDER.flatMap((topic) => {
    const needed = FULL_MOCK_DISTRIBUTION[topic];
    const topicQuestions = questions.filter((question) => question.topic === topic);

    if (topicQuestions.length < needed) {
      console.warn(
        `Only ${topicQuestions.length} ${topic} questions available; expected ${needed}.`
      );
    }

    const difficultySelected = selectQuestionsByDifficulty(
      topicQuestions,
      topic,
      options.recentQuestionIds
    );

    if (difficultySelected.length >= needed) {
      return difficultySelected.slice(0, needed);
    }

    const fallbackCandidates = preferFreshQuestions(
      shuffle(topicQuestions),
      options.recentQuestionIds
    );
    const selectedIds = new Set(difficultySelected.map((question) => question.id));
    const fallbackSelected = fallbackCandidates.filter((question) => !selectedIds.has(question.id));

    return [...difficultySelected, ...fallbackSelected].slice(0, needed);
  });

  return shuffle(selected);
}

export function selectTopicQuestions(
  questions: Question[],
  topic: Topic,
  limit = 10
): Question[] {
  return shuffle(questions.filter((question) => question.topic === topic)).slice(0, limit);
}

export function scoreQuestions(
  selectedQuestions: Question[],
  answers: Record<string, AnswerRecord>
): ScoreSummary {
  const topicBreakdown: ScoreSummary["topicBreakdown"] = {};
  let correctCount = 0;

  for (const question of selectedQuestions) {
    const answer = answers[question.id];
    const isCorrect = answer?.choiceId === question.correctChoiceId;

    if (isCorrect) correctCount += 1;

    const current = topicBreakdown[question.topic] ?? { correct: 0, total: 0, percent: 0 };
    current.total += 1;
    if (isCorrect) current.correct += 1;
    current.percent = Math.round((current.correct / current.total) * 100);
    topicBreakdown[question.topic] = current;
  }

  return {
    correctCount,
    totalCount: selectedQuestions.length,
    percent:
      selectedQuestions.length > 0
        ? Math.round((correctCount / selectedQuestions.length) * 100)
        : 0,
    topicBreakdown,
    weakestTopic: getWeakestTopic(topicBreakdown),
  };
}

export function getWeakestTopic(
  topicBreakdown: ScoreSummary["topicBreakdown"]
): Topic | undefined {
  let weakest: Topic | undefined;
  let mostWrong = -1;
  let lowestPercent = 101;
  let mostQuestions = -1;

  for (const topic of TOPIC_ORDER) {
    const score = topicBreakdown[topic];
    if (!score || score.total === 0) continue;

    const wrong = score.total - score.correct;
    if (
      wrong > mostWrong ||
      (wrong === mostWrong && score.percent < lowestPercent) ||
      (wrong === mostWrong && score.percent === lowestPercent && score.total > mostQuestions)
    ) {
      weakest = topic;
      mostWrong = wrong;
      lowestPercent = score.percent;
      mostQuestions = score.total;
    }
  }

  return weakest;
}

export function buildQuestionReviews(
  selectedQuestions: Question[],
  answers: Record<string, AnswerRecord>
): QuestionReview[] {
  return selectedQuestions.map((question) => {
    const answer = answers[question.id];
    return {
      questionId: question.id,
      topic: question.topic,
      prompt: question.prompt,
      chosenChoiceId: answer?.choiceId,
      confidence: answer?.confidence,
      correctChoiceId: question.correctChoiceId,
      isCorrect: answer?.choiceId === question.correctChoiceId,
      explanation: question.explanation,
      conceptTags: question.conceptTags,
    };
  });
}

export function getWrongReviewsByPriority(reviews: QuestionReview[]): QuestionReview[] {
  return reviews
    .filter((review) => !review.isCorrect)
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
}

export function buildConfidenceSummary(reviews: QuestionReview[]): ConfidenceSummary {
  return reviews.reduce<ConfidenceSummary>(
    (summary, review) => {
      const confidence = review.confidence ?? 1;

      if (!review.isCorrect && confidence === 3) {
        summary.falseConfidence.push(review);
      } else if (review.isCorrect && confidence < 3) {
        summary.luckyCorrect.push(review);
      } else if (!review.isCorrect) {
        summary.needsDrill.push(review);
      } else {
        summary.knownStrength.push(review);
      }

      return summary;
    },
    {
      falseConfidence: [],
      luckyCorrect: [],
      needsDrill: [],
      knownStrength: [],
    }
  );
}
