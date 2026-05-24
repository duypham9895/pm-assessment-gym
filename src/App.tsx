import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  RefObject,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FRAMEWORKS_MARKDOWN } from "./frameworks";
import { FULL_MOCK_QUESTION_COUNT, QUESTIONS, TOPIC_LABELS, TOPIC_ORDER } from "./questions";
import {
  buildQuestionReviews,
  getWrongReviewsByPriority,
  scoreQuestions,
  selectFullMockQuestions,
  selectTopicQuestions,
} from "./scoring";
import {
  type AppRoute,
  type ParsedRoute,
  parseRoute,
  pathForRoute,
  titleForRoute,
} from "./routes";
import { CONFIDENCE_SHORTCUTS, getGlobalShortcutAction, SHORTCUT_DEFINITIONS } from "./shortcuts";
import {
  clearActiveSessionSnapshot,
  findAttemptById,
  loadActiveSessionSnapshot,
  loadAttempts,
  loadKeyboardTipDismissed,
  loadShortcutModeEnabled,
  saveActiveSessionSnapshot,
  saveAttempt,
  saveKeyboardTipDismissed,
  saveShortcutModeEnabled,
} from "./storage";
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
type ThemeMode = "light" | "dark";
type RouteNotice = NonNullable<ParsedRoute["message"]>;

const QUESTION_BY_ID = new Map(QUESTIONS.map((question) => [question.id, question]));
const THEME_KEY = "pm-assessment-theme-v1";

function getLatestAttemptId() {
  return loadAttempts()[0]?.id;
}

function parseCurrentRoute() {
  if (typeof window === "undefined") return parseRoute("/");
  return parseRoute(window.location.pathname, { latestAttemptId: getLatestAttemptId() });
}

function findRouteAttempt(route: AppRoute) {
  if (route.kind !== "results") return null;
  return findAttemptById(route.attemptId) ?? null;
}

function getSelectionFromRoute(route: AppRoute): {
  mode: SessionMode;
  feedbackMode: FeedbackMode;
  topic: Topic;
} {
  if (route.kind === "assessment") {
    return {
      mode: route.mode,
      feedbackMode: route.feedbackMode,
      topic: route.topic ?? "product_analytics",
    };
  }

  return {
    mode: "full_mock",
    feedbackMode: "exam",
    topic: "product_analytics",
  };
}

function getViewFromRoute(route: AppRoute, resultAttempt: Attempt | null): View {
  if (route.kind === "frameworks") return "frameworks";
  if (route.kind === "results" && resultAttempt) return "results";
  return "home";
}

function routeForSelection(
  mode: SessionMode,
  feedbackMode: FeedbackMode,
  topic: Topic
): AppRoute {
  if (mode === "full_mock") {
    return { kind: "assessment", mode, feedbackMode };
  }

  return { kind: "assessment", mode, feedbackMode, topic };
}

function locationForPath(path: string, preserveSearch: boolean) {
  if (typeof window === "undefined") return path;
  return `${path}${preserveSearch ? window.location.search : ""}`;
}

function syncBrowserPath(
  canonicalPath: string,
  action: "pushState" | "replaceState",
  preserveSearch = false
) {
  if (typeof window === "undefined") return;

  const nextLocation = locationForPath(canonicalPath, preserveSearch);
  const currentLocation = `${window.location.pathname}${window.location.search}`;
  if (currentLocation === nextLocation) return;

  window.history[action](window.history.state, "", nextLocation);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === "dark" ? "dark" : "light";
}

