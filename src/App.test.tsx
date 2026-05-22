import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { QUESTIONS } from "./questions";

function getVisibleQuestion() {
  const heading = screen.getByRole("heading", { level: 1 });
  const question = QUESTIONS.find((candidate) => candidate.prompt === heading.textContent);
  if (!question) {
    throw new Error(`Could not map visible prompt to question: ${heading.textContent}`);
  }
  return question;
}

function getChoiceButton(choiceId: string) {
  return screen.getByRole("button", { name: new RegExp(`^Choice ${choiceId} `) });
}

function getFirstDifferentChoice(choiceId: string) {
  return ["A", "B", "C", "D", "E"].find((candidate) => candidate !== choiceId)!;
}

function getFirstWrongChoice(correctChoiceId: string) {
  return ["A", "B", "C", "D", "E"].find((candidate) => candidate !== correctChoiceId)!;
}

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
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

    await user.click(screen.getByRole("button", { name: "3 Confident" }));
    await user.click(getChoiceButton(wrongChoice));
    await user.click(screen.getByRole("button", { name: "1 Guessing" }));

    expect(screen.getByRole("button", { name: "3 Confident" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
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
    await user.click(screen.getByRole("button", { name: "Next" }));

    const firstNavigatorButton = screen.getByRole("tab", { name: /Question 1, answered/i });
    expect(firstNavigatorButton).toHaveClass("nav-pill--answered");
    expect(firstNavigatorButton).not.toHaveClass("nav-pill--correct");
    expect(firstNavigatorButton).not.toHaveClass("nav-pill--wrong");
  });
});
