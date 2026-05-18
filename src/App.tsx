import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FRAMEWORKS_MARKDOWN } from "./frameworks";
import { QUESTIONS, TOPIC_LABELS, TOPIC_ORDER } from "./questions";
import {
  buildQuestionReviews,
  getWrongReviewsByPriority,
  scoreQuestions,
  selectFullMockQuestions,
  selectTopicQuestions,
} from "./scoring";
import { loadAttempts, saveAttempt } from "./storage";
import type {
  Attempt,
  ChoiceId,
  Confidence,
  FeedbackMode,
  Question,
  QuestionReview,
  SessionMode,
  TestSession,
  Topic,
} from "./types";

type View = "home" | "test" | "results" | "frameworks";

const CHOICE_IDS: ChoiceId[] = ["A", "B", "C", "D", "E"];
const QUESTION_BY_ID = new Map(QUESTIONS.map((question) => [question.id, question]));

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function getTimerOverrideSeconds() {
  const value = new URLSearchParams(window.location.search).get("timerSeconds");
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 30) return undefined;
  return Math.floor(parsed);
}

function modeLabel(mode: SessionMode) {
  return mode === "full_mock" ? "Full Mock" : "Topic Drill";
}

function feedbackModeLabel(mode: FeedbackMode) {
  return mode === "exam" ? "Exam" : "Practice";
}

function confidenceLabel(confidence?: Confidence) {
  if (confidence === 1) return "1 Guessing";
  if (confidence === 3) return "3 Confident";
  return "2 Unsure";
}

function getQuestionsFromAttempt(attempt: Attempt) {
  return attempt.questionIds
    .map((questionId) => QUESTION_BY_ID.get(questionId))
    .filter((question): question is Question => Boolean(question));
}

