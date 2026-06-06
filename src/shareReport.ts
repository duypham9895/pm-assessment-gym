import { APP_NAME, isSupportedAppName, type SupportedAppName } from "./branding";
import { TOPIC_LABELS, TOPIC_ORDER } from "./questions";
import { buildTimingSummary, type TimingSummary } from "./questionTiming";
import type {
  ChoiceId,
  Confidence,
  Question,
  QuestionReview,
  QuestionTimingMap,
  SessionMode,
  Topic,
  Attempt,
} from "./types";

export type ShareDetailPreset = "senior_brief" | "safe_summary";

export type ShareCandidateContext = {
  identityMode: "anonymous" | "display_label";
  displayLabel?: string;
  targetRoleOrAssessment: string;
  feedbackRequest: string;
  testConditions:
    | "timed_uninterrupted"
    | "timed_interrupted"
    | "untimed_or_paused"
    | "practice_learning";
  deadline?: string;
  targetCompanyOrProductArea?: string;
  selfAssessment?: string;
  seniorQuestion?: string;
};

export type ShareReportOptions = {
  detailPreset: ShareDetailPreset;
};

export type ShareReviewPacket = {
  version: 1;
  createdAt: string;
  appName: SupportedAppName;
  detailPreset: ShareDetailPreset;
  candidateContext: ShareCandidateContext & { displayLabel: string };
  attempt: {
    mode: SessionMode;
    feedbackMode: "exam" | "practice";
    topicFilter?: Topic;
    startedAt: string;
    submittedAt: string;
    durationSeconds: number;
    timeLimitSeconds?: number;
    totalQuestions: number;
    answeredCount: number;
    unansweredCount: number;
    autoSubmitted: boolean;
  };
  score: {
    correctCount: number;
    totalCount: number;
    percent: number;
    wrongCount: number;
    unansweredCount: number;
    highConfidenceWrongCount: number;
    weakestTopic?: Topic;
    weakestTopicLabel?: string;
  };
  topics: ShareTopicDiagnostic[];
  confidence: ShareConfidenceDiagnostic;
  timing?: TimingSummary;
  priorityMistakes: ShareMistakeEvidence[];
  correctSummary: ShareCorrectSummary;
  nextPlan: ShareNextPlan;
  reviewerPrompts: string[];
  caveats: string[];
};

export type ShareTopicDiagnostic = {
  topic: Topic;
  label: string;
  correct: number;
  total: number;
  percent: number;
  wrong: number;
  unanswered: number;
  confidentWrong: number;
  missedConceptTags: string[];
  sampleSizeCaveat: string;
};

export type ShareConfidenceDiagnostic = {
  rows: Array<{
    confidence: Confidence;
    label: "Guessing" | "Unsure" | "Confident";
    correct: number;
    wrong: number;
    unanswered: number;
  }>;
  falseConfidenceCount: number;
  hiddenStrengthCount: number;
  knownGapCount: number;
};

export type ShareMistakeEvidence = {
  questionId: string;
  attemptQuestionNumber: number;
  topic: Topic;
  topicLabel: string;
  difficulty: Question["difficulty"];
  conceptTags: string[];
  estimatedSeconds: number;
  confidence?: Confidence;
  prompt?: string;
  chosenChoiceId?: ChoiceId;
  chosenChoiceText?: string;
  correctChoiceId?: ChoiceId;
  correctChoiceText?: string;
  explanation?: string;
  allChoices?: Array<{ id: ChoiceId; text: string }>;
  priorityReason: "confident_wrong" | "unanswered" | "wrong";
  timingSeconds?: number;
  answerChangeCount?: number;
};

export type ShareCorrectSummary = {
  count: number;
  lowConfidenceCorrectCount: number;
  conceptTags: string[];
};

export type ShareNextPlan = {
  weakestDrill: string;
  reviewFocus: string;
  frameworkRefresh: string;
  nextMock: string;
};

export type ParseShareReviewPacketResult =
  | { ok: true; packet: ShareReviewPacket }
  | { ok: false; message: string };

