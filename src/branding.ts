export const APP_NAME = "PM Bench";
export const APP_TAGLINE =
  "Timed drills, weak-topic review, and framework refresh for PM assessments";
export const APP_DOMAIN = "pmbench.duypham.me";
export const APP_URL = `https://${APP_DOMAIN}`;

export const LEGACY_APP_NAMES = ["PM Assessment Gym"] as const;
export type SupportedAppName = typeof APP_NAME | (typeof LEGACY_APP_NAMES)[number];

export function isSupportedAppName(value: unknown): value is SupportedAppName {
  return typeof value === "string" && [APP_NAME, ...LEGACY_APP_NAMES].includes(value);
}
