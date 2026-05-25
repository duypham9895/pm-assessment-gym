import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { FULL_MOCK_QUESTION_COUNT, QUESTIONS, TOPIC_ORDER } from "./questions";
import { topicToSlug } from "./routes";
import { scoreQuestions } from "./scoring";
import {
  buildShareReviewPacket,
  renderShareReviewMarkdown,
  type ShareCandidateContext,
} from "./shareReport";
import { saveActiveSessionSnapshot, saveAttempt } from "./storage";
import type {
  ActiveSessionSnapshot,
  AnswerRecord,
  Attempt,
  FeedbackMode,
  Question,
  QuestionTimingMap,
  Topic,
} from "./types";

function getVisibleQuestion() {
  const heading = screen.getByRole("heading", { level: 1 });
  const question = QUESTIONS.find((candidate) => candidate.prompt === heading.textContent);
  if (!question) {
    throw new Error(`Could not map visible prompt to question: ${heading.textContent}`);
  }
  return question;
}

function getChoiceButton(choiceId: string) {
  return screen.getByRole("button", { name: new RegExp(`^Choice ${choiceId}(?:\\.|:)`) });
}

function getConfidenceButton(label: "Guessing" | "Unsure" | "Confident") {
  return screen.getByRole("button", { name: new RegExp(`^Set confidence to ${label}\\.`) });
}

function getFirstDifferentChoice(choiceId: string) {
  return ["A", "B", "C", "D", "E"].find((candidate) => candidate !== choiceId)!;
}

function getFirstWrongChoice(correctChoiceId: string) {
  return ["A", "B", "C", "D", "E"].find((candidate) => candidate !== correctChoiceId)!;
}

function expectChoiceSelected(choiceId: string) {
  expect(getChoiceButton(choiceId)).toHaveClass("selected");
}

function expectChoiceNotSelected(choiceId: string) {
  expect(getChoiceButton(choiceId)).not.toHaveClass("selected");
}

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

function createStoredAttempt(id = "attempt-stored"): Attempt {
  const question = QUESTIONS[0];
  const answers: Record<string, AnswerRecord> = {
    [question.id]: { choiceId: question.correctChoiceId, confidence: 3 },
  };

  return {
    id,
    sessionId: "session-stored",
    mode: "full_mock",
    feedbackMode: "exam",
    startedAt: "2026-05-24T01:00:00.000Z",
    submittedAt: "2026-05-24T01:10:00.000Z",
    durationSeconds: 600,
    questionIds: [question.id],
    answers,
    score: scoreQuestions([question], answers),
  };
}

function wrongChoiceFor(question: Question) {
  return question.choices.find((choice) => choice.id !== question.correctChoiceId)!;
}

function createShareAttempt(id = "attempt-share"): Attempt {
  const questions = QUESTIONS.slice(0, 3);
  const wrongQuestion = questions[0];
  const correctQuestion = questions[1];
  const answers: Record<string, AnswerRecord> = {
    [wrongQuestion.id]: { choiceId: wrongChoiceFor(wrongQuestion).id, confidence: 3 },
    [correctQuestion.id]: { choiceId: correctQuestion.correctChoiceId, confidence: 1 },
  };
  const questionTimings: QuestionTimingMap = {
    [wrongQuestion.id]: {
      firstSeenAt: "2026-05-24T01:00:00.000Z",
      answeredAt: "2026-05-24T01:02:30.000Z",
      lastChangedAt: "2026-05-24T01:02:40.000Z",
      totalVisibleSeconds: 160,
      answerChangeCount: 1,
    },
    [correctQuestion.id]: {
      firstSeenAt: "2026-05-24T01:03:00.000Z",
      answeredAt: "2026-05-24T01:03:30.000Z",
      lastChangedAt: "2026-05-24T01:03:30.000Z",
      totalVisibleSeconds: 30,
      answerChangeCount: 0,
    },
    [questions[2].id]: {
      firstSeenAt: "2026-05-24T01:27:00.000Z",
      totalVisibleSeconds: 180,
      answerChangeCount: 0,
    },
  };

  return {
    id,
    sessionId: "session-share",
    mode: "full_mock",
    feedbackMode: "exam",
    startedAt: "2026-05-24T01:00:00.000Z",
    submittedAt: "2026-05-24T01:30:00.000Z",
    durationSeconds: 1800,
    questionIds: questions.map((question) => question.id),
    answers,
    score: scoreQuestions(questions, answers),
    questionTimings,
  };
}

