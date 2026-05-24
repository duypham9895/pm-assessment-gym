import { describe, expect, it } from "vitest";
import { parseCandidateMarkdown, serializeCandidateMarkdown } from "./markdown.mjs";

const sample = `---
schemaVersion: 1
status: crawled
sourceUrl: "https://example.com"
sourceTitle: "Example"
sourceType: "assessment_vendor"
harvestPolicy: "manual_review_only"
permissionNote: "Public sample, manual review required."
extractionMethod: "manual_raw"
crawledAt: "2026-05-24"
reviewedAt: ""
reviewer: ""
originalityStatus: "needs_rewrite"
topic: product_analytics
difficulty: medium
correctChoiceId: C
estimatedSeconds: 90
conceptTags:
  - activation
  - cohorts
---

# Prompt
Prompt text with enough detail to represent a PM scenario.

## Choice A
First choice

## Choice B
Second choice

## Choice C
Correct choice

## Choice D
Fourth choice

## Choice E
Fifth choice

# Explanation
Explanation text that teaches the concept.

# Verification Notes
- Answer evidence: reviewer checked the math
- Originality notes: rewritten
- Reviewer decision: pending
`;

describe("candidate markdown parser", () => {
  it("parses frontmatter lists and body sections", () => {
    const candidate = parseCandidateMarkdown(sample, "sample.md");

    expect(candidate.frontmatter.topic).toBe("product_analytics");
    expect(candidate.frontmatter.conceptTags).toEqual(["activation", "cohorts"]);
    expect(candidate.prompt).toContain("PM scenario");
    expect(candidate.choices.C).toBe("Correct choice");
    expect(candidate.explanation).toContain("teaches");
    expect(candidate.verificationNotes).toContain("reviewer checked");
  });

  it("serializes back to parseable markdown", () => {
    const first = parseCandidateMarkdown(sample, "sample.md");
    const serialized = serializeCandidateMarkdown(first);
    const second = parseCandidateMarkdown(serialized, "sample.md");

    expect(second.frontmatter).toEqual(first.frontmatter);
    expect(second.choices).toEqual(first.choices);
    expect(second.explanation).toBe(first.explanation);
  });
});