function getChoiceText(question: Question, choiceId?: ChoiceId) {
  if (!choiceId) return "Unanswered";
  return question.choices.find((choice) => choice.id === choiceId)?.text ?? "Unknown choice";
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [attempts, setAttempts] = useState<Attempt[]>(() => loadAttempts());
  const [selectedMode, setSelectedMode] = useState<SessionMode>("full_mock");
  const [selectedFeedbackMode, setSelectedFeedbackMode] = useState<FeedbackMode>("exam");
  const [selectedTopic, setSelectedTopic] = useState<Topic>("product_analytics");
  const [session, setSession] = useState<TestSession | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [latestAttempt, setLatestAttempt] = useState<Attempt | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [confidenceDrafts, setConfidenceDrafts] = useState<Record<string, Confidence>>({});
  const [unansweredWarning, setUnansweredWarning] = useState<number[] | null>(null);
  const submittedSessionIds = useRef(new Set<string>());

  const currentQuestion = session
    ? selectedQuestions[session.currentQuestionIndex]
    : undefined;
  const currentAnswer =
    session && currentQuestion ? session.answers[currentQuestion.id] : undefined;
  const answeredCount = session
    ? selectedQuestions.filter((question) => session.answers[question.id]).length
    : 0;

  const startSession = useCallback(
    (overrides?: {
      mode?: SessionMode;
      feedbackMode?: FeedbackMode;
      topic?: Topic;
    }) => {
      const nextMode = overrides?.mode ?? selectedMode;
      const nextFeedbackMode = overrides?.feedbackMode ?? selectedFeedbackMode;
      const nextTopic = overrides?.topic ?? selectedTopic;
      const nextQuestions =
        nextMode === "full_mock"
          ? selectFullMockQuestions(QUESTIONS)
          : selectTopicQuestions(QUESTIONS, nextTopic);

      if (nextQuestions.length === 0) {
        window.alert("No questions are available for this mode yet.");
        return;
      }

      const defaultTimeLimitSeconds =
        nextMode === "full_mock" ? 30 * 60 : Math.max(nextQuestions.length, 1) * 90;
      const timeLimitSeconds = getTimerOverrideSeconds() ?? defaultTimeLimitSeconds;
      const nextSession: TestSession = {
        id: createId("session"),
        mode: nextMode,
        feedbackMode: nextFeedbackMode,
        topicFilter: nextMode === "topic_drill" ? nextTopic : undefined,
        startedAt: new Date().toISOString(),
        timeLimitSeconds,
        questionIds: nextQuestions.map((question) => question.id),
        answers: {},
        currentQuestionIndex: 0,
      };

      setSelectedMode(nextMode);
      setSelectedFeedbackMode(nextFeedbackMode);
      setSelectedTopic(nextTopic);
      setSelectedQuestions(nextQuestions);
      setSession(nextSession);
      setLatestAttempt(null);
      setConfidenceDrafts({});
      setUnansweredWarning(null);
      setRemainingSeconds(timeLimitSeconds);
      setView("test");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [selectedFeedbackMode, selectedMode, selectedTopic]
  );

  const submitSession = useCallback(
    (options?: { skipUnansweredWarning?: boolean }) => {
      if (!session) return;
      if (submittedSessionIds.current.has(session.id)) return;

      const unansweredIndexes = selectedQuestions
        .map((question, index) => (session.answers[question.id] ? null : index + 1))
        .filter((index): index is number => index !== null);

      if (!options?.skipUnansweredWarning && unansweredIndexes.length > 0) {
        setUnansweredWarning(unansweredIndexes);
        return;
      }

      submittedSessionIds.current.add(session.id);
      setUnansweredWarning(null);

      const submittedAt = new Date().toISOString();
      const attempt: Attempt = {
        id: createId("attempt"),
        sessionId: session.id,
        mode: session.mode,
        feedbackMode: session.feedbackMode,
        topicFilter: session.topicFilter,
        startedAt: session.startedAt,
        submittedAt,
        durationSeconds: Math.max(0, session.timeLimitSeconds - remainingSeconds),
        questionIds: session.questionIds,
        answers: session.answers,
        score: scoreQuestions(selectedQuestions, session.answers),
      };

      const storedAttempts = saveAttempt(attempt);
      setAttempts(storedAttempts);
      setLatestAttempt(attempt);
      setRemainingSeconds(0);
      setView("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [remainingSeconds, selectedQuestions, session]
  );

  const selectChoice = useCallback(
    (choiceId: ChoiceId) => {
      setSession((previous) => {
        if (!previous) return previous;
        const questionId = previous.questionIds[previous.currentQuestionIndex];
        const previousAnswer = previous.answers[questionId];
        return {
          ...previous,
          answers: {
            ...previous.answers,
            [questionId]: {
              choiceId,
              confidence: previousAnswer?.confidence ?? confidenceDrafts[questionId] ?? 2,
            },
          },
        };
      });
    },
    [confidenceDrafts]
  );

  const setCurrentConfidence = useCallback(
    (confidence: Confidence) => {
      if (!session) return;
      const activeQuestionId = session.questionIds[session.currentQuestionIndex];
      setConfidenceDrafts((drafts) => ({ ...drafts, [activeQuestionId]: confidence }));

      setSession((previous) => {
        if (!previous) return previous;
        const questionId = previous.questionIds[previous.currentQuestionIndex];
        const previousAnswer = previous.answers[questionId];
        if (!previousAnswer) return previous;

        return {
          ...previous,
          answers: {
            ...previous.answers,
            [questionId]: {
              ...previousAnswer,
              confidence,
            },
          },
        };
      });
    },
    [session]
  );

  const moveQuestion = useCallback((direction: -1 | 1) => {
    setSession((previous) => {
      if (!previous) return previous;
      const nextIndex = previous.currentQuestionIndex + direction;
      if (nextIndex < 0 || nextIndex >= previous.questionIds.length) return previous;
      return { ...previous, currentQuestionIndex: nextIndex };
    });
  }, []);

  useEffect(() => {
    if (view !== "test" || !session) return;

    const interval = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [session?.id, view]);

  useEffect(() => {
    if (view === "test" && session && remainingSeconds === 0) {
      submitSession({ skipUnansweredWarning: true });
    }
  }, [remainingSeconds, session, submitSession, view]);

  useEffect(() => {
    if (view !== "test" || !session) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;

      const choiceIndex = Number(event.key) - 1;
      const choiceId = CHOICE_IDS[choiceIndex];
      if (choiceId) {
        event.preventDefault();
        selectChoice(choiceId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectChoice, session, view]);

  const resultData = useMemo(() => {
    if (!latestAttempt) {
      return {
        allReviews: [] as QuestionReview[],
        wrongReviews: [] as QuestionReview[],
        correctCount: 0,
      };
    }

    const questions = getQuestionsFromAttempt(latestAttempt);
    const allReviews = buildQuestionReviews(questions, latestAttempt.answers);
    return {
      allReviews,
      wrongReviews: getWrongReviewsByPriority(allReviews),
      correctCount: allReviews.filter((review) => review.isCorrect).length,
    };
  }, [latestAttempt]);

  return (
    <main className="app-shell">
      {view === "home" && (
        <HomeView
          attempts={attempts}
          selectedMode={selectedMode}
          selectedFeedbackMode={selectedFeedbackMode}
          selectedTopic={selectedTopic}
          onModeChange={setSelectedMode}
          onFeedbackModeChange={setSelectedFeedbackMode}
          onTopicChange={setSelectedTopic}
          onStart={() => startSession()}
          onFrameworks={() => setView("frameworks")}
        />
      )}

      {view === "test" && session && currentQuestion && (
        <TestView
          answer={currentAnswer}
          answeredCount={answeredCount}
          currentConfidence={
            currentAnswer?.confidence ?? confidenceDrafts[currentQuestion.id] ?? 2
          }
          currentIndex={session.currentQuestionIndex}
          question={currentQuestion}
          questionCount={selectedQuestions.length}
          remainingSeconds={remainingSeconds}
          session={session}
          unansweredWarning={unansweredWarning}
          onAnswer={selectChoice}
          onConfidence={setCurrentConfidence}
          onDismissSubmitWarning={() => setUnansweredWarning(null)}
          onMove={moveQuestion}
          onSubmit={() => submitSession()}
          onSubmitAnyway={() => submitSession({ skipUnansweredWarning: true })}
        />
      )}

      {view === "results" && latestAttempt && (
        <ResultsView
          attempt={latestAttempt}
          correctCount={resultData.correctCount}
          wrongReviews={resultData.wrongReviews}
          onFullMock={() => startSession({ mode: "full_mock", feedbackMode: "exam" })}
          onDrillWeakest={(topic) =>
            startSession({ mode: "topic_drill", feedbackMode: "practice", topic })
          }
          onHome={() => {
            setSession(null);
            setView("home");
          }}
        />
      )}

      {view === "frameworks" && (
        <FrameworksView
          onBack={() => {
            setView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </main>
  );
}

type HomeViewProps = {
  attempts: Attempt[];
  selectedMode: SessionMode;
  selectedFeedbackMode: FeedbackMode;
  selectedTopic: Topic;
  onModeChange: (mode: SessionMode) => void;
  onFeedbackModeChange: (mode: FeedbackMode) => void;
  onTopicChange: (topic: Topic) => void;
  onStart: () => void;
  onFrameworks: () => void;
};

function HomeView({
  attempts,
  selectedMode,
  selectedFeedbackMode,
  selectedTopic,
  onModeChange,
  onFeedbackModeChange,
  onTopicChange,
  onStart,
  onFrameworks,
}: HomeViewProps) {
  return (
    <div className="stack">
      <header className="top-header">
        <div>
          <h1>PM Assessment Gym</h1>
          <p>Practice mocks for PM assessment readiness</p>
        </div>
        <button className="secondary-button" type="button" onClick={onFrameworks}>
          Frameworks
        </button>
      </header>

      <section className="panel">
        <div className="control-grid">
          <div className="control-block">
            <span className="control-label">Mode</span>
            <div className="segmented-control" aria-label="Mode">
              <button
                type="button"
                className={selectedMode === "full_mock" ? "active" : ""}
                aria-pressed={selectedMode === "full_mock"}
                onClick={() => onModeChange("full_mock")}
              >
                Full Mock
              </button>
              <button
                type="button"
                className={selectedMode === "topic_drill" ? "active" : ""}
                aria-pressed={selectedMode === "topic_drill"}
                onClick={() => onModeChange("topic_drill")}
              >
                Topic Drill
              </button>
            </div>
          </div>

          <div className="control-block">
            <span className="control-label">Feedback</span>
            <div className="segmented-control" aria-label="Feedback mode">
              <button
                type="button"
                className={selectedFeedbackMode === "exam" ? "active" : ""}
                aria-pressed={selectedFeedbackMode === "exam"}
                onClick={() => onFeedbackModeChange("exam")}
              >
                Exam
              </button>
              <button
                type="button"
                className={selectedFeedbackMode === "practice" ? "active" : ""}
                aria-pressed={selectedFeedbackMode === "practice"}
                onClick={() => onFeedbackModeChange("practice")}
              >
                Practice
              </button>
            </div>
          </div>

          {selectedMode === "topic_drill" && (
            <label className="control-block">
              <span className="control-label">Topic</span>
              <select
                value={selectedTopic}
                onChange={(event) => onTopicChange(event.target.value as Topic)}
              >
                {TOPIC_ORDER.map((topic) => (
                  <option key={topic} value={topic}>
                    {TOPIC_LABELS[topic]}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <button className="primary-button start-button" type="button" onClick={onStart}>
          Start
        </button>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Latest Attempts</h2>
          <span>{attempts.length ? `${Math.min(attempts.length, 3)} shown` : "Ready"}</span>
        </div>

        {attempts.length === 0 ? (
          <p className="empty-state">
            No attempts yet. Start with a Full Mock in Exam Mode to create your baseline.
          </p>
        ) : (
          <div className="attempt-list">
            {attempts.slice(0, 3).map((attempt) => (
              <div className="attempt-row" key={attempt.id}>
                <div>
                  <strong>{formatDate(attempt.submittedAt)}</strong>
                  <span>
                    {modeLabel(attempt.mode)}
                    {attempt.topicFilter ? `: ${TOPIC_LABELS[attempt.topicFilter]}` : ""} ·{" "}
                    {feedbackModeLabel(attempt.feedbackMode)}
                  </span>
                </div>
                <div>
                  <strong>
                    {attempt.score.correctCount}/{attempt.score.totalCount}
                  </strong>
                  <span>{attempt.score.percent}%</span>
                </div>
                <div>
                  <strong>Weakest</strong>
                  <span>
                    {attempt.score.weakestTopic
                      ? TOPIC_LABELS[attempt.score.weakestTopic]
                      : "None"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type TestViewProps = {
  answer: { choiceId: ChoiceId; confidence: Confidence } | undefined;
  answeredCount: number;
  currentConfidence: Confidence;
  currentIndex: number;
  question: Question;
  questionCount: number;
  remainingSeconds: number;
  session: TestSession;
  unansweredWarning: number[] | null;
  onAnswer: (choiceId: ChoiceId) => void;
  onConfidence: (confidence: Confidence) => void;
  onDismissSubmitWarning: () => void;
  onMove: (direction: -1 | 1) => void;
  onSubmit: () => void;
  onSubmitAnyway: () => void;
};

function TestView({
  answer,
  answeredCount,
  currentConfidence,
  currentIndex,
  question,
  questionCount,
  remainingSeconds,
  session,
  unansweredWarning,
  onAnswer,
  onConfidence,
  onDismissSubmitWarning,
  onMove,
  onSubmit,
  onSubmitAnyway,
}: TestViewProps) {
  const isPracticeFeedbackVisible = session.feedbackMode === "practice" && Boolean(answer);
  const isCorrect = answer?.choiceId === question.correctChoiceId;

  return (
    <div className="test-layout">
      <header className="test-bar">
        <div>
          <strong>
            {modeLabel(session.mode)} · {feedbackModeLabel(session.feedbackMode)}
          </strong>
          <span>{answeredCount}/{questionCount} answered</span>
        </div>
        <div className="timer" aria-label="Timer">
          {formatTimer(remainingSeconds)}
        </div>
        <button className="primary-button" type="button" onClick={onSubmit}>
          Submit
        </button>
      </header>

      {unansweredWarning && (
        <section className="submit-warning" role="alert">
          <div>
            <strong>Unanswered questions</strong>
            <p>{unansweredWarning.map((index) => `Q${index}`).join(", ")}</p>
          </div>
          <div>
            <button className="secondary-button" type="button" onClick={onDismissSubmitWarning}>
              Keep answering
            </button>
            <button className="primary-button" type="button" onClick={onSubmitAnyway}>
              Submit anyway
            </button>
          </div>
        </section>
      )}

      <section className="question-panel">
        <div className="question-meta">
          <span>
            Q{currentIndex + 1} / {questionCount}
          </span>
          <span>{TOPIC_LABELS[question.topic]}</span>
        </div>
        <h1>{question.prompt}</h1>

        <div className="choices" aria-label="Answer choices">
          {question.choices.map((choice) => {
            const isSelected = answer?.choiceId === choice.id;
            const showCorrect = isPracticeFeedbackVisible && choice.id === question.correctChoiceId;
            const showWrong = isPracticeFeedbackVisible && isSelected && !isCorrect;
            return (
              <button
                className={[
                  "choice-button",
                  isSelected ? "selected" : "",
                  showCorrect ? "correct" : "",
                  showWrong ? "wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={choice.id}
                type="button"
                onClick={() => onAnswer(choice.id)}
              >
                <span>{choice.id}</span>
                {choice.text}
              </button>
            );
          })}
        </div>

        <div className="confidence-block">
          <span className="control-label">Confidence</span>
          <div className="confidence-options" aria-label="Confidence rating">
            {([1, 2, 3] as Confidence[]).map((confidence) => (
              <button
                className={currentConfidence === confidence ? "active" : ""}
                key={confidence}
                type="button"
                aria-pressed={currentConfidence === confidence}
                onClick={() => onConfidence(confidence)}
              >
                {confidenceLabel(confidence)}
              </button>
            ))}
          </div>
        </div>

        {isPracticeFeedbackVisible && (
          <div className={isCorrect ? "feedback correct-feedback" : "feedback wrong-feedback"}>
            <strong>{isCorrect ? "Correct" : "Incorrect"}</strong>
            <p>
              Correct answer: {question.correctChoiceId}.{" "}
              {getChoiceText(question, question.correctChoiceId)}
            </p>
            <p>{question.explanation}</p>
          </div>
        )}

        <div className="question-actions">
          <button
            className="secondary-button"
            type="button"
            disabled={currentIndex === 0}
            onClick={() => onMove(-1)}
          >
            Previous
          </button>
          <span className={answer ? "answered-pill" : "unanswered-pill"}>
            {answer ? "Answered" : "Unanswered"}
          </span>
          <button
            className="secondary-button"
            type="button"
            disabled={currentIndex === questionCount - 1}
            onClick={() => onMove(1)}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}

type ResultsViewProps = {
  attempt: Attempt;
  correctCount: number;
  wrongReviews: QuestionReview[];
  onFullMock: () => void;
  onDrillWeakest: (topic: Topic) => void;
  onHome: () => void;
};

function ResultsView({
  attempt,
  correctCount,
  wrongReviews,
  onFullMock,
  onDrillWeakest,
  onHome,
}: ResultsViewProps) {
  return (
    <div className="stack">
      <header className="top-header">
        <div>
          <h1>Results</h1>
          <p>
            {modeLabel(attempt.mode)} · {feedbackModeLabel(attempt.feedbackMode)} ·{" "}
            {formatDuration(attempt.durationSeconds)}
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={onHome}>
          Back home
        </button>
      </header>

      <section className="result-summary">
        <div className="score-card">
          <span>Score</span>
          <strong>
            {attempt.score.correctCount}/{attempt.score.totalCount}
          </strong>
          <span>{attempt.score.percent}%</span>
        </div>
        <div className="score-card">
          <span>Weakest topic</span>
          <strong>
            {attempt.score.weakestTopic ? TOPIC_LABELS[attempt.score.weakestTopic] : "None"}
          </strong>
          <span>{wrongReviews.length} wrong</span>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Topic Breakdown</h2>
          <span>{attempt.score.totalCount} questions</span>
        </div>
        <div className="breakdown-table" role="table" aria-label="Topic breakdown">
          <div className="breakdown-row header" role="row">
            <span>Topic</span>
            <span>Correct</span>
            <span>Total</span>
            <span>Percent</span>
          </div>
          {TOPIC_ORDER.map((topic) => {
            const score = attempt.score.topicBreakdown[topic];
            if (!score) return null;
            return (
              <div className="breakdown-row" key={topic} role="row">
                <span>{TOPIC_LABELS[topic]}</span>
                <span>{score.correct}</span>
                <span>{score.total}</span>
                <span>{score.percent}%</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Suggested Drill</h2>
          <span>
            {attempt.score.weakestTopic ? TOPIC_LABELS[attempt.score.weakestTopic] : "No weak topic"}
          </span>
        </div>
        {attempt.score.weakestTopic ? (
          <button
            className="primary-button"
            type="button"
            onClick={() => onDrillWeakest(attempt.score.weakestTopic!)}
          >
            Drill this topic
          </button>
        ) : (
          <p className="empty-state">Perfect score. Keep the momentum with another mock.</p>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Wrong Answer Review</h2>
          <span>{correctCount} questions answered correctly (not shown)</span>
        </div>

        {wrongReviews.length === 0 ? (
          <p className="empty-state">No wrong answers in this attempt.</p>
        ) : (
          <div className="review-list">
            {wrongReviews.map((review) => (
              <WrongReviewCard key={review.questionId} review={review} />
            ))}
          </div>
        )}
      </section>

      <div className="result-actions">
        <button className="primary-button" type="button" onClick={onFullMock}>
          Start another full mock
        </button>
        {attempt.score.weakestTopic && (
          <button
            className="secondary-button"
            type="button"
            onClick={() => onDrillWeakest(attempt.score.weakestTopic!)}
          >
            Drill weakest topic
          </button>
        )}
        <button className="secondary-button" type="button" onClick={onHome}>
          Back home
        </button>
      </div>
    </div>
  );
}

function WrongReviewCard({ review }: { review: QuestionReview }) {
  const question = QUESTION_BY_ID.get(review.questionId);
  if (!question) return null;

  return (
    <article className={review.confidence === 3 ? "review-card priority" : "review-card"}>
      <div className="review-card-header">
        <span>{TOPIC_LABELS[review.topic]}</span>
        <strong>{confidenceLabel(review.confidence)}</strong>
      </div>
      <h3>{review.prompt}</h3>
      <dl>
        <div>
          <dt>Your answer</dt>
          <dd>
            {review.chosenChoiceId ? `${review.chosenChoiceId}. ` : ""}
            {getChoiceText(question, review.chosenChoiceId)}
          </dd>
        </div>
        <div>
          <dt>Correct answer</dt>
          <dd>
            {review.correctChoiceId}. {getChoiceText(question, review.correctChoiceId)}
          </dd>
        </div>
      </dl>
      <p>{review.explanation}</p>
      <div className="tag-list">
        {review.conceptTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}

function FrameworksView({ onBack }: { onBack: () => void }) {
  const lines = FRAMEWORKS_MARKDOWN.trim().split("\n");

  return (
    <div className="stack">
      <header className="top-header">
        <div>
          <h1>Frameworks</h1>
          <p>Fast PM mental models for assessment practice</p>
        </div>
        <button className="secondary-button" type="button" onClick={onBack}>
          Back home
        </button>
      </header>

      <article className="framework-doc">
        {lines.map((line, index) => {
          if (line.startsWith("# ")) {
            return <h1 key={`${line}-${index}`}>{line.replace("# ", "")}</h1>;
          }
          if (line.startsWith("## ")) {
            return <h2 key={`${line}-${index}`}>{line.replace("## ", "")}</h2>;
          }
          if (line.startsWith("- ")) {
            return <p className="framework-bullet" key={`${line}-${index}`}>{line}</p>;
          }
          if (!line.trim()) return null;
          return <p key={`${line}-${index}`}>{line}</p>;
        })}
      </article>
    </div>
  );
}