function shareContext(): ShareCandidateContext {
  return {
    identityMode: "anonymous",
    targetRoleOrAssessment: "Senior PM analytical screen",
    feedbackRequest: "Tell me where my PM reasoning is weakest.",
    testConditions: "timed_uninterrupted",
  };
}

async function fillRequiredShareFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByLabelText("Target role or assessment"),
    "Senior PM analytical screen"
  );
  await user.type(
    screen.getByLabelText("Feedback request"),
    "Tell me where my PM reasoning is weakest."
  );
  await user.selectOptions(screen.getByLabelText("Test conditions"), "timed_uninterrupted");
}

function questionsForTopic(topic: Topic) {
  return QUESTIONS.filter((question) => question.topic === topic).slice(0, 10);
}

function createActiveSessionSnapshot(
  overrides: Partial<ActiveSessionSnapshot> = {}
): ActiveSessionSnapshot {
  const questions = QUESTIONS.slice(0, FULL_MOCK_QUESTION_COUNT);
  const session = {
    id: "session-active",
    mode: "full_mock" as const,
    feedbackMode: "practice" as const,
    startedAt: "2026-05-24T01:00:00.000Z",
    timeLimitSeconds: 1800,
    questionIds: questions.map((question) => question.id),
    answers: {
      [questions[0].id]: { choiceId: questions[0].correctChoiceId, confidence: 3 },
    },
    currentQuestionIndex: 1,
  };

  return {
    version: 1,
    routePath: "/full-mock/practice",
    savedAt: new Date().toISOString(),
    remainingSeconds: 1700,
    confidenceDrafts: {
      [questions[1].id]: 1,
    },
    session,
    ...overrides,
  };
}

function createTopicDrillSnapshot(topic: Topic, feedbackMode: FeedbackMode) {
  const questions = questionsForTopic(topic);

  return createActiveSessionSnapshot({
    routePath: `/topic-drill/${topicToSlug(topic)}/${feedbackMode}`,
    remainingSeconds: 850,
    confidenceDrafts: {},
    session: {
      id: `session-${topic}-${feedbackMode}`,
      mode: "topic_drill",
      feedbackMode,
      topicFilter: topic,
      startedAt: "2026-05-24T01:00:00.000Z",
      timeLimitSeconds: 900,
      questionIds: questions.map((question) => question.id),
      answers: {
        [questions[0].id]: { choiceId: questions[0].correctChoiceId, confidence: 2 },
      },
      currentQuestionIndex: 1,
    },
  });
}

afterEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
  vi.restoreAllMocks();
});

