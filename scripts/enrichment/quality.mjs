export const TOPIC_ORDER = [
  "product_analytics",
  "data_literacy",
  "chart_interpretation",
  "inductive_reasoning",
  "data_interpretation",
  "ab_testing",
];

export const CHOICE_IDS = ["A", "B", "C", "D", "E"];
export const DIFFICULTIES = ["easy", "medium", "hard"];
export const ORIGINALITY_STATUSES = ["needs_rewrite", "original", "permitted"];

export const WEAK_DISTRACTOR_PHRASES = [
  "app's color palette",
  "logo color",
  "number of engineers",
  "number of app store reviews",
  "hide",
  "stop measuring",
  "ignore the chart",
];

export function validateCandidate(candidate) {
  const errors = [];
  const warnings = [];
  const frontmatter = candidate.frontmatter ?? {};

  if (frontmatter.schemaVersion !== 1) {
    errors.push("schemaVersion must be 1.");
  }

  for (const field of ["sourceUrl", "sourceTitle", "harvestPolicy", "permissionNote"]) {
    if (!frontmatter[field]) {
      errors.push(`${field} is required for provenance.`);
    }
  }

  if (!ORIGINALITY_STATUSES.includes(frontmatter.originalityStatus)) {
    errors.push("originalityStatus must be needs_rewrite, original, or permitted.");
  }

  if (!TOPIC_ORDER.includes(frontmatter.topic)) {
    errors.push(`topic must be one of: ${TOPIC_ORDER.join(", ")}.`);
  }

  if (!DIFFICULTIES.includes(frontmatter.difficulty)) {
    errors.push("difficulty must be easy, medium, or hard.");
  }

  if (!CHOICE_IDS.includes(frontmatter.correctChoiceId)) {
    errors.push("correctChoiceId must be A, B, C, D, or E.");
  }

  if (
    !Number.isInteger(frontmatter.estimatedSeconds) ||
    frontmatter.estimatedSeconds < 45 ||
    frontmatter.estimatedSeconds > 150
  ) {
    errors.push("estimatedSeconds must be an integer between 45 and 150.");
  }

  if (!candidate.prompt || candidate.prompt.trim().length < 50) {
    errors.push("Prompt must be at least 50 characters.");
  }

  if (!candidate.explanation || candidate.explanation.trim().length < 80) {
    errors.push("Explanation must be at least 80 characters.");
  }

  if (!Array.isArray(frontmatter.conceptTags) || frontmatter.conceptTags.length === 0) {
    errors.push("conceptTags must include at least one tag.");
  }

  for (const choiceId of CHOICE_IDS) {
    const text = candidate.choices?.[choiceId]?.trim() ?? "";
    if (!text) {
      errors.push(`Choice ${choiceId} is required.`);
      continue;
    }

    if (text.includes("[Missing distractor")) {
      errors.push(`Choice ${choiceId} is a missing distractor placeholder.`);
    }

    const normalizedChoice = text.toLowerCase();
    for (const phrase of WEAK_DISTRACTOR_PHRASES) {
      if (normalizedChoice.includes(phrase)) {
        warnings.push(`Choice ${choiceId} contains weak distractor phrase: "${phrase}".`);
      }
    }
  }

  const choiceTexts = CHOICE_IDS.map((choiceId) => candidate.choices?.[choiceId]?.trim().toLowerCase());
  if (new Set(choiceTexts).size !== choiceTexts.length) {
    errors.push("Choices must not repeat the same text.");
  }

  return { errors, warnings };
}

export function normalizeForSimilarity(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenOverlapScore(a, b) {
  const aTokens = new Set(
    normalizeForSimilarity(a)
      .split(" ")
      .filter((token) => token.length > 3)
  );
  const bTokens = new Set(
    normalizeForSimilarity(b)
      .split(" ")
      .filter((token) => token.length > 3)
  );
  const intersection = [...aTokens].filter((token) => bTokens.has(token)).length;
  return intersection / Math.max(1, Math.min(aTokens.size, bTokens.size));
}

export function getApprovalGateErrors(candidate) {
  const errors = [];
  const frontmatter = candidate.frontmatter ?? {};

  if (frontmatter.originalityStatus === "needs_rewrite") {
    errors.push("originalityStatus is needs_rewrite.");
  }

  if (!candidate.verificationNotes?.includes("Answer evidence:")) {
    errors.push("Verification notes must include Answer evidence:.");
  }

  if (!candidate.verificationNotes?.match(/Answer evidence:\s*\S/i)) {
    errors.push("Answer evidence must not be blank.");
  }

  return errors;
}

export function isApprovalReviewed(candidate) {
  const frontmatter = candidate.frontmatter ?? {};
  return Boolean(frontmatter.reviewedAt && frontmatter.reviewer);
}
