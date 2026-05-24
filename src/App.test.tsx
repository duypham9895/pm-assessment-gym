import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { QUESTIONS } from "./questions";
import { scoreQuestions } from "./scoring";
import { saveAttempt } from "./storage";
import type { AnswerRecord, Attempt } from "./types";

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