describe("App routes", () => {
  it("renders Frameworks directly from /frameworks", () => {
    renderAt("/frameworks");

    expect(screen.getByRole("heading", { level: 1, name: "Frameworks" })).toBeInTheDocument();
  });

  it("renders Full Mock Exam launch state without starting a timer", () => {
    renderAt("/full-mock/exam");

    expect(screen.getByRole("button", { name: "Full Mock" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Exam" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("renders Full Mock Practice launch state without starting a timer", () => {
    renderAt("/full-mock/practice");

    expect(screen.getByRole("button", { name: "Full Mock" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Practice" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("renders Topic Drill Practice launch state from a topic route", () => {
    renderAt("/topic-drill/ab-testing/practice");

    expect(screen.getByRole("button", { name: "Topic Drill" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Practice" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByLabelText("Topic")).toHaveValue("ab_testing");
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("updates the URL when launch controls and framework navigation change", async () => {
    const user = userEvent.setup();
    renderAt("/");

    await user.click(screen.getByRole("button", { name: "Practice" }));
    expect(window.location.pathname).toBe("/full-mock/practice");

    await user.click(screen.getByRole("button", { name: "Topic Drill" }));
    expect(window.location.pathname).toBe("/topic-drill/product-analytics/practice");

    await user.selectOptions(screen.getByLabelText("Topic"), "data_interpretation");
    expect(window.location.pathname).toBe("/topic-drill/data-interpretation/practice");

    await user.click(screen.getByRole("button", { name: "Exam" }));
    expect(window.location.pathname).toBe("/topic-drill/data-interpretation/exam");

    await user.click(screen.getByRole("button", { name: "Frameworks" }));
    expect(window.location.pathname).toBe("/frameworks");

    await user.click(screen.getByRole("button", { name: "Back home" }));
    expect(window.location.pathname).toBe("/");
  });

  it("navigates to a local result route after submit", async () => {
    const user = userEvent.setup();
    renderAt("/full-mock/exam");

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await user.click(screen.getByRole("button", { name: "Submit anyway" }));

    expect(window.location.pathname).toMatch(/^\/results\/attempt-/);
    expect(screen.getByRole("heading", { level: 1, name: "Results" })).toBeInTheDocument();
  });

  it("renders a stored local result from /results/:attemptId", () => {
    const attempt = createStoredAttempt();
    saveAttempt(attempt);

    renderAt(`/results/${attempt.id}`);

    expect(screen.getByRole("heading", { level: 1, name: "Results" })).toBeInTheDocument();
    expect(screen.getByText("1/1")).toBeInTheDocument();
  });

  it("shows a local-only message for a missing result route", () => {
    renderAt("/results/not-a-real-attempt");

    expect(
      screen.getByText("That result is not available on this device. Results are stored locally.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1, name: "Results" })).not.toBeInTheDocument();
  });

  it("restores a matching Full Mock Practice session from /full-mock/practice after refresh", () => {
    const snapshot = createActiveSessionSnapshot();
    saveActiveSessionSnapshot(snapshot);

    renderAt("/full-mock/practice");

    const restoredQuestion = QUESTIONS.find(
      (question) => question.id === snapshot.session.questionIds[1]
    )!;
    expect(
      screen.getByRole("heading", { level: 1, name: restoredQuestion.prompt })
    ).toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveTextContent("28:");
    expect(screen.getByRole("tab", { name: /Question 2, current/i })).toBeInTheDocument();
  });

  it.each([
    ["exam", "/full-mock/exam"],
    ["practice", "/full-mock/practice"],
  ] as const)("restores a matching Full Mock %s session", (feedbackMode, routePath) => {
    saveActiveSessionSnapshot(
      createActiveSessionSnapshot({
        routePath,
        session: {
          ...createActiveSessionSnapshot().session,
          feedbackMode,
        },
      })
    );

    renderAt(routePath);

    expect(screen.getByRole("timer")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Question 2, current/i })).toBeInTheDocument();
  });

  it.each(
    TOPIC_ORDER.flatMap((topic) =>
      (["exam", "practice"] as const).map((feedbackMode) => [topic, feedbackMode] as const)
    )
  )("restores a matching %s topic drill %s session", (topic, feedbackMode) => {
    const questions = questionsForTopic(topic);
    const routePath = `/topic-drill/${topicToSlug(topic)}/${feedbackMode}`;
    saveActiveSessionSnapshot(createTopicDrillSnapshot(topic, feedbackMode));

    renderAt(routePath);

    expect(
      screen.getByRole("heading", { level: 1, name: questions[1].prompt })
    ).toBeInTheDocument();
    expect(screen.getByRole("timer")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Question 2, current/i })).toBeInTheDocument();
  });

  it("uses the launch state when the active session does not match the assessment route", () => {
    saveActiveSessionSnapshot(createActiveSessionSnapshot());

    renderAt("/full-mock/exam");

    expect(screen.getByRole("button", { name: "Full Mock" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Exam" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("does not let an active session hijack Home, Frameworks, or Results routes", () => {
    const attempt = createStoredAttempt();
    saveAttempt(attempt);
    saveActiveSessionSnapshot(createActiveSessionSnapshot());

    let rendered = renderAt("/");
    expect(screen.getByRole("heading", { level: 1, name: "PM Assessment Gym" })).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();

    rendered.unmount();
    rendered = renderAt("/frameworks");
    expect(screen.getByRole("heading", { level: 1, name: "Frameworks" })).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();

    rendered.unmount();
    rendered = renderAt("/results");
    expect(window.location.pathname).toBe(`/results/${attempt.id}`);
    expect(screen.getByRole("heading", { level: 1, name: "Results" })).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();

    rendered.unmount();
    renderAt(`/results/${attempt.id}`);
    expect(screen.getByRole("heading", { level: 1, name: "Results" })).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("does not let an active session hijack unknown paths or unknown topics", () => {
    saveActiveSessionSnapshot(createActiveSessionSnapshot());

    const { unmount } = renderAt("/not-a-real-route");
    expect(window.location.pathname).toBe("/");
    expect(screen.getByRole("heading", { level: 1, name: "PM Assessment Gym" })).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();

    unmount();
    renderAt("/topic-drill/not-a-topic/practice");
    expect(window.location.pathname).toBe("/");
    expect(screen.getByRole("heading", { level: 1, name: "PM Assessment Gym" })).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("restores a matching Full Mock Exam session from the /full-mock shorthand route", () => {
    saveActiveSessionSnapshot(
      createActiveSessionSnapshot({
        routePath: "/full-mock/exam",
        session: {
          ...createActiveSessionSnapshot().session,
          feedbackMode: "exam",
        },
      })
    );

    renderAt("/full-mock");

    expect(window.location.pathname).toBe("/full-mock/exam");
    expect(screen.getByRole("timer")).toBeInTheDocument();
  });

  it("restores a matching Topic Drill Practice session from the topic shorthand route", () => {
    const questions = questionsForTopic("ab_testing");
    saveActiveSessionSnapshot(createTopicDrillSnapshot("ab_testing", "practice"));

    renderAt("/topic-drill/ab-testing");

    expect(window.location.pathname).toBe("/topic-drill/ab-testing/practice");
    expect(
      screen.getByRole("heading", { level: 1, name: questions[1].prompt })
    ).toBeInTheDocument();
  });

  it("clears the active session snapshot after submit", async () => {
    const user = userEvent.setup();
    renderAt("/full-mock/practice");

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));
    expect(window.localStorage.getItem("pm-assessment-active-session-v1")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await user.click(screen.getByRole("button", { name: "Submit anyway" }));

    expect(window.localStorage.getItem("pm-assessment-active-session-v1")).toBeNull();
    expect(window.location.pathname).toMatch(/^\/results\/attempt-/);
  });

  it("clears the active session snapshot after timer auto-submit", async () => {
    const user = userEvent.setup();
    renderAt("/full-mock/practice?timerSeconds=1");

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));
    expect(window.localStorage.getItem("pm-assessment-active-session-v1")).not.toBeNull();

    await waitFor(
      () => {
        expect(window.location.pathname).toMatch(/^\/results\/attempt-/);
      },
      { timeout: 2500 }
    );
    expect(window.localStorage.getItem("pm-assessment-active-session-v1")).toBeNull();
  });
});

describe("App answer locking", () => {
  it("defines neutral answered navigator styles", () => {
    const stylesheet = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");
    expect(stylesheet).toContain(".nav-pill--answered");
    const answeredRule = stylesheet.match(/\.nav-pill--answered\s*\{(?<body>[^}]*)\}/)?.groups
      ?.body;

    expect(answeredRule).toBeDefined();
    expect(answeredRule).toContain("border-color: var(--border)");
    expect(answeredRule).toContain("color: var(--text)");
    expect(answeredRule).toContain("background: var(--surface-muted)");
    expect(answeredRule).not.toMatch(/success|danger/);
  });

  it("collapses shortcut dialog grids in the mobile stylesheet", () => {
    const stylesheet = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");
    const mobileBlock = stylesheet.match(
      /@media\s*\(max-width:\s*760px\)\s*\{(?<body>[\s\S]*)\n\}/
    )?.groups?.body;

    expect(mobileBlock).toBeDefined();
    expect(mobileBlock).toMatch(
      /\.shortcut-groups\s*\{[^}]*grid-template-columns:\s*1fr\s*;[^}]*\}/
    );
    expect(mobileBlock).toMatch(
      /\.shortcut-setting\s*\{[^}]*grid-template-columns:\s*1fr\s*;[^}]*\}/
    );
  });

  it("locks a practice answer after feedback is revealed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Practice" }));
    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const question = getVisibleQuestion();
    const wrongChoice = getFirstWrongChoice(question.correctChoiceId);
    const wrongButton = getChoiceButton(wrongChoice);

    await user.click(wrongButton);

    expect(screen.getByText("Incorrect")).toBeInTheDocument();
    expect(wrongButton).toHaveClass("selected");

    await user.click(getChoiceButton(question.correctChoiceId));

    expect(screen.getByText("Incorrect")).toBeInTheDocument();
    expect(wrongButton).toHaveClass("selected");
  });

  it("ignores keyboard answer changes after practice feedback is revealed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Practice" }));
    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const question = getVisibleQuestion();
    const wrongChoice = getFirstWrongChoice(question.correctChoiceId);
    const replacementChoice = getFirstDifferentChoice(wrongChoice);
    const wrongButton = getChoiceButton(wrongChoice);

    await user.click(wrongButton);
    await user.keyboard(String(["A", "B", "C", "D", "E"].indexOf(replacementChoice) + 1));

    expect(wrongButton).toHaveClass("selected");
  });

  it("locks confidence after practice feedback is revealed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Practice" }));
    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const question = getVisibleQuestion();
    const wrongChoice = getFirstWrongChoice(question.correctChoiceId);

    await user.click(getConfidenceButton("Confident"));
    await user.click(getChoiceButton(wrongChoice));
    await user.click(getConfidenceButton("Guessing"));

    expect(getConfidenceButton("Confident")).toHaveAttribute("aria-pressed", "true");
  });

  it("still allows exam answers to be changed before submit", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const firstChoice = getChoiceButton("A");
    const secondChoice = getChoiceButton("B");

    await user.click(firstChoice);
    expect(firstChoice).toHaveClass("selected");

    await user.click(secondChoice);
    expect(secondChoice).toHaveClass("selected");
    expect(firstChoice).not.toHaveClass("selected");
  });

  it("uses neutral answered state in the question navigator", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Practice" }));
    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const question = getVisibleQuestion();
    const wrongChoice = getFirstWrongChoice(question.correctChoiceId);
    await user.click(getChoiceButton(wrongChoice));
    await user.click(
      screen.getByRole("button", {
        name: "Go to next question. Keyboard shortcut Right Arrow.",
      })
    );

    const firstNavigatorButton = screen.getByRole("tab", { name: /Question 1, answered/i });
    expect(firstNavigatorButton).toHaveClass("nav-pill--answered");
    expect(firstNavigatorButton).not.toHaveClass("nav-pill--correct");
    expect(firstNavigatorButton).not.toHaveClass("nav-pill--wrong");
  });
});

