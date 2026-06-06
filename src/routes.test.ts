import { describe, expect, it } from "vitest";
import { TOPIC_LABELS, TOPIC_ORDER } from "./questions";
import {
  parseRoute,
  pathForRoute,
  titleForRoute,
  topicFromSlug,
  topicToSlug,
} from "./routes";
import type { FeedbackMode, Topic } from "./types";

const expectedTopicSlugs: Record<Topic, string> = {
  product_analytics: "product-analytics",
  data_literacy: "data-literacy",
  chart_interpretation: "chart-interpretation",
  inductive_reasoning: "inductive-reasoning",
  data_interpretation: "data-interpretation",
  ab_testing: "ab-testing",
};

describe("route helpers", () => {
  it("converts topics to stable route slugs", () => {
    for (const topic of TOPIC_ORDER) {
      expect(topicToSlug(topic)).toBe(expectedTopicSlugs[topic]);
    }
  });

  it("converts route slugs back to topics", () => {
    for (const topic of TOPIC_ORDER) {
      expect(topicFromSlug(expectedTopicSlugs[topic])).toBe(topic);
    }
  });

  it("parses every canonical assessment route", () => {
    const feedbackModes: FeedbackMode[] = ["exam", "practice"];

    for (const feedbackMode of feedbackModes) {
      expect(parseRoute(`/full-mock/${feedbackMode}`)).toEqual({
        route: { kind: "assessment", mode: "full_mock", feedbackMode },
        canonicalPath: `/full-mock/${feedbackMode}`,
      });
    }

    for (const topic of TOPIC_ORDER) {
      for (const feedbackMode of feedbackModes) {
        const slug = expectedTopicSlugs[topic];

        expect(parseRoute(`/topic-drill/${slug}/${feedbackMode}`)).toEqual({
          route: { kind: "assessment", mode: "topic_drill", topic, feedbackMode },
          canonicalPath: `/topic-drill/${slug}/${feedbackMode}`,
        });
      }
    }
  });

  it("parses non-assessment canonical routes", () => {
    expect(parseRoute("/")).toEqual({
      route: { kind: "home" },
      canonicalPath: "/",
    });
    expect(parseRoute("/frameworks")).toEqual({
      route: { kind: "frameworks" },
      canonicalPath: "/frameworks",
    });
    expect(parseRoute("/shared-review")).toEqual({
      route: { kind: "sharedReview" },
      canonicalPath: "/shared-review",
    });
    expect(parseRoute("/results/attempt-123")).toEqual({
      route: { kind: "results", attemptId: "attempt-123" },
      canonicalPath: "/results/attempt-123",
    });
  });

  it("normalizes shorthand routes to their canonical paths", () => {
    expect(parseRoute("/full-mock")).toEqual({
      route: { kind: "assessment", mode: "full_mock", feedbackMode: "exam" },
      canonicalPath: "/full-mock/exam",
    });

    expect(parseRoute("/topic-drill/product-analytics")).toEqual({
      route: {
        kind: "assessment",
        mode: "topic_drill",
        topic: "product_analytics",
        feedbackMode: "practice",
      },
      canonicalPath: "/topic-drill/product-analytics/practice",
    });

    expect(parseRoute("/results", { latestAttemptId: "attempt-latest" })).toEqual({
      route: { kind: "results", attemptId: "attempt-latest" },
      canonicalPath: "/results/attempt-latest",
    });
  });

  it("falls back cleanly for unknown routes and topics", () => {
    expect(parseRoute("/something-else")).toEqual({
      route: { kind: "home" },
      canonicalPath: "/",
      message: "unknown_route",
    });

    expect(parseRoute("/topic-drill/not-real/practice")).toEqual({
      route: { kind: "home" },
      canonicalPath: "/",
      message: "unknown_topic",
    });

    expect(parseRoute("/results")).toEqual({
      route: { kind: "home" },
      canonicalPath: "/",
    });
  });

  it("builds canonical paths and route titles", () => {
    expect(pathForRoute({ kind: "home" })).toBe("/");
    expect(pathForRoute({ kind: "frameworks" })).toBe("/frameworks");
    expect(pathForRoute({ kind: "sharedReview" })).toBe("/shared-review");
    expect(pathForRoute({ kind: "results", attemptId: "attempt-123" })).toBe(
      "/results/attempt-123"
    );
    expect(
      pathForRoute({ kind: "assessment", mode: "full_mock", feedbackMode: "practice" })
    ).toBe("/full-mock/practice");
    expect(
      pathForRoute({
        kind: "assessment",
        mode: "topic_drill",
        topic: "ab_testing",
        feedbackMode: "exam",
      })
    ).toBe("/topic-drill/ab-testing/exam");

    expect(titleForRoute({ kind: "home" })).toBe("PM Bench");
    expect(
      titleForRoute({ kind: "assessment", mode: "full_mock", feedbackMode: "exam" })
    ).toBe("Full Mock - Exam | PM Bench");
    expect(
      titleForRoute({
        kind: "assessment",
        mode: "topic_drill",
        topic: "data_interpretation",
        feedbackMode: "practice",
      })
    ).toBe(`${TOPIC_LABELS.data_interpretation} Drill - Practice | PM Bench`);
    expect(titleForRoute({ kind: "frameworks" })).toBe("Frameworks | PM Bench");
    expect(titleForRoute({ kind: "sharedReview" })).toBe("Shared Review | PM Bench");
    expect(titleForRoute({ kind: "results", attemptId: "attempt-123" })).toBe(
      "Results | PM Bench"
    );
  });
});
