export const FRAMEWORKS_MARKDOWN = `
# PM Assessment Frameworks

## Funnel Diagnosis
- Find the first funnel step that changed: visit, signup, activation, purchase, repeat.
- Compare rates before counts; denominator changes can hide the real issue.
- Segment by platform, geography, acquisition channel, and user cohort.

## Cohort Retention
- Compare users by start period, not only total active users.
- Separate acquisition growth from retained usage.
- Ask whether newer cohorts are healthier or weaker than older cohorts.

## A/B Testing
- Start with hypothesis, primary metric, guardrails, sample size, and decision rule.
- Check sample ratio mismatch before trusting p-values.
- Separate statistical significance from business significance.

## MDE And Power
- Small effects require larger samples.
- An underpowered test can miss a real effect.
- Choose MDE based on business relevance, not only what is easy to detect.

## Sample Ratio Mismatch
- Treatment and control traffic should match the planned split within expected noise.
- SRM can indicate assignment, eligibility, logging, or filtering bugs.
- Investigate SRM before interpreting lift, p-values, or segment cuts.

## Simpson's Paradox
- Overall trends can reverse inside important segments.
- Always compare segment mix before making a causal claim.
- Do not trust aggregate conversion if traffic composition changed.

## Base Rates
- Rare events can create many false positives even with good detectors.
- Convert percentages into counts to understand operational impact.
- Ask what the normal rate is before calling a result large.

## Chart Reading
- Check axes, units, time range, and whether the metric is cumulative or period-based.
- Normalize counts into rates when traffic changes.
- Watch for dual-axis charts that imply causality through visual alignment.

## Metric Trees
- Tie a top metric to input metrics the team can influence.
- If an input improves but the top metric does not, check whether the input is too shallow.
- Use metric trees to focus diagnosis, not to pretend one metric explains everything.

## RICE And ICE Prioritization
- RICE: reach, impact, confidence, effort.
- ICE: impact, confidence, ease.
- Use these as conversation scaffolds; still name strategy, risk, and tradeoffs.
`;