describe("App keyboard shortcuts", () => {
  it("preserves 1-5 answer selection shortcuts", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));
    await user.keyboard("1");

    expectChoiceSelected("A");
  });

  it("ignores printable shortcuts inside input, textarea, select, contenteditable, and modal contexts", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const expectShortcutIgnoredFor = async (element: HTMLElement) => {
      document.body.appendChild(element);
      try {
        element.focus();
        await user.keyboard("1");
        expectChoiceNotSelected("A");
      } finally {
        element.remove();
      }
    };

    await expectShortcutIgnoredFor(document.createElement("input"));
    await expectShortcutIgnoredFor(document.createElement("textarea"));
    await expectShortcutIgnoredFor(document.createElement("select"));

    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    editable.tabIndex = 0;
    await expectShortcutIgnoredFor(editable);

    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    const dialogButton = document.createElement("button");
    dialogButton.textContent = "Dialog button";
    dialog.appendChild(dialogButton);
    document.body.appendChild(dialog);
    try {
      dialogButton.focus();
      await user.keyboard("1");
      expectChoiceNotSelected("A");
    } finally {
      dialog.remove();
    }
  });

  it("sets confidence with Shift+1 through Shift+3", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    fireEvent.keyDown(window, { key: "1", code: "Digit1", shiftKey: true });
    expect(getConfidenceButton("Guessing")).toHaveAttribute("aria-pressed", "true");

    fireEvent.keyDown(window, { key: "2", code: "Digit2", shiftKey: true });
    expect(getConfidenceButton("Unsure")).toHaveAttribute("aria-pressed", "true");

    fireEvent.keyDown(window, { key: "3", code: "Digit3", shiftKey: true });
    expect(getConfidenceButton("Confident")).toHaveAttribute("aria-pressed", "true");
  });

  it("ignores confidence shortcuts after practice feedback is revealed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Practice" }));
    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const question = getVisibleQuestion();
    const wrongChoice = getFirstWrongChoice(question.correctChoiceId);

    await user.click(getConfidenceButton("Confident"));
    await user.click(getChoiceButton(wrongChoice));

    const event = new KeyboardEvent("keydown", {
      key: "1",
      code: "Digit1",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(getConfidenceButton("Confident")).toHaveAttribute("aria-pressed", "true");
  });

  it("moves between questions with ArrowRight and ArrowLeft", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    fireEvent.keyDown(window, { key: "ArrowRight", code: "ArrowRight" });
    expect(screen.getByRole("tab", { name: /Question 2, current/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();

    fireEvent.keyDown(window, { key: "ArrowLeft", code: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: /Question 1, current/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();
  });

  it("jumps to the next unanswered question with Shift+ArrowRight", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));
    await user.keyboard("1");

    fireEvent.keyDown(window, { key: "ArrowRight", code: "ArrowRight" });
    await user.keyboard("1");

    fireEvent.keyDown(window, { key: "ArrowRight", code: "ArrowRight", shiftKey: true });

    expect(screen.getByRole("tab", { name: /Question 3, current/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();
  });

  it("moves focused answer choices with ArrowUp and ArrowDown without selecting", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const choiceA = getChoiceButton("A");
    const choiceB = getChoiceButton("B");
    choiceA.focus();

    await user.keyboard("{ArrowDown}");

    expect(choiceB).toHaveFocus();
    expectChoiceNotSelected("A");
    expectChoiceNotSelected("B");

    await user.keyboard(" ");

    expectChoiceSelected("B");

    await user.keyboard("{ArrowUp}");

    expect(choiceA).toHaveFocus();
  });

  it("moves focus inside confidence controls with ArrowRight without changing questions", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const guessingButton = getConfidenceButton("Guessing");
    const unsureButton = getConfidenceButton("Unsure");
    guessingButton.focus();

    await user.keyboard("{ArrowRight}");

    expect(unsureButton).toHaveFocus();
    expect(screen.getByRole("tab", { name: /Question 1, current/i })).toBeInTheDocument();
  });

  it("disables printable global shortcuts when shortcut mode is off but keeps ArrowRight navigation", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("pm-assessment-shortcuts-enabled-v1", "false");
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    await user.keyboard("1");
    fireEvent.keyDown(window, { key: "1", code: "Digit1", shiftKey: true });
    await user.keyboard("?");

    expectChoiceNotSelected("A");
    expect(getConfidenceButton("Unsure")).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("dialog", { name: /Keyboard shortcuts/i })).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowRight", code: "ArrowRight" });
    expect(screen.getByRole("tab", { name: /Question 2, current/i })).toBeInTheDocument();
  });

  it("does not advertise printable shortcuts when shortcut mode is off", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("pm-assessment-shortcuts-enabled-v1", "false");
    const { container } = render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    expect(
      screen.queryByText(
        "Use 1-5 to answer, Shift+1-3 for confidence, and arrows to move between questions."
      )
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Choice A:/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /\(press 1\)/i })).not.toBeInTheDocument();
    expect(container.querySelector(".choice-letter small")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Show keyboard shortcuts/i })).toBeInTheDocument();
  });

  it("shows answer, confidence, and navigation shortcut badges when shortcuts are enabled", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    expect(
      Array.from(container.querySelectorAll(".choice-letter small")).map((badge) =>
        badge.textContent?.trim()
      )
    ).toEqual(["1", "2", "3", "4", "5"]);
    expect(screen.getByText("Shift+1")).toBeInTheDocument();
    expect(screen.getByText("Shift+2")).toBeInTheDocument();
    expect(screen.getByText("Shift+3")).toBeInTheDocument();
    expect(screen.getByText("←")).toBeInTheDocument();
    expect(screen.getByText("Shift+→")).toBeInTheDocument();
    expect(screen.getByText("→")).toBeInTheDocument();
  });

  it("hides printable answer and confidence badges when shortcut mode is off while navigation badges remain", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("pm-assessment-shortcuts-enabled-v1", "false");
    const { container } = render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    expect(container.querySelector(".choice-letter small")).not.toBeInTheDocument();
    expect(screen.queryByText("Shift+1")).not.toBeInTheDocument();
    expect(screen.queryByText("Shift+2")).not.toBeInTheDocument();
    expect(screen.queryByText("Shift+3")).not.toBeInTheDocument();
    expect(screen.getByText("←")).toBeInTheDocument();
    expect(screen.getByText("Shift+→")).toBeInTheDocument();
    expect(screen.getByText("→")).toBeInTheDocument();
  });

  it("labels key controls with their keyboard shortcuts", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    expect(
      screen.getByRole("button", {
        name: /^Choice A\. Select answer A\. Keyboard shortcut 1\./,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Set confidence to Guessing. Keyboard shortcut Shift 1.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Go to previous question. Keyboard shortcut Left Arrow.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Jump to next unanswered question. Keyboard shortcut Shift Right Arrow.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Go to next question. Keyboard shortcut Right Arrow.",
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Show keyboard shortcuts/i })).toBeInTheDocument();
  });

  it("persists first-time keyboard tip dismissal", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    expect(
      screen.getByText(
        "Use 1-5 to answer, Shift+1-3 for confidence, and arrows to move between questions."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Show keyboard shortcuts/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Got it" }));

    expect(
      screen.queryByText(
        "Use 1-5 to answer, Shift+1-3 for confidence, and arrows to move between questions."
      )
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Show keyboard shortcuts/i })).toBeInTheDocument();

    unmount();
    window.localStorage.removeItem("pm-assessment-active-session-v1");
    window.history.replaceState({}, "", "/");
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    expect(
      screen.queryByText(
        "Use 1-5 to answer, Shift+1-3 for confidence, and arrows to move between questions."
      )
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Show keyboard shortcuts/i })).toBeInTheDocument();
  });

  it("opens shortcut help from the visible Shortcuts button, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));

    const opener = screen.getByRole("button", { name: /Show keyboard shortcuts/i });
    await user.click(opener);

    expect(
      screen.getByRole("dialog", { name: "Keyboard shortcuts" })
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", { name: "Keyboard shortcuts" })
    ).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("closes app modals when clicking the backdrop and restores focus", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));
    const opener = screen.getByRole("button", { name: /Show keyboard shortcuts/i });
    await user.click(opener);

    const overlay = document.querySelector(".modal-overlay");
    expect(overlay).toBeInstanceOf(HTMLElement);

    await user.click(overlay as HTMLElement);

    expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("keeps app modals open when clicking inside the dialog", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));
    await user.click(screen.getByRole("button", { name: /Show keyboard shortcuts/i }));

    await user.click(screen.getByRole("dialog", { name: "Keyboard shortcuts" }));

    expect(screen.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument();
  });

  it("renders dialogs inside the shared modal overlay surface", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));
    await user.click(screen.getByRole("button", { name: /Show keyboard shortcuts/i }));

    const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
    expect(dialog.closest(".modal-overlay")).toBeInstanceOf(HTMLElement);
  });

  it("opens shortcut help from ? when shortcut mode is enabled", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));
    await user.keyboard("?");

    expect(
      screen.getByRole("dialog", { name: "Keyboard shortcuts" })
    ).toBeInTheDocument();
    expect(screen.getByText("Select answer A")).toBeInTheDocument();
    expect(screen.getByText("Shortcuts help")).toBeInTheDocument();
  });

  it("lets the help setting disable printable global shortcuts after close while ArrowRight still works", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));
    await user.click(screen.getByRole("button", { name: /Show keyboard shortcuts/i }));

    const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
    await user.click(screen.getByRole("button", { name: "Off" }));
    expect(window.localStorage.getItem("pm-assessment-shortcuts-enabled-v1")).toBe("false");

    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

    await user.keyboard("1");
    await user.keyboard("?");
    expectChoiceNotSelected("A");
    expect(
      screen.queryByRole("dialog", { name: "Keyboard shortcuts" })
    ).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowRight", code: "ArrowRight" });
    expect(screen.getByRole("tab", { name: /Question 2, current/i })).toBeInTheDocument();
  });

  it("traps focus inside shortcut help on Tab and Shift+Tab", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Start full mock/i }));
    await user.click(screen.getByRole("button", { name: /Show keyboard shortcuts/i }));

    const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
    const firstFocusable = screen.getByRole("button", { name: "On" });
    const lastFocusable = screen.getByRole("button", { name: "Close" });

    firstFocusable.focus();
    fireEvent.keyDown(dialog, { key: "Tab", code: "Tab", shiftKey: true });
    expect(lastFocusable).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Tab", code: "Tab" });
    expect(firstFocusable).toHaveFocus();
  });
});

