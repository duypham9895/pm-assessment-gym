export type Topic =
  | "product_analytics"
  | "data_literacy"
  | "chart_interpretation"
  | "inductive_reasoning"
  | "data_interpretation"
  | "ab_testing";

export type ChoiceId = "A" | "B" | "C" | "D" | "E";
export type Confidence = 1 | 2 | 3;

export type AnswerRecord = {
  choiceId: ChoiceId;
  confidence: Confidence;
};

export type SessionMode = "full_mock" | "topic_drill";
export type FeedbackMode = "exam" | "practice";

export type Question = {
  id: string;
  topic: Topic;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  choices: {
    id: ChoiceId;
    text: string;
  }[];
  correctChoiceId: ChoiceId;
  explanation: string;
  conceptTags: string[];
  estimatedSeconds: number;
};

export type TestSession = {
  id: string;
  mode: SessionMode;
  feedbackMode: FeedbackMode;
  topicFilter?: Topic;
  startedAt: string;
  timeLimitSeconds: number;
  questionIds: string[];
  answers: Record<string, AnswerRecord>;
  currentQuestionIndex: number;
};

export type ActiveSessionSnapshot = {
  version: 1;
  routePath: string;
  savedAt: string;
  remainingSeconds: number;
  confidenceDrafts: Record<string, Confidence>;
  session: TestSession;
};

export type TopicScore = {
  correct: number;
  total: number;
  percent: number;
};

export type ScoreSummary = {
  correctCount: number;
  totalCount: number;
  percent: number;
  topicBreakdown: Partial<Record<Topic, TopicScore>>;
  weakestTopic?: Topic;
};

export type QuestionReview = {
  questionId: string;
  topic: Topic;
  prompt: string;
  chosenChoiceId?: ChoiceId;
  confidence?: Confidence;
  correctChoiceId: ChoiceId;
  isCorrect: boolean;
  explanation: string;
  conceptTags: string[];
};

export type Attempt = {
  id: string;
  sessionId: string;
  mode: SessionMode;
  feedbackMode: FeedbackMode;
  topicFilter?: Topic;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  questionIds: string[];
  answers: Record<string, AnswerRecord>;
  score: ScoreSummary;
};
