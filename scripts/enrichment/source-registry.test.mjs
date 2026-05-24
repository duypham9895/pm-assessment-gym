import { describe, expect, it } from "vitest";
import { parseSourceRegistry } from "./source-registry.mjs";

const registry = `# PM Assessment Source Registry

| id | status | source | url | harvestPolicy | fit | topicSignals | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| meta-pm-guide | active | Meta PM Interview Prep Guide | https://example.com/meta.pdf | rubric_only | high | product_analytics, data_interpretation | Use format only. |
| blocked-source | rejected | Blocked | https://example.com/blocked | metadata_only | low | general | Do not use. |
`;

describe("source registry", () => {
  it("parses active sources and topic signals", () => {
    const sources = parseSourceRegistry(registry);

    expect(sources).toHaveLength(2);
    expect(sources[0]).toMatchObject({
      id: "meta-pm-guide",
      status: "active",
      harvestPolicy: "rubric_only",
      fit: "high",
    });
    expect(sources[0].topicSignals).toEqual(["product_analytics", "data_interpretation"]);
  });

  it("marks crawlable sources conservatively", () => {
    const sources = parseSourceRegistry(registry);

    expect(sources[0].canFetch).toBe(true);
    expect(sources[0].canStoreQuestionText).toBe(false);
    expect(sources[1].canFetch).toBe(false);
  });
});
