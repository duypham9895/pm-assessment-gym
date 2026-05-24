import { TOPIC_LABELS } from "./questions";
import type { FeedbackMode, SessionMode, Topic } from "./types";

export type AppRoute =
  | { kind: "home" }
  | {
      kind: "assessment";
      mode: SessionMode;
      feedbackMode: FeedbackMode;
      topic?: Topic;
    }
  | { kind: "frameworks" }
  | { kind: "results"; attemptId: string };

export type ParsedRoute = {
  route: AppRoute;
  canonicalPath: string;
  message?: "unknown_route" | "unknown_topic" | "missing_result";
};

const TOPIC_SLUGS: Record<Topic, string> = {
  product_analytics: "product-analytics",
  data_literacy: "data-literacy",
  chart_interpretation: "chart-interpretation",
  inductive_reasoning: "inductive-reasoning",
  data_interpretation: "data-interpretation",
  ab_testing: "ab-testing",
};

const SLUG_TO_TOPIC = Object.fromEntries(
  Object.entries(TOPIC_SLUGS).map(([topic, slug]) => [slug, topic])
) as Record<string, Topic>;

function feedbackModeFromSlug(slug?: string): FeedbackMode | undefined {
  if (slug === "exam" || slug === "practice") return slug;
  return undefined;
}

function canonicalPathname(pathname: string) {
  const withoutQuery = pathname.split("?")[0]?.split("#")[0] ?? "/";
  if (withoutQuery === "") return "/";
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  if (withLeadingSlash === "/") return "/";
  return withLeadingSlash.replace(/\/+$/g, "");
}

function decodeSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function homeFallback(message?: ParsedRoute["message"]): ParsedRoute {
  return {
    route: { kind: "home" },
    canonicalPath: "/",
    ...(message ? { message } : {}),
  };
}

export function topicToSlug(topic: Topic): string {
  return TOPIC_SLUGS[topic];
}

export function topicFromSlug(slug: string): Topic | undefined {
  return SLUG_TO_TOPIC[slug];
}

export function pathForRoute(route: AppRoute): string {
  if (route.kind === "home") return "/";
  if (route.kind === "frameworks") return "/frameworks";
  if (route.kind === "results") return `/results/${encodeURIComponent(route.attemptId)}`;

  if (route.mode === "full_mock") {
    return `/full-mock/${route.feedbackMode}`;
  }

  return `/topic-drill/${topicToSlug(route.topic ?? "product_analytics")}/${
    route.feedbackMode
  }`;
}

export function parseRoute(
  pathname: string,
  options?: { latestAttemptId?: string }
): ParsedRoute {
  const normalizedPath = canonicalPathname(pathname);
  const segments = normalizedPath.split("/").filter(Boolean).map(decodeSegment);

  if (segments.length === 0) {
    return { route: { kind: "home" }, canonicalPath: "/" };
  }

  if (segments.length === 1 && segments[0] === "frameworks") {
    return { route: { kind: "frameworks" }, canonicalPath: "/frameworks" };
  }

  if (segments[0] === "full-mock") {
    if (segments.length === 1) {
      const route: AppRoute = {
        kind: "assessment",
        mode: "full_mock",
        feedbackMode: "exam",
      };
      return { route, canonicalPath: pathForRoute(route) };
    }

    const feedbackMode = feedbackModeFromSlug(segments[1]);
    if (segments.length === 2 && feedbackMode) {
      const route: AppRoute = {
        kind: "assessment",
        mode: "full_mock",
        feedbackMode,
      };
      return { route, canonicalPath: pathForRoute(route) };
    }

    return homeFallback("unknown_route");
  }

  if (segments[0] === "topic-drill") {
    const topicSlug = segments[1];
    const topic = topicSlug ? topicFromSlug(topicSlug) : undefined;

    if (!topic) {
      return homeFallback("unknown_topic");
    }

    if (segments.length === 2) {
      const route: AppRoute = {
        kind: "assessment",
        mode: "topic_drill",
        topic,
        feedbackMode: "practice",
      };
      return { route, canonicalPath: pathForRoute(route) };
    }

    const feedbackMode = feedbackModeFromSlug(segments[2]);
    if (segments.length === 3 && feedbackMode) {
      const route: AppRoute = {
        kind: "assessment",
        mode: "topic_drill",
        topic,
        feedbackMode,
      };
      return { route, canonicalPath: pathForRoute(route) };
    }

    return homeFallback("unknown_route");
  }

  if (segments[0] === "results") {
    if (segments.length === 1) {
      if (!options?.latestAttemptId) return homeFallback();

      const route: AppRoute = {
        kind: "results",
        attemptId: options.latestAttemptId,
      };
      return { route, canonicalPath: pathForRoute(route) };
    }

    if (segments.length === 2 && segments[1]) {
      const route: AppRoute = {
        kind: "results",
        attemptId: segments[1],
      };
      return { route, canonicalPath: pathForRoute(route) };
    }

    return homeFallback("unknown_route");
  }

  return homeFallback("unknown_route");
}

export function titleForRoute(route: AppRoute): string {
  if (route.kind === "home") return "PM Assessment Gym";
  if (route.kind === "frameworks") return "Frameworks | PM Assessment Gym";
  if (route.kind === "results") return "Results | PM Assessment Gym";

  const feedbackLabel = route.feedbackMode === "exam" ? "Exam" : "Practice";
  if (route.mode === "full_mock") {
    return `Full Mock - ${feedbackLabel} | PM Assessment Gym`;
  }

  return `${TOPIC_LABELS[route.topic ?? "product_analytics"]} Drill - ${feedbackLabel} | PM Assessment Gym`;
}