function timerClassName(remainingSeconds: number) {
  if (remainingSeconds <= 60) return "timer timer--critical";
  if (remainingSeconds <= 5 * 60) return "timer timer--warning";
  return "timer";
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function difficultyLabel(difficulty: Question["difficulty"]) {
  return difficulty[0].toUpperCase() + difficulty.slice(1);
}

function confidenceLabel(confidence?: Confidence) {
  if (confidence === 1) return "1 Guessing";
  if (confidence === 3) return "3 Confident";
  return "2 Unsure";
}

function confidenceName(confidence: Confidence) {
  if (confidence === 1) return "Guessing";
  if (confidence === 3) return "Confident";
  return "Unsure";
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

function isPracticeAnswerLocked(session: TestSession, questionId: string) {
  return session.feedbackMode === "practice" && Boolean(session.answers[questionId]);
}

type RestoredActiveSession = {
  session: TestSession;
  questions: Question[];
  remainingSeconds: number;
  confidenceDrafts: Record<string, Confidence>;
};

function routeMatchesSession(route: AppRoute, session: TestSession) {
  if (route.kind !== "assessment") return false;
  if (route.mode !== session.mode) return false;
  if (route.feedbackMode !== session.feedbackMode) return false;

  if (route.mode === "topic_drill") {
    return route.topic === session.topicFilter;
  }

  return true;
}

function getElapsedSecondsSinceSaved(savedAt: string) {
  const savedTime = new Date(savedAt).getTime();
  if (!Number.isFinite(savedTime)) return 0;
  return Math.max(0, Math.floor((Date.now() - savedTime) / 1000));
}

function getQuestionsForSession(session: TestSession) {
  const questions = session.questionIds
    .map((questionId) => QUESTION_BY_ID.get(questionId))
    .filter((question): question is Question => Boolean(question));

  return questions.length === session.questionIds.length ? questions : null;
}

function getRestoredActiveSession(route: AppRoute): RestoredActiveSession | null {
  if (route.kind !== "assessment") return null;

  const snapshot = loadActiveSessionSnapshot();
  if (!snapshot) return null;
  if (!routeMatchesSession(route, snapshot.session)) return null;

  const questions = getQuestionsForSession(snapshot.session);
  if (!questions) {
    clearActiveSessionSnapshot();
    return null;
  }

  return {
    session: snapshot.session,
    questions,
    remainingSeconds: Math.max(
      0,
      Math.floor(snapshot.remainingSeconds) - getElapsedSecondsSinceSaved(snapshot.savedAt)
    ),
    confidenceDrafts: snapshot.confidenceDrafts,
  };
}

function routeForSession(session: TestSession): AppRoute {
  return routeForSelection(
    session.mode,
    session.feedbackMode,
    session.topicFilter ?? "product_analytics"
  );
}

export default function App() {
  const initialRouteRef = useRef<ParsedRoute | null>(null);
  if (!initialRouteRef.current) {
    initialRouteRef.current = parseCurrentRoute();
  }
  const initialRoute = initialRouteRef.current;
  const initialRouteAttemptRef = useRef<Attempt | null | undefined>(undefined);
  if (initialRouteAttemptRef.current === undefined) {
    initialRouteAttemptRef.current = findRouteAttempt(initialRoute.route);
  }
  const initialRestoredSessionRef = useRef<RestoredActiveSession | null | undefined>(
    undefined
  );
  if (initialRestoredSessionRef.current === undefined) {
    initialRestoredSessionRef.current = getRestoredActiveSession(initialRoute.route);
  }
  const initialRestoredSession = initialRestoredSessionRef.current;
  const initialSelection = getSelectionFromRoute(initialRoute.route);

  const [routeInfo, setRouteInfo] = useState<ParsedRoute>(initialRoute);
  const [view, setView] = useState<View>(() =>
    initialRestoredSession
      ? "test"
      : getViewFromRoute(initialRoute.route, initialRouteAttemptRef.current ?? null)
  );
  const [attempts, setAttempts] = useState<Attempt[]>(() => loadAttempts());
  const [selectedMode, setSelectedMode] = useState<SessionMode>(initialSelection.mode);
  const [selectedFeedbackMode, setSelectedFeedbackMode] = useState<FeedbackMode>(
    initialSelection.feedbackMode
  );
  const [selectedTopic, setSelectedTopic] = useState<Topic>(initialSelection.topic);
  const [session, setSession] = useState<TestSession | null>(
    initialRestoredSession?.session ?? null
  );
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>(
    initialRestoredSession?.questions ?? []
  );
  const [latestAttempt, setLatestAttempt] = useState<Attempt | null>(
    initialRouteAttemptRef.current ?? null
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialRestoredSession?.remainingSeconds ?? 0
  );
  const [confidenceDrafts, setConfidenceDrafts] = useState<Record<string, Confidence>>(
    initialRestoredSession?.confidenceDrafts ?? {}
  );
  const [unansweredWarning, setUnansweredWarning] = useState<number[] | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [keyboardTipDismissed, setKeyboardTipDismissed] = useState(() =>
    loadKeyboardTipDismissed()
  );
  const [shortcutModeEnabled, setShortcutModeEnabled] = useState(() =>
    loadShortcutModeEnabled()
  );
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState(false);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const shortcutHelpOpenerRef = useRef<HTMLElement | null>(null);
  const submittedSessionIds = useRef(new Set<string>());

  const resetActiveSession = useCallback(() => {
    setSession(null);
    setSelectedQuestions([]);
    setRemainingSeconds(0);
    setConfidenceDrafts({});
    setUnansweredWarning(null);
  }, []);

  const applyParsedRoute = useCallback(
    (parsed: ParsedRoute, options?: { keepSession?: boolean }) => {
      setRouteInfo(parsed);
      setAttempts(loadAttempts());

      if (!options?.keepSession) {
        resetActiveSession();
      }

      const selection = getSelectionFromRoute(parsed.route);
      setSelectedMode(selection.mode);
      setSelectedFeedbackMode(selection.feedbackMode);
      setSelectedTopic(selection.topic);

      if (parsed.route.kind === "assessment" && !options?.keepSession) {
        const restoredSession = getRestoredActiveSession(parsed.route);
        if (restoredSession) {
          setSession(restoredSession.session);
          setSelectedQuestions(restoredSession.questions);
          setRemainingSeconds(restoredSession.remainingSeconds);
          setConfidenceDrafts(restoredSession.confidenceDrafts);
          setUnansweredWarning(null);
          setLatestAttempt(null);
          setView("test");
          return;
        }
      }

      if (parsed.route.kind === "frameworks") {
        setLatestAttempt(null);
        setView("frameworks");
        return;
      }

      if (parsed.route.kind === "results") {
        const routeAttempt = findRouteAttempt(parsed.route);
        setLatestAttempt(routeAttempt);
        setView(routeAttempt ? "results" : "home");
        return;
      }

      setLatestAttempt(null);
      setView("home");
    },
    [resetActiveSession]
  );

  const navigateToRoute = useCallback(
    (
      route: AppRoute,
      options?: {
        replace?: boolean;
        keepSession?: boolean;
        preserveSearch?: boolean;
        skipScroll?: boolean;
      }
    ) => {
      const parsed = parseRoute(pathForRoute(route), { latestAttemptId: getLatestAttemptId() });
      syncBrowserPath(
        parsed.canonicalPath,
        options?.replace ? "replaceState" : "pushState",
        options?.preserveSearch ?? false
      );
      applyParsedRoute(parsed, { keepSession: options?.keepSession });

      if (!options?.skipScroll) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [applyParsedRoute]
  );

  const navigateToAssessment = useCallback(
    (
      mode: SessionMode,
      feedbackMode: FeedbackMode,
      topic: Topic,
      options?: { keepSession?: boolean; preserveSearch?: boolean; skipScroll?: boolean }
    ) => {
      navigateToRoute(routeForSelection(mode, feedbackMode, topic), options);
    },
    [navigateToRoute]
  );

  useEffect(() => {
    syncBrowserPath(initialRoute.canonicalPath, "replaceState", true);
  }, [initialRoute.canonicalPath]);

  useEffect(() => {
    document.title = titleForRoute(routeInfo.route);
  }, [routeInfo.route]);

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseCurrentRoute();
      syncBrowserPath(parsed.canonicalPath, "replaceState", true);
      applyParsedRoute(parsed);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [applyParsedRoute]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    saveShortcutModeEnabled(shortcutModeEnabled);
  }, [shortcutModeEnabled]);

  const dismissKeyboardTip = useCallback(() => {
    setKeyboardTipDismissed(true);
    saveKeyboardTipDismissed(true);
  }, []);

  const openShortcuts = useCallback(() => {
    shortcutHelpOpenerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setIsShortcutHelpOpen(true);
  }, []);

  const closeShortcuts = useCallback(() => {
    setIsShortcutHelpOpen(false);
    window.setTimeout(() => {
      const opener = shortcutHelpOpenerRef.current;
      if (opener?.isConnected) {
        opener.focus();
      }
      shortcutHelpOpenerRef.current = null;
    }, 0);
  }, []);

  const currentQuestion = session
    ? selectedQuestions[session.currentQuestionIndex]
    : undefined;
  const currentAnswer =
    session && currentQuestion ? session.answers[currentQuestion.id] : undefined;
  const answeredCount = session
    ? selectedQuestions.filter((question) => session.answers[question.id]).length
    : 0;
  const topicQuestionCounts = useMemo(
    () =>
      TOPIC_ORDER.reduce(
        (counts, topic) => ({
          ...counts,
          [topic]: QUESTIONS.filter((question) => question.topic === topic).length,
        }),
        {} as Record<Topic, number>
      ),
    []
  );

  const startSession = useCallback(
    (overrides?: {
      mode?: SessionMode;
      feedbackMode?: FeedbackMode;
      topic?: Topic;
    }) => {
      const nextMode = overrides?.mode ?? selectedMode;
      const nextFeedbackMode = overrides?.feedbackMode ?? selectedFeedbackMode;
      const nextTopic = overrides?.topic ?? selectedTopic;
      const recentQuestionIds = new Set(
        attempts.slice(0, 3).flatMap((attempt) => attempt.questionIds)
      );
      const nextQuestions =
        nextMode === "full_mock"
          ? selectFullMockQuestions(QUESTIONS, { recentQuestionIds })
          : selectTopicQuestions(QUESTIONS, nextTopic);

      if (nextQuestions.length === 0) {
        window.alert("No questions are available for this mode yet.");
        return;
      }

      navigateToAssessment(nextMode, nextFeedbackMode, nextTopic, {
        keepSession: true,
        preserveSearch: true,
        skipScroll: true,
      });

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
    [attempts, navigateToAssessment, selectedFeedbackMode, selectedMode, selectedTopic]
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
      clearActiveSessionSnapshot();

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
      navigateToRoute({ kind: "results", attemptId: attempt.id }, { skipScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigateToRoute, remainingSeconds, selectedQuestions, session]
  );

  const selectChoice = useCallback(
    (choiceId: ChoiceId) => {
      setSession((previous) => {
        if (!previous) return previous;
        const questionId = previous.questionIds[previous.currentQuestionIndex];
        const previousAnswer = previous.answers[questionId];
        if (isPracticeAnswerLocked(previous, questionId)) return previous;

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
      if (isPracticeAnswerLocked(session, activeQuestionId)) return;

      setConfidenceDrafts((drafts) => ({ ...drafts, [activeQuestionId]: confidence }));

      setSession((previous) => {
        if (!previous) return previous;
        const questionId = previous.questionIds[previous.currentQuestionIndex];
        const previousAnswer = previous.answers[questionId];
        if (!previousAnswer) return previous;
        if (isPracticeAnswerLocked(previous, questionId)) return previous;

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

  const jumpToQuestion = useCallback((index: number) => {
    setSession((previous) => {
      if (!previous) return previous;
      if (index < 0 || index >= previous.questionIds.length) return previous;
      return { ...previous, currentQuestionIndex: index };
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const jumpToNextUnanswered = useCallback(() => {
    if (!session) return;
    const total = session.questionIds.length;
    for (let offset = 1; offset <= total; offset += 1) {
      const index = (session.currentQuestionIndex + offset) % total;
      const questionId = session.questionIds[index];
      if (!session.answers[questionId]) {
        jumpToQuestion(index);
        return;
      }
    }
  }, [jumpToQuestion, session]);

  useEffect(() => {
    if (view !== "test" || !session) return;

    const interval = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [session?.id, view]);

  useEffect(() => {
    if (view !== "test" || !session) return;

    saveActiveSessionSnapshot({
      version: 1,
      routePath: pathForRoute(routeForSession(session)),
      savedAt: new Date().toISOString(),
      remainingSeconds,
      confidenceDrafts,
      session,
    });
  }, [confidenceDrafts, remainingSeconds, session, view]);

  useEffect(() => {
    if (view === "test" && session && remainingSeconds === 0) {
      submitSession({ skipUnansweredWarning: true });
    }
  }, [remainingSeconds, session, submitSession, view]);

  useEffect(() => {
    if (view !== "test" || !session) return;
    questionHeadingRef.current?.focus({ preventScroll: true });
  }, [session?.currentQuestionIndex, view]);

  useEffect(() => {
    if (view !== "test" || !session) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const action = getGlobalShortcutAction(event, { shortcutModeEnabled });
      if (!action) return;

      if (action.type === "confidence") {
        const questionId = session.questionIds[session.currentQuestionIndex];
        if (isPracticeAnswerLocked(session, questionId)) return;
      }

      if (action.type !== "openHelp") {
        event.preventDefault();
      }

      if (action.type === "answer") {
        selectChoice(action.choiceId);
      } else if (action.type === "confidence") {
        setCurrentConfidence(action.confidence);
      } else if (action.type === "previousQuestion") {
        moveQuestion(-1);
      } else if (action.type === "nextQuestion") {
        moveQuestion(1);
      } else if (action.type === "nextUnanswered") {
        jumpToNextUnanswered();
      } else if (action.type === "openHelp") {
        openShortcuts();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    jumpToNextUnanswered,
    moveQuestion,
    openShortcuts,
    selectChoice,
    session,
    setCurrentConfidence,
    shortcutModeEnabled,
    view,
  ]);

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

  const routeNotice: RouteNotice | undefined =
    view === "home" && routeInfo.route.kind === "results" && !latestAttempt
      ? "missing_result"
      : routeInfo.message;
  const themeToggle = <ThemeToggle theme={theme} onCycle={cycleTheme} />;

  return (
    <main className="app-shell">
      {view === "home" && routeNotice && (
        <RouteNotice notice={routeNotice} onHome={() => navigateToRoute({ kind: "home" })} />
      )}

      {view === "home" && (
        <HomeView
          attempts={attempts}
          selectedMode={selectedMode}
          selectedFeedbackMode={selectedFeedbackMode}
          selectedTopic={selectedTopic}
          questionBankTotal={QUESTIONS.length}
          topicQuestionCounts={topicQuestionCounts}
          themeToggle={themeToggle}
          onModeChange={(mode) =>
            navigateToAssessment(mode, selectedFeedbackMode, selectedTopic)
          }
          onFeedbackModeChange={(feedbackMode) =>
            navigateToAssessment(selectedMode, feedbackMode, selectedTopic)
          }
          onTopicChange={(topic) =>
            navigateToAssessment(selectedMode, selectedFeedbackMode, topic)
          }
          onStart={() => startSession()}
          onBaselineMock={() => startSession({ mode: "full_mock", feedbackMode: "exam" })}
          onWeakTopicDrill={(topic) =>
            startSession({ mode: "topic_drill", feedbackMode: "practice", topic })
          }
          onFrameworks={() => navigateToRoute({ kind: "frameworks" })}
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
          isAnswerLocked={
            currentQuestion ? isPracticeAnswerLocked(session, currentQuestion.id) : false
          }
          keyboardTipDismissed={keyboardTipDismissed}
          question={currentQuestion}
          questions={selectedQuestions}
          questionCount={selectedQuestions.length}
          remainingSeconds={remainingSeconds}
          session={session}
          shortcutModeEnabled={shortcutModeEnabled}
          unansweredWarning={unansweredWarning}
          onAnswer={selectChoice}
          onConfidence={setCurrentConfidence}
          onDismissKeyboardTip={dismissKeyboardTip}
          onDismissSubmitWarning={() => setUnansweredWarning(null)}
          onJump={jumpToQuestion}
          onJumpNextUnanswered={jumpToNextUnanswered}
          onMove={moveQuestion}
          onOpenShortcuts={openShortcuts}
          questionHeadingRef={questionHeadingRef}
          onSubmit={() => submitSession()}
          onSubmitAnyway={() => submitSession({ skipUnansweredWarning: true })}
        />
      )}

      {view === "results" && latestAttempt && (
        <ResultsView
          attempt={latestAttempt}
          correctCount={resultData.correctCount}
          wrongReviews={resultData.wrongReviews}
          themeToggle={themeToggle}
          onFullMock={() => startSession({ mode: "full_mock", feedbackMode: "exam" })}
          onDrillWeakest={(topic) =>
            startSession({ mode: "topic_drill", feedbackMode: "practice", topic })
          }
          onFrameworks={() => navigateToRoute({ kind: "frameworks" })}
          onHome={() => navigateToRoute({ kind: "home" })}
        />
      )}

      {view === "frameworks" && (
        <FrameworksView
          themeToggle={themeToggle}
          onBack={() => navigateToRoute({ kind: "home" })}
        />
      )}

      {isShortcutHelpOpen && (
        <ShortcutsHelpOverlay
          shortcutModeEnabled={shortcutModeEnabled}
          onShortcutModeChange={setShortcutModeEnabled}
          onClose={closeShortcuts}
        />
      )}
    </main>
  );
}

const FOCUSABLE_SELECTOR =
  "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.getAttribute("hidden") === null
  );
}

function ModalOverlay({
  children,
  className = "",
  dialogRef,
  labelledBy,
  onClose,
  onKeyDown,
}: {
  children: ReactNode;
  className?: string;
  dialogRef: RefObject<HTMLDivElement | null>;
  labelledBy: string;
  onClose: () => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
}) {
  useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };

    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown);
  }, [onClose]);

  const handleOverlayClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} onKeyDown={onKeyDown}>
      <div
        className={`modal-dialog ${className}`.trim()}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </div>
  );
}

function RouteNotice({ notice, onHome }: { notice: RouteNotice; onHome: () => void }) {
  const isMissingResult = notice === "missing_result";
  const message = isMissingResult
    ? "That result is not available on this device. Results are stored locally."
    : "That link is not available. Choose a practice mode to continue.";

  return (
    <section className="panel route-notice" role="status" aria-live="polite">
      <div>
        <strong>{isMissingResult ? "Result unavailable" : "Link unavailable"}</strong>
        <p>{message}</p>
      </div>
      <button className="secondary-button compact-button" type="button" onClick={onHome}>
        {isMissingResult ? "Back home" : "Choose practice mode"}
      </button>
    </section>
  );
}

function ShortcutsHelpOverlay({
  shortcutModeEnabled,
  onShortcutModeChange,
  onClose,
}: {
  shortcutModeEnabled: boolean;
  onShortcutModeChange: (enabled: boolean) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const groups = useMemo(() => {
    return SHORTCUT_DEFINITIONS.reduce(
      (result, shortcut) => {
        const existing = result.find((group) => group.name === shortcut.group);
        if (existing) {
          existing.shortcuts.push(shortcut);
        } else {
          result.push({ name: shortcut.group, shortcuts: [shortcut] });
        }
        return result;
      },
      [] as Array<{ name: string; shortcuts: Array<(typeof SHORTCUT_DEFINITIONS)[number]> }>
    );
  }, []);

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
  }, []);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = getFocusableElements(dialog);
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <ModalOverlay
      className="shortcut-dialog"
      dialogRef={dialogRef}
      labelledBy="shortcut-dialog-title"
      onClose={onClose}
      onKeyDown={handleKeyDown}
    >
      <div className="shortcut-dialog-header">
        <div>
          <h2 id="shortcut-dialog-title">Keyboard shortcuts</h2>
          <p>Control printable shortcuts without turning off arrow-key navigation.</p>
        </div>
      </div>

      <div className="shortcut-setting">
        <span className="control-label">Keyboard shortcuts</span>
        <div className="segmented-control" aria-label="Keyboard shortcuts">
          <button
            type="button"
            className={shortcutModeEnabled ? "active" : ""}
            aria-pressed={shortcutModeEnabled}
            onClick={() => onShortcutModeChange(true)}
          >
            On
          </button>
          <button
            type="button"
            className={!shortcutModeEnabled ? "active" : ""}
            aria-pressed={!shortcutModeEnabled}
            onClick={() => onShortcutModeChange(false)}
          >
            Off
          </button>
        </div>
      </div>

      <div className="shortcut-groups">
        {groups.map((group) => (
          <section className="shortcut-group" key={group.name}>
            <h3>{group.name}</h3>
            <dl>
              {group.shortcuts.map((shortcut) => (
                <div key={shortcut.id}>
                  <dt>
                    <kbd>{shortcut.keys}</kbd>
                    <span>{shortcut.label}</span>
                  </dt>
                  <dd>{shortcut.description}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <div className="shortcut-dialog-actions">
        <button
          className="utility-button compact-button"
          type="button"
          ref={closeButtonRef}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </ModalOverlay>
  );
}

function ThemeToggle({ theme, onCycle }: { theme: ThemeMode; onCycle: () => void }) {
  const label = theme === "light" ? "Light theme" : "Dark theme";
  const next = theme === "light" ? "dark" : "light";
  return (
    <button
      type="button"
      className="utility-button"
      onClick={onCycle}
      aria-label={`${label}. Switch to ${next} theme.`}
      title={`${label} — click for ${next}`}
    >
      <span>Theme: {theme === "light" ? "Light" : "Dark"}</span>
    </button>
  );
}

type HomeViewProps = {
  attempts: Attempt[];
  selectedMode: SessionMode;
  selectedFeedbackMode: FeedbackMode;
  selectedTopic: Topic;
  questionBankTotal: number;
  topicQuestionCounts: Record<Topic, number>;
  themeToggle: ReactNode;
  onModeChange: (mode: SessionMode) => void;
  onFeedbackModeChange: (mode: FeedbackMode) => void;
  onTopicChange: (topic: Topic) => void;
  onStart: () => void;
  onBaselineMock: () => void;
  onWeakTopicDrill: (topic: Topic) => void;
  onFrameworks: () => void;
};

function HomeView({
  attempts,
  selectedMode,
  selectedFeedbackMode,
  selectedTopic,
  questionBankTotal,
  topicQuestionCounts,
  themeToggle,
  onModeChange,
  onFeedbackModeChange,
  onTopicChange,
  onStart,
  onBaselineMock,
  onWeakTopicDrill,
  onFrameworks,
}: HomeViewProps) {
  const latestAttempt = attempts[0];
  const latestWeakTopic = latestAttempt?.score.weakestTopic;
  const selectedSessionCopy =
    selectedMode === "full_mock"
      ? `${FULL_MOCK_QUESTION_COUNT} mixed questions, 30 minutes, best for a readiness baseline.`
      : `10 focused ${TOPIC_LABELS[selectedTopic]} questions with a per-question pace target.`;
  const feedbackCopy =
    selectedFeedbackMode === "exam"
      ? "Exam feedback waits until submit, so the session feels closer to the real assessment."
      : "Practice feedback explains each answer immediately, so it is better for learning loops.";

  return (
    <div className="stack">
      <header className="top-header">
        <div>
          <h1>PM Assessment Gym</h1>
          <p>Timed drills, weak-topic review, and framework refresh for PM assessments</p>
        </div>
        <div className="header-actions">
          {themeToggle}
          <button className="secondary-button" type="button" onClick={onFrameworks}>
            Frameworks
          </button>
        </div>
      </header>

      <section className="panel start-panel">
        <div className="start-panel-grid">
          <div className="start-controls">
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

            <div className="session-summary" aria-label="Selected session summary">
              <div>
                <strong>{modeLabel(selectedMode)}</strong>
                <span>{selectedSessionCopy}</span>
              </div>
              <div>
                <strong>{feedbackModeLabel(selectedFeedbackMode)}</strong>
                <span>{feedbackCopy}</span>
              </div>
            </div>

            {selectedMode === "full_mock" && (
              <div className="mock-rationale" aria-label="Why the full mock uses 21 questions">
                <strong>Why 21?</strong>
                <span>
                  It is the smallest clean six-skill mix: 4/3/4/3/4/3. Twenty questions
                  underweights one skill, while 30 turns this into a longer endurance mock.
                  Twenty-one keeps the 30-minute baseline focused at about 85 seconds per
                  question.
                </span>
              </div>
            )}

            <button className="primary-button start-button" type="button" onClick={onStart}>
              Start {selectedMode === "full_mock" ? "full mock" : "topic drill"}
            </button>
          </div>

          <aside className="next-action" aria-label="Recommended next action">
            <span className="control-label">Next best action</span>
            {latestWeakTopic ? (
              <>
                <h2>Repair {TOPIC_LABELS[latestWeakTopic]}</h2>
                <p>
                  Your latest {modeLabel(latestAttempt.mode).toLowerCase()} scored{" "}
                  {latestAttempt.score.percent}%. Drill the weakest topic while the mistakes are
                  still fresh.
                </p>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => onWeakTopicDrill(latestWeakTopic)}
                >
                  Start practice drill
                </button>
              </>
            ) : attempts.length > 0 ? (
              <>
                <h2>Validate with pressure</h2>
                <p>
                  No weak topic is standing out from the latest attempt. Run another exam-style
                  mock to check consistency.
                </p>
                <button className="primary-button" type="button" onClick={onBaselineMock}>
                  Start exam mock
                </button>
              </>
            ) : (
              <>
                <h2>Set your baseline</h2>
                <p>
                  Start with a full mock in Exam mode. The result will tell you which topic to
                  drill first.
                </p>
                <button className="primary-button" type="button" onClick={onBaselineMock}>
                  Start baseline mock
                </button>
              </>
            )}
            <button className="secondary-button" type="button" onClick={onFrameworks}>
              Refresh frameworks
            </button>
          </aside>
        </div>

        <div className="bank-strip" aria-label="Question bank coverage">
          <div>
            <strong>{questionBankTotal}</strong>
            <span>original questions</span>
          </div>
          <div>
            <strong>{Math.min(...Object.values(topicQuestionCounts))}</strong>
            <span>per topic</span>
          </div>
          <div>
            <strong>{selectedMode === "full_mock" ? FULL_MOCK_QUESTION_COUNT : "10"}</strong>
            <span>{selectedMode === "full_mock" ? "mock length" : "drill cap"}</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Latest Attempts</h2>
          <span>
            {attempts.length ? `${Math.min(attempts.length, 3)} most recent` : "No history yet"}
          </span>
        </div>

        {attempts.length === 0 ? (
          <p className="empty-state">
            <strong>No attempts yet.</strong>
            Start with a Full Mock in Exam mode to set your baseline. After submitting, the
            weakest topic surfaces here so you know what to drill next.
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
                <div className="attempt-action">
                  {attempt.score.weakestTopic ? (
                    <button
                      className="secondary-button compact-button"
                      type="button"
                      onClick={() => onWeakTopicDrill(attempt.score.weakestTopic!)}
                    >
                      Drill
                    </button>
                  ) : (
                    <button
                      className="secondary-button compact-button"
                      type="button"
                      onClick={onBaselineMock}
                    >
                      Mock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel coverage-panel">
        <div className="section-heading">
          <h2>Practice Coverage</h2>
          <span>Balanced across the PM assessment skills</span>
        </div>
        <div className="coverage-grid">
          {TOPIC_ORDER.map((topic) => (
            <div className="coverage-chip" key={topic}>
              <strong>{topicQuestionCounts[topic]}</strong>
              <span>{TOPIC_LABELS[topic]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel scoring-guide">
        <div className="section-heading">
          <h2>How Scoring Works</h2>
          <span>Score and confidence measure different things</span>
        </div>
        <div className="scoring-guide-grid">
          <div>
            <strong>Score</strong>
            <p>
              Your score is the number of correct answers divided by the total questions.
              Unanswered questions count as incorrect.
            </p>
          </div>
          <div>
            <strong>Confidence</strong>
            <p>
              Confidence does not change the score. Confident misses rise to the top because
              they are the easiest mistakes to repeat.
            </p>
          </div>
          <div>
            <strong>Topic weakness</strong>
            <p>
              The weakest topic is the area with the most wrong answers, using percentage
              and question count as tie breakers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

type TestViewProps = {
  answer: { choiceId: ChoiceId; confidence: Confidence } | undefined;
  answeredCount: number;
  currentConfidence: Confidence;
  currentIndex: number;
  isAnswerLocked: boolean;
  keyboardTipDismissed: boolean;
  question: Question;
  questions: Question[];
  questionCount: number;
  remainingSeconds: number;
  session: TestSession;
  shortcutModeEnabled: boolean;
  unansweredWarning: number[] | null;
  onAnswer: (choiceId: ChoiceId) => void;
  onConfidence: (confidence: Confidence) => void;
  onDismissKeyboardTip: () => void;
  onDismissSubmitWarning: () => void;
  onJump: (index: number) => void;
  onJumpNextUnanswered: () => void;
  onMove: (direction: -1 | 1) => void;
  onOpenShortcuts: () => void;
  questionHeadingRef: RefObject<HTMLHeadingElement | null>;
  onSubmit: () => void;
  onSubmitAnyway: () => void;
};

function TestView({
  answer,
  answeredCount,
  currentConfidence,
  currentIndex,
  isAnswerLocked,
  keyboardTipDismissed,
  question,
  questions,
  questionCount,
  remainingSeconds,
  session,
  shortcutModeEnabled,
  unansweredWarning,
  onAnswer,
  onConfidence,
  onDismissKeyboardTip,
  onDismissSubmitWarning,
  onJump,
  onJumpNextUnanswered,
  onMove,
  onOpenShortcuts,
  questionHeadingRef,
  onSubmit,
  onSubmitAnyway,
}: TestViewProps) {
  const answerButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const confidenceButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isPracticeFeedbackVisible = session.feedbackMode === "practice" && Boolean(answer);
  const isCorrect = answer?.choiceId === question.correctChoiceId;
  const progressPercent = questionCount > 0 ? Math.round((answeredCount / questionCount) * 100) : 0;
  const hasUnanswered = answeredCount < questionCount;

  const focusAdjacentButton = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    refs: Array<HTMLButtonElement | null>,
    direction: -1 | 1
  ) => {
    const availableButtons = refs.filter(
      (button): button is HTMLButtonElement => button !== null && !button.disabled
    );
    if (availableButtons.length === 0) return;

    event.preventDefault();
    event.stopPropagation();

    const currentIndex = availableButtons.findIndex((button) => button === document.activeElement);
    const nextIndex =
      currentIndex === -1
        ? direction === 1
          ? 0
          : availableButtons.length - 1
        : Math.min(Math.max(currentIndex + direction, 0), availableButtons.length - 1);

    availableButtons[nextIndex]?.focus();
  };

  const handleAnswerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      focusAdjacentButton(event, answerButtonRefs.current, 1);
    } else if (event.key === "ArrowUp") {
      focusAdjacentButton(event, answerButtonRefs.current, -1);
    }
  };

  const handleConfidenceKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      focusAdjacentButton(event, confidenceButtonRefs.current, 1);
    } else if (event.key === "ArrowLeft") {
      focusAdjacentButton(event, confidenceButtonRefs.current, -1);
    }
  };

  return (
    <div className="test-layout">
      <header className="test-bar">
        <div>
          <strong>
            {modeLabel(session.mode)} · {feedbackModeLabel(session.feedbackMode)}
          </strong>
          <span>{answeredCount}/{questionCount} answered · {progressPercent}%</span>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div
          className={timerClassName(remainingSeconds)}
          role="timer"
          aria-live="off"
          aria-label={`Time remaining ${formatTimer(remainingSeconds)}`}
        >
          {formatTimer(remainingSeconds)}
        </div>
        <button className="primary-button" type="button" onClick={onSubmit}>
          Submit
        </button>
      </header>

      <nav
        className="question-navigator"
        role="tablist"
        aria-label="Jump to question"
      >
        {questions.map((q, index) => {
          const isAnswered = Boolean(session.answers[q.id]);
          const isCurrent = index === currentIndex;
          const state = isCurrent ? "current" : isAnswered ? "answered" : "unanswered";
          return (
            <button
              className={`nav-pill nav-pill--${state}`}
              key={q.id}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              aria-label={`Question ${index + 1}, ${state}`}
              onClick={() => onJump(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </nav>

      {unansweredWarning && (
        <section className="submit-warning" role="alert">
          <div>
            <strong>{unansweredWarning.length} unanswered</strong>
            <p>Q{unansweredWarning.join(", Q")}</p>
          </div>
          <div>
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                onDismissSubmitWarning();
                onJumpNextUnanswered();
              }}
            >
              Go to first unanswered
            </button>
            <button className="secondary-button" type="button" onClick={onDismissSubmitWarning}>
              Stay here
            </button>
            <button className="secondary-button" type="button" onClick={onSubmitAnyway}>
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
          <span>{difficultyLabel(question.difficulty)}</span>
          <span aria-label="Estimated time">{question.estimatedSeconds}s target</span>
        </div>
        <h1 ref={questionHeadingRef} tabIndex={-1}>
          {question.prompt}
        </h1>

        <div className="choices" aria-label="Answer choices" onKeyDown={handleAnswerKeyDown}>
          {question.choices.map((choice, index) => {
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
                ref={(button) => {
                  answerButtonRefs.current[index] = button;
                }}
                type="button"
                aria-label={
                  shortcutModeEnabled
                    ? `Choice ${choice.id}. Select answer ${choice.id}. Keyboard shortcut ${
                        index + 1
                      }. ${choice.text}`
                    : `Choice ${choice.id}: ${choice.text}`
                }
                disabled={isAnswerLocked}
                onClick={() => onAnswer(choice.id)}
              >
                <span className="choice-letter">
                  {choice.id}
                  {shortcutModeEnabled && <small aria-hidden="true">{index + 1}</small>}
                </span>
                <span>{choice.text}</span>
              </button>
            );
          })}
        </div>

        {isPracticeFeedbackVisible && (
          <div
            className={isCorrect ? "feedback correct-feedback" : "feedback wrong-feedback"}
            aria-live="polite"
          >
            <strong>{isCorrect ? "Correct" : "Incorrect"}</strong>
            <p>
              Correct answer: {question.correctChoiceId}.{" "}
              {getChoiceText(question, question.correctChoiceId)}
            </p>
            <p>{question.explanation}</p>
          </div>
        )}

        {keyboardTipDismissed || !shortcutModeEnabled ? (
          <button
            className="shortcut-reminder"
            type="button"
            onClick={onOpenShortcuts}
            aria-label="Show keyboard shortcuts."
          >
            Shortcuts
          </button>
        ) : (
          <div className="keyboard-tip">
            <p>
              Use 1-5 to answer, Shift+1-3 for confidence, and arrows to move between
              questions.
            </p>
            <button
              type="button"
              className="secondary-button compact-button"
              onClick={onDismissKeyboardTip}
            >
              Got it
            </button>
            <button
              type="button"
              className="utility-button compact-button"
              onClick={onOpenShortcuts}
              aria-label="Show keyboard shortcuts."
            >
              Shortcuts
            </button>
          </div>
        )}

        <div className="confidence-block">
          <span className="control-label">Confidence</span>
          <div
            className="confidence-options"
            aria-label="Confidence rating"
            onKeyDown={handleConfidenceKeyDown}
          >
            {([1, 2, 3] as Confidence[]).map((confidence, index) => {
              const shortcut = CONFIDENCE_SHORTCUTS.find(
                (definition) => definition.confidence === confidence
              );
              const label = confidenceName(confidence);
              return (
                <button
                  className={currentConfidence === confidence ? "active" : ""}
                  key={confidence}
                  ref={(button) => {
                    confidenceButtonRefs.current[index] = button;
                  }}
                  type="button"
                  aria-label={
                    shortcutModeEnabled
                      ? `Set confidence to ${label}. Keyboard shortcut ${shortcut?.ariaKeys}.`
                      : `Set confidence to ${label}.`
                  }
                  aria-pressed={currentConfidence === confidence}
                  disabled={isAnswerLocked}
                  onClick={() => onConfidence(confidence)}
                >
                  <span>{confidenceLabel(confidence)}</span>
                  {shortcutModeEnabled && shortcut && (
                    <span className="shortcut-badge" aria-hidden="true">
                      {shortcut.keys}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="question-actions">
          <button
            className="secondary-button"
            type="button"
            disabled={currentIndex === 0}
            onClick={() => onMove(-1)}
            aria-label="Go to previous question. Keyboard shortcut Left Arrow."
            title="Go to previous question. Keyboard shortcut Left Arrow."
          >
            <span>Previous</span>
            <span className="shortcut-badge shortcut-badge--navigation" aria-hidden="true">
              ←
            </span>
          </button>
          {hasUnanswered ? (
            <button
              className="secondary-button"
              type="button"
              onClick={onJumpNextUnanswered}
              aria-label="Jump to next unanswered question. Keyboard shortcut Shift Right Arrow."
              title="Jump to next unanswered question. Keyboard shortcut Shift Right Arrow."
            >
              <span>Next unanswered</span>
              <span className="shortcut-badge shortcut-badge--navigation" aria-hidden="true">
                Shift+→
              </span>
            </button>
          ) : (
            <span className="answered-pill">All answered</span>
          )}
          <button
            className="secondary-button"
            type="button"
            disabled={currentIndex === questionCount - 1}
            onClick={() => onMove(1)}
            aria-label="Go to next question. Keyboard shortcut Right Arrow."
            title="Go to next question. Keyboard shortcut Right Arrow."
          >
            <span>Next</span>
            <span className="shortcut-badge shortcut-badge--navigation" aria-hidden="true">
              →
            </span>
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
  themeToggle: ReactNode;
  onFullMock: () => void;
  onDrillWeakest: (topic: Topic) => void;
  onFrameworks: () => void;
  onHome: () => void;
};

function ResultsView({
  attempt,
  correctCount,
  wrongReviews,
  themeToggle,
  onFullMock,
  onDrillWeakest,
  onFrameworks,
  onHome,
}: ResultsViewProps) {
  const weakestTopic = attempt.score.weakestTopic;
  const falseConfidenceCount = wrongReviews.filter((review) => review.confidence === 3).length;
  const unansweredCount = wrongReviews.filter((review) => !review.chosenChoiceId).length;

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
        <div className="header-actions">
          {themeToggle}
          <button className="secondary-button" type="button" onClick={onHome}>
            Back home
          </button>
        </div>
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

      <section className="panel next-plan-panel">
        <div className="section-heading">
          <h2>Next Practice Plan</h2>
          <span>{wrongReviews.length ? "Review first, then drill" : "Protect the baseline"}</span>
        </div>
        <div className="next-plan-list">
          <div className="next-plan-item">
            <span>1</span>
            <div>
              <strong>
                {weakestTopic ? `Drill ${TOPIC_LABELS[weakestTopic]}` : "Run another exam mock"}
              </strong>
              <p>
                {weakestTopic
                  ? "Use Practice mode for one focused set before returning to a timed mock."
                  : "No weak topic stood out. Re-test under pressure to make sure the score holds."}
              </p>
            </div>
            {weakestTopic ? (
              <button
                className="primary-button compact-button"
                type="button"
                onClick={() => onDrillWeakest(weakestTopic)}
              >
                Start drill
              </button>
            ) : (
              <button className="primary-button compact-button" type="button" onClick={onFullMock}>
                Start mock
              </button>
            )}
          </div>

          <div className="next-plan-item">
            <span>2</span>
            <div>
              <strong>
                {falseConfidenceCount
                  ? `Fix ${falseConfidenceCount} confident miss${
                      falseConfidenceCount === 1 ? "" : "es"
                    }`
                  : "Review misses by risk"}
              </strong>
              <p>
                {falseConfidenceCount
                  ? "Confident wrong answers are the easiest mistakes to repeat, so they stay first in review."
                  : wrongReviews.length
                    ? "Wrong answers are already sorted by confidence so the riskiest mistakes come first."
                    : "No mistakes to review in this attempt."}
              </p>
            </div>
            <span className="plan-metric">
              {unansweredCount ? `${unansweredCount} unanswered` : `${wrongReviews.length} wrong`}
            </span>
          </div>

          <div className="next-plan-item">
            <span>3</span>
            <div>
              <strong>Refresh one framework</strong>
              <p>Skim the relevant checklist before the next timed session.</p>
            </div>
            <button className="secondary-button compact-button" type="button" onClick={onFrameworks}>
              Frameworks
            </button>
          </div>
        </div>
      </section>

      <section className="panel scoring-guide scoring-guide--compact">
        <div className="section-heading">
          <h2>How This Score Was Calculated</h2>
          <span>Confidence is used for review priority</span>
        </div>
        <p>
          Score = correct answers / total questions. Confidence does not change the percentage;
          confident misses appear first because they are the highest learning risk.
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Topic Breakdown</h2>
          <span>{attempt.score.totalCount} questions</span>
        </div>
        <div className="breakdown-table" role="table" aria-label="Topic breakdown">
          <div className="breakdown-row header" role="row">
            <span>Topic</span>
            <span>
              <span className="breakdown-label-full">Correct</span>
              <span className="breakdown-label-short">OK</span>
            </span>
            <span>
              <span className="breakdown-label-full">Total</span>
              <span className="breakdown-label-short">All</span>
            </span>
            <span>
              <span className="breakdown-label-full">Percent</span>
              <span className="breakdown-label-short">%</span>
            </span>
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
          <h2>Mistakes To Fix</h2>
          <span>{correctCount} questions answered correctly (not shown)</span>
        </div>

        {wrongReviews.length === 0 ? (
          <p className="empty-state">
            No wrong answers in this attempt. Run another mock or refresh frameworks to keep the
            recall sharp.
          </p>
        ) : (
          <div className="review-list">
            {wrongReviews.map((review) => (
              <WrongReviewCard key={review.questionId} review={review} />
            ))}
          </div>
        )}
      </section>

      <div className="result-actions">
        {weakestTopic ? (
          <button
            className="primary-button"
            type="button"
            onClick={() => onDrillWeakest(weakestTopic)}
          >
            Drill weakest topic
          </button>
        ) : (
          <button className="primary-button" type="button" onClick={onFullMock}>
            Start another full mock
          </button>
        )}
        {weakestTopic && (
          <button className="secondary-button" type="button" onClick={onFullMock}>
            Start another full mock
          </button>
        )}
        <button className="secondary-button" type="button" onClick={onFrameworks}>
          Refresh frameworks
        </button>
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

function FrameworksView({
  themeToggle,
  onBack,
}: {
  themeToggle: ReactNode;
  onBack: () => void;
}) {
  const lines = FRAMEWORKS_MARKDOWN.trim().split("\n");
  const sections = lines
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const title = line.replace("## ", "").trim();
      return { title, slug: slugify(title) };
    });

  return (
    <div className="stack">
      <header className="top-header">
        <div>
          <h1>Frameworks</h1>
          <p>Fast PM mental models for assessment practice</p>
        </div>
        <div className="header-actions">
          {themeToggle}
          <button className="secondary-button" type="button" onClick={onBack}>
            Back home
          </button>
        </div>
      </header>

      <div className="framework-layout">
        <aside className="framework-toc" aria-label="Framework sections">
          <strong>Jump to</strong>
          {sections.map((section) => (
            <a key={section.slug} href={`#${section.slug}`}>
              {section.title}
            </a>
          ))}
        </aside>

        <article className="framework-doc">
          {lines.map((line, index) => {
            if (line.startsWith("# ")) {
              return <h1 key={`${line}-${index}`}>{line.replace("# ", "")}</h1>;
            }
            if (line.startsWith("## ")) {
              const title = line.replace("## ", "").trim();
              return (
                <h2 id={slugify(title)} key={`${line}-${index}`}>
                  {title}
                </h2>
              );
            }
            if (line.startsWith("- ")) {
              return (
                <p className="framework-bullet" key={`${line}-${index}`}>
                  {line.replace(/^-\s+/, "")}
                </p>
              );
            }
            if (!line.trim()) return null;
            return <p key={`${line}-${index}`}>{line}</p>;
          })}
        </article>
      </div>
    </div>
  );
}