describe("shared results review", () => {
  it("shows Share for review on Results but not while taking a test", async () => {
    const user = userEvent.setup();
    saveAttempt(createShareAttempt());

    const resultsRender = renderAt("/results/attempt-share");
    expect(screen.getByRole("button", { name: "Share for review" })).toBeInTheDocument();

    resultsRender.unmount();
    window.history.replaceState({}, "", "/");

    const rendered = render(<App />);
    await user.click(screen.getByRole("button", { name: /Start full mock/i }));
    expect(screen.queryByRole("button", { name: "Share for review" })).not.toBeInTheDocument();
    rendered.unmount();
  });

  it("opens and closes the share modal with focus restored to the opener", async () => {
    const user = userEvent.setup();
    saveAttempt(createShareAttempt());
    renderAt("/results/attempt-share");

    const opener = screen.getByRole("button", { name: "Share for review" });
    await user.click(opener);

    expect(
      screen.getByRole("dialog", { name: "Share for senior review" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Target role or assessment")).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", { name: "Share for senior review" })
    ).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("requires senior review context before copying", async () => {
    const user = userEvent.setup();
    saveAttempt(createShareAttempt());
    renderAt("/results/attempt-share");

    await user.click(screen.getByRole("button", { name: "Share for review" }));
    const copyButton = screen.getByRole("button", { name: "Copy review packet" });

    expect(copyButton).toBeDisabled();
    expect(screen.getByLabelText("Share identity")).toHaveValue("anonymous");

    await fillRequiredShareFields(user);

    expect(copyButton).toBeEnabled();
    expect((screen.getByLabelText("Markdown preview") as HTMLTextAreaElement).value).toContain(
      "# PM Assessment Review Packet"
    );
  });

  it("copies the senior brief and announces success", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    saveAttempt(createShareAttempt());
    renderAt("/results/attempt-share");

    await user.click(screen.getByRole("button", { name: "Share for review" }));
    await fillRequiredShareFields(user);
    await user.click(screen.getByRole("button", { name: "Copy review packet" }));

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("# PM Assessment Review Packet")
    );
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Senior Brief"));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Review packet copied. Share it with a trusted reviewer."
    );
  });

  it("falls back to manual copy when Clipboard API fails", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("blocked")) },
    });
    saveAttempt(createShareAttempt());
    renderAt("/results/attempt-share");

    await user.click(screen.getByRole("button", { name: "Share for review" }));
    await fillRequiredShareFields(user);
    await user.click(screen.getByRole("button", { name: "Copy review packet" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Copy failed. Select the preview text and copy it manually."
    );
    expect(screen.getByLabelText("Markdown preview")).toHaveFocus();
  });

  it("updates the preview when switching from Senior Brief to Safe Summary", async () => {
    const user = userEvent.setup();
    const attempt = createShareAttempt();
    const firstQuestion = QUESTIONS.find((question) => question.id === attempt.questionIds[0])!;
    saveAttempt(attempt);
    renderAt("/results/attempt-share");

    await user.click(screen.getByRole("button", { name: "Share for review" }));
    await fillRequiredShareFields(user);

    const preview = screen.getByLabelText("Markdown preview");
    expect((preview as HTMLTextAreaElement).value).toContain(firstQuestion.prompt);
    expect((preview as HTMLTextAreaElement).value).toContain(firstQuestion.explanation);

    await user.click(screen.getByRole("button", { name: "Safe Summary" }));

    expect((preview as HTMLTextAreaElement).value).toContain("Safe Summary");
    expect((preview as HTMLTextAreaElement).value).not.toContain(firstQuestion.prompt);
    expect((preview as HTMLTextAreaElement).value).not.toContain(firstQuestion.explanation);
  });

  it("shows timing summary after a result", () => {
    saveAttempt(createShareAttempt());
    renderAt("/results/attempt-share");

    expect(screen.getByRole("heading", { level: 2, name: "Pacing Review" })).toBeInTheDocument();
    expect(screen.getByText(/Slowest missed/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Time expired with unanswered questions/i).length).toBeGreaterThan(0);
  });

  it("renders an imported Markdown packet on /shared-review", async () => {
    const user = userEvent.setup();
    const attempt = createShareAttempt();
    const questions = attempt.questionIds.map((questionId) =>
      QUESTIONS.find((question) => question.id === questionId)
    ) as Question[];
    const packet = buildShareReviewPacket({
      attempt,
      questions,
      reviews: questions.map((question) => ({
        questionId: question.id,
        topic: question.topic,
        prompt: question.prompt,
        chosenChoiceId: attempt.answers[question.id]?.choiceId,
        confidence: attempt.answers[question.id]?.confidence,
        correctChoiceId: question.correctChoiceId,
        isCorrect: attempt.answers[question.id]?.choiceId === question.correctChoiceId,
        explanation: question.explanation,
        conceptTags: question.conceptTags,
      })),
      context: shareContext(),
      options: { detailPreset: "senior_brief" },
      createdAt: "2026-05-24T02:00:00.000Z",
    });
    const markdown = renderShareReviewMarkdown(packet);
    renderAt("/shared-review");

    expect(
      screen.getByRole("heading", { level: 1, name: "Shared Review" })
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Review packet"), {
      target: { value: markdown },
    });
    await user.click(screen.getByRole("button", { name: "Render review" }));

    expect(screen.getByText("Senior PM analytical screen")).toBeInTheDocument();
    expect(screen.getByText("1/3")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Priority Mistakes" })).toBeInTheDocument();
  });

  it("shows a safe failure state for invalid imported packets", async () => {
    const user = userEvent.setup();
    renderAt("/shared-review");

    await user.type(screen.getByLabelText("Review packet"), "not a valid packet");
    await user.click(screen.getByRole("button", { name: "Render review" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/could not be read/i);
  });
});
