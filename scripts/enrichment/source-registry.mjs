export const STORE_TEXT_POLICIES = new Set(["public_question_ok", "manual_review_only"]);
export const METADATA_ONLY_POLICIES = new Set([
  "rubric_only",
  "pattern_only",
  "metadata_only",
  "needs_terms_review",
]);

export function parseSourceRegistry(markdown) {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("| ") && !line.includes("---") && !line.includes("| id |"))
    .map((line) => {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim());
      const [id, status, source, url, harvestPolicy, fit, topicSignals, notes] = cells;
      return {
        id,
        status,
        source,
        url,
        harvestPolicy,
        fit,
        topicSignals: topicSignals
          .split(",")
          .map((topic) => topic.trim())
          .filter(Boolean),
        notes,
        canFetch: status === "active" || status === "candidate",
        canStoreQuestionText: STORE_TEXT_POLICIES.has(harvestPolicy),
      };
    })
    .filter((source) => source.id);
}