const TEST_CONDITION_LABELS: Record<ShareCandidateContext["testConditions"], string> = {
  timed_uninterrupted: "Timed and uninterrupted",
  timed_interrupted: "Timed but interrupted",
  untimed_or_paused: "Untimed or paused",
  practice_learning: "Practice / learning pass",
};

const REVIEWER_PROMPTS = [
  "What is the highest-risk reasoning pattern you see?",
  "Which one PM habit should I practice next?",
  "Which missed question best represents my real interview risk?",
  "Would you change my next drill plan?",
  "What would you ask me in a live debrief?",
];

function confidenceText(confidence: Confidence) {
  if (confidence === 1) return "Guessing" as const;
  if (confidence === 3) return "Confident" as const;
  return "Unsure" as const;
}

function modeText(mode: SessionMode) {
  return mode === "full_mock" ? "Full Mock" : "Topic Drill";
}

function feedbackText(mode: "exam" | "practice") {
  return mode === "exam" ? "Exam" : "Practice";
}

export function getDefaultShareContext(attempt: Attempt): ShareCandidateContext {
  return {
    identityMode: "anonymous",
    displayLabel: "",
    targetRoleOrAssessment: "PM analytical assessment practice",
    feedbackRequest:
      "Review my PM reasoning risk and the next practice step I should take.",
    testConditions:
      attempt.feedbackMode === "practice" ? "practice_learning" : "timed_uninterrupted",
    deadline: "",
    targetCompanyOrProductArea: "",
    selfAssessment: "",
    seniorQuestion: "",
  };
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function getChoiceText(question: Question, choiceId?: ChoiceId) {
  if (!choiceId) return undefined;
  return question.choices.find((choice) => choice.id === choiceId)?.text;
}

function uniqueByFrequency(tags: string[]) {
  const counts = new Map<string, number>();
  for (const tag of tags) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

function getTimeLimit(attempt: Attempt) {
  return attempt.timeLimitSeconds ?? (attempt.mode === "full_mock" ? 30 * 60 : attempt.questionIds.length * 90);
}

function buildTopicDiagnostics(reviews: QuestionReview[], attempt: Attempt) {
  return TOPIC_ORDER.flatMap((topic) => {
    const topicReviews = reviews.filter((review) => review.topic === topic);
    const score = attempt.score.topicBreakdown[topic];
    if (!score || topicReviews.length === 0) return [];

    const wrongReviews = topicReviews.filter((review) => !review.isCorrect);
    const unanswered = wrongReviews.filter((review) => !review.chosenChoiceId).length;
    const missedConceptTags = uniqueByFrequency(
      wrongReviews.flatMap((review) => review.conceptTags)
    ).slice(0, 5);

    return [
      {
        topic,
        label: TOPIC_LABELS[topic],
        correct: score.correct,
        total: score.total,
        percent: score.percent,
        wrong: score.total - score.correct,
        unanswered,
        confidentWrong: wrongReviews.filter((review) => review.confidence === 3).length,
        missedConceptTags,
        sampleSizeCaveat:
          attempt.mode === "full_mock"
            ? `${score.total}-question topic sample; treat as a signal, not a diagnosis.`
            : `${score.total}-question drill sample; use with the missed prompts and tags.`,
      },
    ];
  });
}

function buildConfidenceDiagnostic(reviews: QuestionReview[]): ShareConfidenceDiagnostic {
  const rows = ([1, 2, 3] as Confidence[]).map((confidence) => {
    const matching = reviews.filter((review) => (review.confidence ?? 2) === confidence);
    return {
      confidence,
      label: confidenceText(confidence),
      correct: matching.filter((review) => review.isCorrect).length,
      wrong: matching.filter((review) => !review.isCorrect && review.chosenChoiceId).length,
      unanswered: matching.filter((review) => !review.chosenChoiceId).length,
    };
  });

  return {
    rows,
    falseConfidenceCount: reviews.filter(
      (review) => review.confidence === 3 && !review.isCorrect && review.chosenChoiceId
    ).length,
    hiddenStrengthCount: reviews.filter(
      (review) => review.isCorrect && (review.confidence === 1 || review.confidence === 2)
    ).length,
    knownGapCount: reviews.filter(
      (review) => !review.isCorrect && review.chosenChoiceId && review.confidence !== 3
    ).length,
  };
}

function priorityReason(review: QuestionReview): ShareMistakeEvidence["priorityReason"] {
  if (!review.chosenChoiceId) return "unanswered";
  return review.confidence === 3 ? "confident_wrong" : "wrong";
}

function priorityRank(reason: ShareMistakeEvidence["priorityReason"]) {
  if (reason === "confident_wrong") return 0;
  if (reason === "unanswered") return 1;
  return 2;
}

function buildPriorityMistakes({
  reviews,
  questions,
  questionTimings,
  weakestTopic,
  detailPreset,
}: {
  reviews: QuestionReview[];
  questions: Question[];
  questionTimings?: QuestionTimingMap;
  weakestTopic?: Topic;
  detailPreset: ShareDetailPreset;
}): ShareMistakeEvidence[] {
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const indexById = new Map(questions.map((question, index) => [question.id, index + 1]));
  const includeDetails = detailPreset === "senior_brief";

  return reviews
    .filter((review) => !review.isCorrect)
    .flatMap((review): ShareMistakeEvidence[] => {
      const question = questionById.get(review.questionId);
      if (!question) return [];
      const reason = priorityReason(review);
      const timing = questionTimings?.[review.questionId];
      const mistake: ShareMistakeEvidence = {
        questionId: review.questionId,
        attemptQuestionNumber: indexById.get(review.questionId) ?? 0,
        topic: review.topic,
        topicLabel: TOPIC_LABELS[review.topic],
        difficulty: question.difficulty,
        conceptTags: review.conceptTags,
        estimatedSeconds: question.estimatedSeconds,
        confidence: review.confidence,
        ...(includeDetails
          ? {
              prompt: review.prompt,
              chosenChoiceId: review.chosenChoiceId,
              chosenChoiceText: getChoiceText(question, review.chosenChoiceId),
              correctChoiceId: review.correctChoiceId,
              correctChoiceText: getChoiceText(question, review.correctChoiceId),
              explanation: review.explanation,
              allChoices: question.choices,
            }
          : {}),
        priorityReason: reason,
        timingSeconds: timing?.totalVisibleSeconds,
        answerChangeCount: timing?.answerChangeCount,
      };
      return [mistake];
    })
    .sort((a, b) => {
      const rankDelta = priorityRank(a.priorityReason) - priorityRank(b.priorityReason);
      if (rankDelta !== 0) return rankDelta;
      if (a.topic === weakestTopic && b.topic !== weakestTopic) return -1;
      if (a.topic !== weakestTopic && b.topic === weakestTopic) return 1;
      return (b.confidence ?? 0) - (a.confidence ?? 0) || a.attemptQuestionNumber - b.attemptQuestionNumber;
    });
}

function buildNextPlan(attempt: Attempt, topics: ShareTopicDiagnostic[]): ShareNextPlan {
  const weakestLabel = attempt.score.weakestTopic
    ? TOPIC_LABELS[attempt.score.weakestTopic]
    : "the weakest visible topic";
  const topMissedTags = uniqueByFrequency(
    topics.flatMap((topic) => topic.missedConceptTags)
  ).slice(0, 2);

  return {
    weakestDrill: attempt.score.weakestTopic
      ? `Drill ${weakestLabel} in Practice mode, then return to a timed mock.`
      : "Run another Full Mock Exam to check whether the baseline holds.",
    reviewFocus: topMissedTags.length
      ? `Senior review focus: ${topMissedTags.join(", ")}.`
      : "Senior review focus: explain the reasoning behind the highest-risk misses.",
    frameworkRefresh: `Refresh the ${weakestLabel} checklist before the next timed set.`,
    nextMock: "Retake a Full Mock Exam after one focused drill and review pass.",
  };
}

export function buildShareReviewPacket({
  attempt,
  questions,
  reviews,
  context,
  options,
  createdAt = new Date().toISOString(),
}: {
  attempt: Attempt;
  questions: Question[];
  reviews: QuestionReview[];
  context: ShareCandidateContext;
  options: ShareReportOptions;
  createdAt?: string;
}): ShareReviewPacket {
  const answeredCount = reviews.filter((review) => review.chosenChoiceId).length;
  const unansweredCount = reviews.length - answeredCount;
  const timeLimitSeconds = getTimeLimit(attempt);
  const topics = buildTopicDiagnostics(reviews, attempt);
  const confidence = buildConfidenceDiagnostic(reviews);
  const displayLabel =
    context.identityMode === "display_label" && context.displayLabel?.trim()
      ? context.displayLabel.trim()
      : "Anonymous candidate";
  const timing = buildTimingSummary({
    questions,
    reviews,
    questionTimings: attempt.questionTimings,
    durationSeconds: attempt.durationSeconds,
    timeLimitSeconds,
  });

  const correctReviews = reviews.filter((review) => review.isCorrect);
  const correctSummary = {
    count: correctReviews.length,
    lowConfidenceCorrectCount: correctReviews.filter(
      (review) => review.confidence === 1 || review.confidence === 2
    ).length,
    conceptTags: uniqueByFrequency(correctReviews.flatMap((review) => review.conceptTags)).slice(
      0,
      8
    ),
  };
  const nextPlan = buildNextPlan(attempt, topics);
  const caveats = [
    "This is a practice artifact, not a validated hiring score.",
    "Topic subscores use small samples; treat them as review signals.",
    ...(attempt.feedbackMode === "practice"
      ? ["Practice mode results are less exam-like because feedback appears during the attempt."]
      : []),
    ...(options.detailPreset === "senior_brief"
      ? ["This packet may include question content and answer explanations. Share only with a trusted reviewer."]
      : ["Safe Summary omits full prompts, answer text, and explanations."]
    ),
    timing.pacingCaveat,
  ];

  return {
    version: 1,
    createdAt,
    appName: APP_NAME,
    detailPreset: options.detailPreset,
    candidateContext: {
      ...context,
      displayLabel,
    },
    attempt: {
      mode: attempt.mode,
      feedbackMode: attempt.feedbackMode,
      topicFilter: attempt.topicFilter,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      durationSeconds: attempt.durationSeconds,
      timeLimitSeconds,
      totalQuestions: attempt.score.totalCount,
      answeredCount,
      unansweredCount,
      autoSubmitted: Boolean(timeLimitSeconds && attempt.durationSeconds >= timeLimitSeconds),
    },
    score: {
      correctCount: attempt.score.correctCount,
      totalCount: attempt.score.totalCount,
      percent: attempt.score.percent,
      wrongCount: attempt.score.totalCount - attempt.score.correctCount,
      unansweredCount,
      highConfidenceWrongCount: confidence.falseConfidenceCount,
      weakestTopic: attempt.score.weakestTopic,
      weakestTopicLabel: attempt.score.weakestTopic
        ? TOPIC_LABELS[attempt.score.weakestTopic]
        : undefined,
    },
    topics,
    confidence,
    timing: timing.hasTiming ? timing : undefined,
    priorityMistakes: buildPriorityMistakes({
      reviews,
      questions,
      questionTimings: attempt.questionTimings,
      weakestTopic: attempt.score.weakestTopic,
      detailPreset: options.detailPreset,
    }),
    correctSummary,
    nextPlan,
    reviewerPrompts: REVIEWER_PROMPTS,
    caveats,
  };
}

function escapeTableCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function listItem(label: string, value?: string) {
  return value?.trim() ? `- ${label}: ${value.trim()}` : undefined;
}

function renderTimingMarkdown(timing?: TimingSummary) {
  if (!timing) return "";

  const slowest = timing.slowestMisses.length
    ? timing.slowestMisses
        .map(
          (item) =>
            `- Q${item.attemptQuestionNumber} ${item.topicLabel}: ${formatDuration(
              item.totalVisibleSeconds
            )} visible, ${item.answerChangeCount} answer change${
              item.answerChangeCount === 1 ? "" : "s"
            }`
        )
        .join("\n")
    : "- No missed-question timing signal.";
  const overInvested = timing.overInvestedQuestions.length
    ? timing.overInvestedQuestions
        .map(
          (item) =>
            `- Q${item.attemptQuestionNumber} ${item.topicLabel}: ${formatDuration(
              item.totalVisibleSeconds
            )} vs ${item.estimatedSeconds}s target`
        )
        .join("\n")
    : "- No major over-invested questions.";

  return `## Timing Review
- Unanswered/time-expired signal: ${
    timing.unansweredTimeExpired ? "Time expired with unanswered questions" : "No time-expired unanswered signal"
  }
- Pacing caveat: ${timing.pacingCaveat}

### Slowest Missed Questions
${slowest}

### Over-Invested Questions
${overInvested}
`;
}

export function renderShareReviewMarkdown(packet: ShareReviewPacket): string {
  const detailLabel = packet.detailPreset === "senior_brief" ? "Senior Brief" : "Safe Summary";
  const topTags = packet.topics.flatMap((topic) => topic.missedConceptTags).slice(0, 5);
  const topicRows = packet.topics
    .map(
      (topic) =>
        `| ${escapeTableCell(topic.label)} | ${topic.correct} | ${topic.total} | ${topic.percent}% | ${topic.confidentWrong} | ${escapeTableCell(
          topic.missedConceptTags.join(", ") || "None"
        )} |`
    )
    .join("\n");
  const confidenceRows = packet.confidence.rows
    .map(
      (row) =>
        `| ${row.label} | ${row.correct} | ${row.wrong} | ${row.unanswered} |`
    )
    .join("\n");
  const mistakes = packet.priorityMistakes.length
    ? packet.priorityMistakes
        .map((mistake, index) => {
          const lines = [
            `### ${index + 1}. Q${mistake.attemptQuestionNumber} ${mistake.topicLabel} - ${mistake.priorityReason.replace(/_/g, " ")}`,
            `- Difficulty: ${mistake.difficulty}`,
            `- Tags: ${mistake.conceptTags.join(", ") || "None"}`,
            `- Confidence: ${mistake.confidence ? confidenceText(mistake.confidence) : "Unanswered"}`,
            mistake.timingSeconds !== undefined
              ? `- Timing: ${formatDuration(mistake.timingSeconds)} visible, ${mistake.answerChangeCount ?? 0} answer changes`
              : undefined,
            mistake.prompt ? `- Prompt: ${mistake.prompt}` : undefined,
            mistake.chosenChoiceId
              ? `- My answer: ${mistake.chosenChoiceId}. ${mistake.chosenChoiceText ?? "Answer text omitted"}`
              : "- My answer: Unanswered",
            mistake.correctChoiceId
              ? `- Correct answer: ${mistake.correctChoiceId}. ${mistake.correctChoiceText ?? "Answer text omitted"}`
              : undefined,
            mistake.explanation ? `- Explanation: ${mistake.explanation}` : undefined,
            "- Senior feedback notes:",
          ].filter(Boolean);
          return lines.join("\n");
        })
        .join("\n\n")
    : "No priority mistakes in this attempt.";

  const contextLines = [
    listItem("Candidate", packet.candidateContext.displayLabel),
    listItem("Target", packet.candidateContext.targetRoleOrAssessment),
    listItem("Feedback request", packet.candidateContext.feedbackRequest),
    listItem("Test conditions", TEST_CONDITION_LABELS[packet.candidateContext.testConditions]),
    listItem("Deadline", packet.candidateContext.deadline),
    listItem("Target company / product area", packet.candidateContext.targetCompanyOrProductArea),
    listItem("Self-assessment", packet.candidateContext.selfAssessment),
    listItem("Specific senior question", packet.candidateContext.seniorQuestion),
  ]
    .filter(Boolean)
    .join("\n");

  return `# ${APP_NAME} Review Packet

Detail preset: ${detailLabel}

## Candidate Context
${contextLines}

## Attempt Summary
- Mode: ${modeText(packet.attempt.mode)}${packet.attempt.topicFilter ? ` - ${TOPIC_LABELS[packet.attempt.topicFilter]}` : ""}
- Feedback mode: ${feedbackText(packet.attempt.feedbackMode)}
- Started: ${formatDateTime(packet.attempt.startedAt)}
- Submitted: ${formatDateTime(packet.attempt.submittedAt)}
- Duration: ${formatDuration(packet.attempt.durationSeconds)} of ${formatDuration(packet.attempt.timeLimitSeconds ?? packet.attempt.durationSeconds)}
- Questions: ${packet.attempt.totalQuestions} total, ${packet.attempt.answeredCount} answered, ${packet.attempt.unansweredCount} unanswered
- Score: ${packet.score.correctCount}/${packet.score.totalCount} (${packet.score.percent}%)
- Weakest topic: ${packet.score.weakestTopicLabel ?? "None"}
- Auto-submitted at timer zero: ${packet.attempt.autoSubmitted ? "Yes" : "No"}

## Senior Triage
- Highest-risk signal: ${packet.score.highConfidenceWrongCount} confident wrong answer${packet.score.highConfidenceWrongCount === 1 ? "" : "s"}
- Main topic risk: ${packet.score.weakestTopicLabel ?? "No weak topic stood out"}
- Main concept tags: ${topTags.length ? topTags.join(", ") : "No repeated missed tags"}
- Suggested next action: ${packet.nextPlan.weakestDrill}

## Topic Breakdown
| Topic | Correct | Total | Percent | Confident wrong | Missed tags |
| --- | ---: | ---: | ---: | ---: | --- |
${topicRows}

## Confidence Calibration
| Confidence | Correct | Wrong | Unanswered |
| --- | ---: | ---: | ---: |
${confidenceRows}

${renderTimingMarkdown(packet.timing)}
## Priority Mistakes

${mistakes}

## Correct Answer Summary
- Correct answers: ${packet.correctSummary.count}
- Low-confidence correct answers: ${packet.correctSummary.lowConfidenceCorrectCount}
- Correct-answer tags: ${packet.correctSummary.conceptTags.join(", ") || "None"}

## Next Plan
- ${packet.nextPlan.weakestDrill}
- ${packet.nextPlan.reviewFocus}
- ${packet.nextPlan.frameworkRefresh}
- ${packet.nextPlan.nextMock}

## Reviewer Prompts
${packet.reviewerPrompts.map((prompt) => `- ${prompt}`).join("\n")}

## Caveats
${packet.caveats.map((caveat) => `- ${caveat}`).join("\n")}

## App Import Data
\`\`\`json
${JSON.stringify(packet, null, 2)}
\`\`\`
`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isShareReviewPacket(value: unknown): value is ShareReviewPacket {
  return (
    isRecord(value) &&
    value.version === 1 &&
    isSupportedAppName(value.appName) &&
    isRecord(value.candidateContext) &&
    isRecord(value.attempt) &&
    isRecord(value.score) &&
    Array.isArray(value.topics) &&
    Array.isArray(value.priorityMistakes) &&
    Array.isArray(value.reviewerPrompts) &&
    Array.isArray(value.caveats)
  );
}

function tryParsePacket(raw: string): ShareReviewPacket | null {
  try {
    const parsed = JSON.parse(raw);
    return isShareReviewPacket(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function parseShareReviewPacketText(text: string): ParseShareReviewPacketResult {
  const trimmed = text.trim();
  const direct = tryParsePacket(trimmed);
  if (direct) return { ok: true, packet: direct };

  const jsonBlocks = [...trimmed.matchAll(/```json\s*([\s\S]*?)```/gi)].map((match) =>
    match[1].trim()
  );
  for (const block of jsonBlocks.reverse()) {
    const parsed = tryParsePacket(block);
    if (parsed) return { ok: true, packet: parsed };
  }

  return {
    ok: false,
    message: `This review packet could not be read. Paste Markdown or JSON generated by ${APP_NAME}.`,
  };
}
