import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const projectRoot = path.resolve(import.meta.dirname, "..");
const questionsPath = path.join(projectRoot, "src", "questions.ts");
const source = fs.readFileSync(questionsPath, "utf8");

const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
  fileName: questionsPath,
});

const commonExports = {};
const sandbox = {
  exports: commonExports,
  module: { exports: commonExports },
  console: {
    warn() {},
    log() {},
  },
  require() {
    return {};
  },
};

vm.runInNewContext(transpiled.outputText, sandbox, { filename: questionsPath });

const { FULL_MOCK_DISTRIBUTION, QUESTIONS, TOPIC_ORDER } = sandbox.module.exports;
const errors = [];
const warnings = [];

const choiceIds = ["A", "B", "C", "D", "E"];
const expectedTopicCount = 20;
const expectedTotal = TOPIC_ORDER.length * expectedTopicCount;

function recordError(message) {
  errors.push(message);
}

function recordWarning(message) {
  warnings.push(message);
}

if (!Array.isArray(QUESTIONS)) {
  recordError("QUESTIONS must export an array.");
} else {
  const ids = new Set();
  const topicCounts = Object.fromEntries(TOPIC_ORDER.map((topic) => [topic, 0]));
  const correctCounts = Object.fromEntries(choiceIds.map((id) => [id, 0]));

  for (const question of QUESTIONS) {
    if (ids.has(question.id)) {
      recordError(`Duplicate question id: ${question.id}`);
    }
    ids.add(question.id);

    if (!TOPIC_ORDER.includes(question.topic)) {
      recordError(`${question.id} has unknown topic: ${question.topic}`);
    } else {
      topicCounts[question.topic] += 1;
    }

    if (!["easy", "medium", "hard"].includes(question.difficulty)) {
      recordError(`${question.id} has invalid difficulty: ${question.difficulty}`);
    }

    if (!Array.isArray(question.choices) || question.choices.length !== 5) {
      recordError(`${question.id} must have exactly five choices.`);
      continue;
    }

    const seenChoiceIds = new Set(question.choices.map((choice) => choice.id));
    if (seenChoiceIds.size !== 5 || choiceIds.some((id) => !seenChoiceIds.has(id))) {
      recordError(`${question.id} must use one each of A, B, C, D, and E.`);
    }

    if (!seenChoiceIds.has(question.correctChoiceId)) {
      recordError(`${question.id} correctChoiceId is missing from choices.`);
    } else {
      correctCounts[question.correctChoiceId] += 1;
    }

    const choiceTexts = question.choices.map((choice) => choice.text.trim().toLowerCase());
    if (new Set(choiceTexts).size !== choiceTexts.length) {
      recordError(`${question.id} has duplicate choice text.`);
    }

    if (!question.prompt || question.prompt.length < 50) {
      recordError(`${question.id} prompt is too thin.`);
    }

    if (!question.explanation || question.explanation.length < 80) {
      recordError(`${question.id} explanation should teach the concept, not only name the answer.`);
    }

    if (!Array.isArray(question.conceptTags) || question.conceptTags.length === 0) {
      recordError(`${question.id} must have at least one concept tag.`);
    }

    if (!Number.isInteger(question.estimatedSeconds) || question.estimatedSeconds < 45 || question.estimatedSeconds > 150) {
      recordError(`${question.id} estimatedSeconds must be an integer from 45 to 150.`);
    }
  }

  if (QUESTIONS.length !== expectedTotal) {
    recordError(`Expected ${expectedTotal} questions, found ${QUESTIONS.length}.`);
  }

  for (const topic of TOPIC_ORDER) {
    const available = topicCounts[topic] ?? 0;
    const needed = FULL_MOCK_DISTRIBUTION[topic];

    if (available !== expectedTopicCount) {
      recordError(`Expected ${expectedTopicCount} ${topic} questions, found ${available}.`);
    }

    if (available < needed) {
      recordError(`${topic} has ${available} questions but full mock needs ${needed}.`);
    }
  }

  const expectedPerLetter = QUESTIONS.length / choiceIds.length;
  if (Number.isInteger(expectedPerLetter)) {
    for (const id of choiceIds) {
      if (correctCounts[id] !== expectedPerLetter) {
        recordError(`Expected ${expectedPerLetter} correct answers for ${id}, found ${correctCounts[id]}.`);
      }
    }
  } else {
    recordWarning("Question total is not divisible by five, so answer-letter balance cannot be exact.");
  }

  console.log("Question bank summary");
  console.log(JSON.stringify({ total: QUESTIONS.length, topicCounts, correctCounts }, null, 2));
}

for (const warning of warnings) {
  console.warn(`Warning: ${warning}`);
}

if (errors.length > 0) {
  console.error("\nQuestion bank validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("\nQuestion bank validation passed.");
