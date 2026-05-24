import { describe, expect, it } from "vitest";
import { validateCandidate } from "./quality.mjs";

function baseCandidate(overrides = {}) {
  return {
    frontmatter: {
      schemaVersion: 1,
      status: "crawled",
      sourceUrl: "https://example.com",
      sourceTitle: "Example",
      harvestPolicy: "manual_review_only",
      permissionNote: "Manual review required.",
      originalityStatus: "original",
      topic: "product_analytics",
      difficulty: "medium",
      correctChoiceId: "C",
      estimatedSeconds: 90,
      conceptTags: ["activation"],
      ...overrides.frontmatter,
    },
    prompt:
      overrides.prompt ??
      "A PM sees activation rise but paid conversion stay flat after a product change. Which analysis should come next before shipping more work?",
    choices:
      overrides.choices ?? {
        A: "Declare success because activation improved.",
        B: "Ignore activation and only ask sales for opinions.",
        C: "Check whether activated users reached behaviors that predict paid conversion.",
        D: "Change the goal metric after seeing the result.",
        E: "Pause all measurement for a month.",
      },
    explanation:
      overrides.explanation ??
      "Activation is useful only if it is connected to downstream value. The PM should inspect whether the activated behavior predicts paid conversion before increasing investment.",
    verificationNotes:
      overrides.verificationNotes ??
      "- Answer evidence: reviewer verified the metric tree.\n- Reviewer decision: approved",
  };
}

describe("candidate quality validation", () => {
  it("accepts a complete approved candidate", () => {
    const result = validateCandidate(baseCandidate());
    expect(result.errors).toEqual([]);
  });

  it("blocks missing answer keys", () => {
    const result = validateCandidate(baseCandidate({ frontmatter: { correctChoiceId: "" } }));
    expect(result.errors).toContain("correctChoiceId must be A, B, C, D, or E.");
  });

  it("warns on weak distractors", () => {
    const result = validateCandidate(
      baseCandidate({
        choices: {
          A: "Change the logo color.",
          B: "Ignore cohorts.",
          C: "Check predictive activation behavior.",
          D: "Use a vanity metric.",
          E: "Overreact to one day of data.",
        },
      })
    );
    expect(result.warnings.some((warning) => warning.includes("logo color"))).toBe(true);
  });
});
