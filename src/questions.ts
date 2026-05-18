import type { ChoiceId, Question, Topic } from "./types";

export const TOPIC_LABELS: Record<Topic, string> = {
  product_analytics: "Product Analytics",
  data_literacy: "Data Literacy",
  chart_interpretation: "Chart Interpretation",
  inductive_reasoning: "Inductive Reasoning",
  data_interpretation: "Data Interpretation",
  ab_testing: "A/B Testing",
};

export const TOPIC_ORDER: Topic[] = [
  "product_analytics",
  "data_literacy",
  "chart_interpretation",
  "inductive_reasoning",
  "data_interpretation",
  "ab_testing",
];

export const FULL_MOCK_DISTRIBUTION: Record<Topic, number> = {
  product_analytics: 4,
  data_literacy: 3,
  chart_interpretation: 4,
  inductive_reasoning: 3,
  data_interpretation: 4,
  ab_testing: 3,
};

export const QUESTIONS: Question[] = [
  {
    id: "pa-001",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "A signup funnel is stable at visit-to-start, but start-to-verified drops from 58% to 41% after email verification changes. What should the PM investigate first?",
    choices: [
      { id: "A", text: "Increase paid acquisition to replace lost signups." },
      { id: "B", text: "Check verification email delivery, latency, and error logs." },
      { id: "C", text: "Redesign the pricing page because fewer users are converting." },
      { id: "D", text: "Change the North Star metric to verified users." },
      { id: "E", text: "Survey churned customers about long-term retention." },
    ],
    correctChoiceId: "B",
    explanation:
      "The drop starts exactly at the verification step after a related product change. Diagnose that step before changing acquisition, pricing, or retention tactics.",
    conceptTags: ["funnel-diagnosis", "activation"],
    estimatedSeconds: 60,
  },
  {
    id: "pa-002",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "DAU is up 25% month over month, but week-4 retention fell from 32% to 21%. Which interpretation is most likely?",
    choices: [
      { id: "A", text: "The product is healthier because DAU is the larger metric." },
      { id: "B", text: "Retention cannot be compared when acquisition changes." },
      { id: "C", text: "Acquisition growth may be masking weaker new-user retention." },
      { id: "D", text: "The team should ignore cohorts and focus on total active users." },
      { id: "E", text: "The product has reached market saturation." },
    ],
    correctChoiceId: "C",
    explanation:
      "Aggregate DAU can rise when more new users enter the product, even if those users retain worse. Cohort retention separates acquisition volume from product stickiness.",
    conceptTags: ["cohort-retention", "aggregate-vs-cohort"],
    estimatedSeconds: 75,
  },
  {
    id: "pa-003",
    topic: "product_analytics",
    difficulty: "easy",
    prompt:
      "For a B2B analytics tool whose value comes from teams making recurring decisions, which metric is the best North Star candidate?",
    choices: [
      { id: "A", text: "Total registered accounts." },
      { id: "B", text: "Monthly dashboards created and viewed by at least two teammates." },
      { id: "C", text: "Number of help-center articles published." },
      { id: "D", text: "Website visits from paid search." },
      { id: "E", text: "Total emails sent by marketing." },
    ],
    correctChoiceId: "B",
    explanation:
      "A useful North Star should reflect delivered customer value. Collaborative dashboard creation and viewing is closer to recurring team decision-making than accounts or acquisition inputs.",
    conceptTags: ["north-star", "value-metric"],
    estimatedSeconds: 60,
  },
  {
    id: "pa-004",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "A new recommendation module has 70% adoption, but overall checkout conversion is down 4%. What is the best next analysis?",
    choices: [
      { id: "A", text: "Declare the module successful because adoption is high." },
      { id: "B", text: "Remove checkout because it is the metric that declined." },
      { id: "C", text: "Compare checkout conversion for exposed and unexposed users, with guardrails by segment." },
      { id: "D", text: "Switch the metric from conversion to page views." },
      { id: "E", text: "Wait one quarter before looking at any data." },
    ],
    correctChoiceId: "C",
    explanation:
      "Adoption says users interacted with the module, not whether it improved business outcomes. Segmenting exposed versus unexposed users and checking guardrails helps locate the impact.",
    conceptTags: ["feature-adoption", "guardrail-metrics"],
    estimatedSeconds: 75,
  },
  {
    id: "pa-005",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "Activation rose from 44% to 51%, but paid conversion did not move. Which metric-tree question should come next?",
    choices: [
      { id: "A", text: "Did activated users reach the behaviors that predict paid conversion?" },
      { id: "B", text: "Did the team publish enough release notes?" },
      { id: "C", text: "Can the sales team call every new user?" },
      { id: "D", text: "Should paid conversion be removed from the dashboard?" },
      { id: "E", text: "Should activation be counted as a paid subscription?" },
    ],
    correctChoiceId: "A",
    explanation:
      "A metric tree asks how one metric should drive another. If activation improves but paid conversion does not, inspect whether the activated behavior is meaningful or too shallow.",
    conceptTags: ["metric-tree", "activation-quality"],
    estimatedSeconds: 75,
  },
  {
    id: "dl-001",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "An experiment lift is reported as +2.0 percentage points with a 95% confidence interval from +0.4 to +3.6 points. What does that imply?",
    choices: [
      { id: "A", text: "There is a 95% chance the true lift is exactly +2.0 points." },
      { id: "B", text: "The interval is consistent with a positive lift, but the exact size is uncertain." },
      { id: "C", text: "The result proves every segment improved." },
      { id: "D", text: "The test is invalid because the interval is wider than one point." },
      { id: "E", text: "The PM should ignore the result because confidence intervals are not useful." },
    ],
    correctChoiceId: "B",
    explanation:
      "A confidence interval gives a plausible range for the effect under the test assumptions. This interval is above zero, but it still leaves uncertainty about effect size.",
    conceptTags: ["confidence-interval", "effect-size"],
    estimatedSeconds: 75,
  },
  {
    id: "dl-002",
    topic: "data_literacy",
    difficulty: "easy",
    prompt:
      "A landing page shows 6 conversions from 20 visitors on Monday and 44 conversions from 400 visitors on Tuesday. Why is Monday's 30% rate risky to overinterpret?",
    choices: [
      { id: "A", text: "Monday has a small sample, so the rate has high variance." },
      { id: "B", text: "Conversion rates cannot be compared across days." },
      { id: "C", text: "Tuesday must be worse because it has more visitors." },
      { id: "D", text: "Raw conversion count is always better than conversion rate." },
      { id: "E", text: "A 30% rate means the page has product-market fit." },
    ],
    correctChoiceId: "A",
    explanation:
      "Small samples can produce noisy rates. Monday's 6 conversions out of 20 visitors is too thin to treat as a stable estimate without more data.",
    conceptTags: ["sample-size", "variance"],
    estimatedSeconds: 60,
  },
  {
    id: "dl-003",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "Average order value rose from $42 to $57 after one enterprise customer placed a $20,000 order. What should the PM check before claiming broad improvement?",
    choices: [
      { id: "A", text: "The median and distribution of order values." },
      { id: "B", text: "Only the highest order value." },
      { id: "C", text: "Whether the logo color changed." },
      { id: "D", text: "The number of app store reviews." },
      { id: "E", text: "The average without any context because averages are robust." },
    ],
    correctChoiceId: "A",
    explanation:
      "A large outlier can move the mean while typical user behavior is unchanged. Median, percentiles, and distribution reveal whether the shift is broad or outlier-driven.",
    conceptTags: ["outliers", "average-vs-median"],
    estimatedSeconds: 60,
  },
  {
    id: "dl-004",
    topic: "data_literacy",
    difficulty: "hard",
    prompt:
      "Channel A converts at 8% on 100 visits. Channel B converts at 3% on 900 visits. What is the blended conversion rate?",
    choices: [
      { id: "A", text: "5.5%, the simple average of 8% and 3%." },
      { id: "B", text: "3.5%, because total conversions are 35 out of 1,000." },
      { id: "C", text: "8.0%, because Channel A has the better rate." },
      { id: "D", text: "3.0%, because Channel B has more traffic." },
      { id: "E", text: "11.0%, because the two rates should be added." },
    ],
    correctChoiceId: "B",
    explanation:
      "Weighted averages use traffic volume. Channel A has 8 conversions and Channel B has 27, for 35 conversions out of 1,000 visits.",
    conceptTags: ["weighted-average", "conversion-rate"],
    estimatedSeconds: 75,
  },
  {
    id: "dl-005",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "A fraud model flags 90% of fraudulent transactions, but fraud is only 1% of all transactions. What must the PM consider before celebrating a high alert count?",
    choices: [
      { id: "A", text: "Base rates and the false positive burden on operations." },
      { id: "B", text: "Only the model's true positive rate." },
      { id: "C", text: "The app's color palette." },
      { id: "D", text: "Whether total transactions are growing." },
      { id: "E", text: "The number of engineers on the team." },
    ],
    correctChoiceId: "A",
    explanation:
      "When the underlying event is rare, even a strong detector can create many false positives. Base rates matter for operational cost and user impact.",
    conceptTags: ["base-rates", "false-positives"],
    estimatedSeconds: 75,
  },
  {
    id: "ci-001",
    topic: "chart_interpretation",
    difficulty: "easy",
    prompt:
      "A line chart shows conversion rising from 7.8% to 8.2%, but the y-axis starts at 7.5%. What should the PM be careful about?",
    choices: [
      { id: "A", text: "The truncated axis may visually exaggerate a small absolute change." },
      { id: "B", text: "The chart proves the change is statistically significant." },
      { id: "C", text: "The metric should be converted to cumulative users." },
      { id: "D", text: "The x-axis should always start at zero." },
      { id: "E", text: "Conversion charts cannot be trusted." },
    ],
    correctChoiceId: "A",
    explanation:
      "A narrow y-axis can make a small movement look dramatic. The PM should judge both the visual and the absolute change.",
    conceptTags: ["axis-scale", "absolute-vs-relative-change"],
    estimatedSeconds: 60,
  },
  {
    id: "ci-002",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "Cumulative signups rise every day, while daily new signups have fallen for two weeks. Which statement is most accurate?",
    choices: [
      { id: "A", text: "Growth is definitely accelerating because cumulative signups rise." },
      { id: "B", text: "Daily acquisition is weakening even though the cumulative line keeps increasing." },
      { id: "C", text: "The cumulative chart is invalid because it never goes down." },
      { id: "D", text: "Retention is improving because cumulative users rise." },
      { id: "E", text: "The team should hide daily signup charts." },
    ],
    correctChoiceId: "B",
    explanation:
      "Cumulative metrics naturally increase when new users are added. Daily new signups reveal the current acquisition pace and can decline while the cumulative total rises.",
    conceptTags: ["cumulative-vs-daily", "trend-reading"],
    estimatedSeconds: 60,
  },
  {
    id: "ci-003",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "A dual-axis chart shows ad spend and revenue moving together, but the axes use very different scales. What is the safest conclusion?",
    choices: [
      { id: "A", text: "Ad spend caused all revenue growth." },
      { id: "B", text: "The visual correlation is suggestive, but the PM needs a better causal analysis." },
      { id: "C", text: "Revenue would be zero without ads." },
      { id: "D", text: "Dual-axis charts always prove causality." },
      { id: "E", text: "The PM should stop measuring revenue." },
    ],
    correctChoiceId: "B",
    explanation:
      "Dual axes can make unrelated series look aligned. The chart can motivate investigation, but it does not prove causality.",
    conceptTags: ["dual-axis-chart", "correlation-vs-causation"],
    estimatedSeconds: 75,
  },
  {
    id: "ci-004",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "A weekly active users chart spikes every Monday and dips every Saturday. A campaign launched on a Monday. What should the PM do before crediting the campaign?",
    choices: [
      { id: "A", text: "Compare against normal weekday seasonality and prior Mondays." },
      { id: "B", text: "Credit the campaign because the launch day had a spike." },
      { id: "C", text: "Ignore the chart because seasonality is impossible to handle." },
      { id: "D", text: "Use cumulative users instead of weekly users." },
      { id: "E", text: "Move all launches to Saturdays." },
    ],
    correctChoiceId: "A",
    explanation:
      "The pattern already has weekday seasonality. Comparing the campaign Monday to prior Mondays helps distinguish normal rhythm from campaign impact.",
    conceptTags: ["seasonality", "campaign-analysis"],
    estimatedSeconds: 75,
  },
  {
    id: "ci-005",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "Support tickets doubled after traffic tripled. Which chart would best show whether the experience got worse?",
    choices: [
      { id: "A", text: "Tickets per 1,000 active users over time." },
      { id: "B", text: "Total tickets only." },
      { id: "C", text: "Total active users only." },
      { id: "D", text: "A pie chart of all-time tickets." },
      { id: "E", text: "Cumulative tickets since launch." },
    ],
    correctChoiceId: "A",
    explanation:
      "Counts can rise simply because traffic rises. A normalized rate, such as tickets per active users, shows whether the support burden worsened per user.",
    conceptTags: ["rate-vs-count", "normalization"],
    estimatedSeconds: 60,
  },
  {
    id: "ir-001",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "Interviews show new users understand the value. Analytics show 62% drop-off during account setup. Tickets mention verification emails arriving late. Which conclusion is best supported?",
    choices: [
      { id: "A", text: "The value proposition is unclear." },
      { id: "B", text: "Setup likely has an operational or delivery problem worth investigating." },
      { id: "C", text: "The team should redesign pricing first." },
      { id: "D", text: "Retention is the primary issue." },
      { id: "E", text: "Users are not in the target segment." },
    ],
    correctChoiceId: "B",
    explanation:
      "Multiple signals point to setup and verification, not value clarity or pricing. The best inference follows the repeated evidence.",
    conceptTags: ["evidence-based-inference", "activation-dropoff"],
    estimatedSeconds: 75,
  },
  {
    id: "ir-002",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "Three launches that added required profile fields reduced completion by 9%, 11%, and 10%. Two launches that removed required fields improved completion by 7% and 8%. What pattern is best supported?",
    choices: [
      { id: "A", text: "Required fields likely add onboarding friction." },
      { id: "B", text: "Profile quality is unrelated to onboarding." },
      { id: "C", text: "Completion always changes by exactly 10%." },
      { id: "D", text: "Removing fields always improves retention." },
      { id: "E", text: "The next launch should add more fields." },
    ],
    correctChoiceId: "A",
    explanation:
      "The repeated direction across similar launches supports a friction hypothesis. It does not prove every downstream metric improves or that the effect is always exact.",
    conceptTags: ["pattern-recognition", "onboarding-friction"],
    estimatedSeconds: 75,
  },
  {
    id: "ir-003",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "In a table, every segment with response time under 1 second has satisfaction above 80%. Every segment over 3 seconds has satisfaction below 55%. What is the strongest next hypothesis?",
    choices: [
      { id: "A", text: "Improving slow response times may improve satisfaction." },
      { id: "B", text: "Satisfaction causes faster response times." },
      { id: "C", text: "Pricing is definitely too high." },
      { id: "D", text: "Response time is irrelevant." },
      { id: "E", text: "All users behave identically." },
    ],
    correctChoiceId: "A",
    explanation:
      "The pattern supports response time as a plausible driver to investigate. It is a hypothesis, not proof of causation.",
    conceptTags: ["hypothesis-generation", "pattern-inference"],
    estimatedSeconds: 75,
  },
  {
    id: "ir-004",
    topic: "inductive_reasoning",
    difficulty: "hard",
    prompt:
      "A PM compares plans: Basic users mostly ask for export, Pro users ask for collaboration, and Enterprise users ask for permissions. What product inference is most reasonable?",
    choices: [
      { id: "A", text: "Different segments likely have different job-to-be-done maturity." },
      { id: "B", text: "All plans need the same next feature." },
      { id: "C", text: "Enterprise users do not care about collaboration." },
      { id: "D", text: "Basic users should be removed from the product." },
      { id: "E", text: "Requests prove which feature will increase revenue most." },
    ],
    correctChoiceId: "A",
    explanation:
      "The request pattern suggests different maturity and use cases by segment. It should inform prioritization, but requests alone do not prove revenue impact.",
    conceptTags: ["segmentation", "jobs-to-be-done"],
    estimatedSeconds: 75,
  },
  {
    id: "ir-005",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "A sequence of weekly trial-to-paid rates is 12%, 13%, 13%, 19%, 20%, 20%. The pricing page changed before week 4. What is the best inference?",
    choices: [
      { id: "A", text: "The pricing-page change may be related to the level shift and should be investigated." },
      { id: "B", text: "The rate will rise forever." },
      { id: "C", text: "The first three weeks are invalid." },
      { id: "D", text: "The product has no seasonality." },
      { id: "E", text: "The pricing page definitely caused the change." },
    ],
    correctChoiceId: "A",
    explanation:
      "The rate appears to shift upward after the change, which supports investigation. Observational timing alone does not prove causation.",
    conceptTags: ["level-shift", "causal-caution"],
    estimatedSeconds: 75,
  },
  {
    id: "di-001",
    topic: "data_interpretation",
    difficulty: "hard",
    prompt:
      "Overall conversion rose from 5.0% to 5.4%, but mobile fell from 4.0% to 3.5% and desktop fell from 8.0% to 7.6%. What likely explains the overall rise?",
    choices: [
      { id: "A", text: "Traffic mix shifted toward the higher-converting desktop segment." },
      { id: "B", text: "Both segments improved." },
      { id: "C", text: "The data proves mobile caused desktop to decline." },
      { id: "D", text: "Conversion rates cannot be segmented." },
      { id: "E", text: "The overall rate is always the only metric that matters." },
    ],
    correctChoiceId: "A",
    explanation:
      "This is a segment-mix pattern consistent with Simpson's paradox: each segment worsened, but the aggregate improved because more traffic moved to a higher-rate segment.",
    conceptTags: ["simpsons-paradox", "segment-mix"],
    estimatedSeconds: 90,
  },
  {
    id: "di-002",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A campaign week has revenue 18% above baseline, but the same week last year was 20% above baseline without a campaign. What should the PM conclude first?",
    choices: [
      { id: "A", text: "Seasonality may explain the lift, so use a stronger comparison." },
      { id: "B", text: "The campaign definitely caused the entire lift." },
      { id: "C", text: "The campaign hurt revenue because 18 is less than 20." },
      { id: "D", text: "Year-over-year comparisons are never useful." },
      { id: "E", text: "Revenue should not be used in campaign analysis." },
    ],
    correctChoiceId: "A",
    explanation:
      "A similar historical seasonal lift weakens a simple before-after claim. The PM needs a better counterfactual, such as matched periods or a holdout.",
    conceptTags: ["seasonality", "counterfactual"],
    estimatedSeconds: 75,
  },
  {
    id: "di-003",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A table shows Enterprise has 2,000 users and $400 ARPU, SMB has 20,000 users and $45 ARPU, and Consumer has 200,000 users and $4 ARPU. Which opportunity should be prioritized from this table alone?",
    choices: [
      { id: "A", text: "None automatically; estimate impact, confidence, effort, and strategic fit." },
      { id: "B", text: "Enterprise because ARPU is highest." },
      { id: "C", text: "Consumer because user count is highest." },
      { id: "D", text: "SMB because it is in the middle." },
      { id: "E", text: "Delete the lowest ARPU segment immediately." },
    ],
    correctChoiceId: "A",
    explanation:
      "A table can frame the opportunity, but prioritization needs impact potential, confidence, effort, and strategic context. Highest ARPU or volume alone is insufficient.",
    conceptTags: ["prioritization", "table-reading"],
    estimatedSeconds: 75,
  },
  {
    id: "di-004",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "Monthly churn count increased from 500 to 650 while active customers grew from 10,000 to 15,000. What happened to churn rate?",
    choices: [
      { id: "A", text: "It decreased from 5.0% to about 4.3%." },
      { id: "B", text: "It increased from 5.0% to 6.5%." },
      { id: "C", text: "It stayed exactly the same." },
      { id: "D", text: "It cannot be calculated with these numbers." },
      { id: "E", text: "It became 30% because churn count rose by 30%." },
    ],
    correctChoiceId: "A",
    explanation:
      "Churn rate uses churn divided by the active base. 500/10,000 is 5.0%; 650/15,000 is roughly 4.3%, so the rate fell despite a higher count.",
    conceptTags: ["rate-vs-count", "denominator"],
    estimatedSeconds: 75,
  },
  {
    id: "di-005",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A usage table shows 5% of users create 70% of projects. What is the best PM interpretation?",
    choices: [
      { id: "A", text: "Power users drive most creation; inspect whether the product serves both power and casual users well." },
      { id: "B", text: "The data must be wrong because usage should be evenly distributed." },
      { id: "C", text: "Casual users have no value and should be blocked." },
      { id: "D", text: "The average projects per user is enough to understand behavior." },
      { id: "E", text: "Project creation is unrelated to product value." },
    ],
    correctChoiceId: "A",
    explanation:
      "A skewed distribution means averages can hide different user groups. The PM should understand power-user value and casual-user activation separately.",
    conceptTags: ["distribution", "power-users"],
    estimatedSeconds: 75,
  },
  {
    id: "ab-001",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "A checkout test shows +3.2% conversion with p=0.04, but treatment has 18% fewer users than control. What should the PM do first?",
    choices: [
      { id: "A", text: "Ship the variant because p < 0.05." },
      { id: "B", text: "Check for sample ratio mismatch before making a decision." },
      { id: "C", text: "Extend the test until conversion lift reaches 5%." },
      { id: "D", text: "Switch the primary metric to revenue per visitor." },
      { id: "E", text: "Ignore the issue because conversion is statistically significant." },
    ],
    correctChoiceId: "B",
    explanation:
      "Unexpected assignment imbalance can indicate sample ratio mismatch and invalidate the test. Investigate assignment, logging, or eligibility issues before trusting the p-value.",
    conceptTags: ["sample-ratio-mismatch", "experiment-validity"],
    estimatedSeconds: 75,
  },
  {
    id: "ab-002",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "A variant increases signup conversion by 4%, but support tickets per signup rise by 35%. What is the best decision posture?",
    choices: [
      { id: "A", text: "Ship immediately because the primary metric improved." },
      { id: "B", text: "Review the guardrail regression before deciding whether the lift is worth it." },
      { id: "C", text: "Ignore support tickets because they are not revenue." },
      { id: "D", text: "Declare the test inconclusive because any guardrail movement invalidates it." },
      { id: "E", text: "Change the primary metric after seeing the result." },
    ],
    correctChoiceId: "B",
    explanation:
      "Guardrails exist to catch harmful side effects. A primary metric lift can still be a bad tradeoff if support burden or user experience worsens materially.",
    conceptTags: ["guardrail-metrics", "decision-tradeoff"],
    estimatedSeconds: 75,
  },
  {
    id: "ab-003",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "A test with 400 users per arm shows +6% lift but p=0.18. The planned sample was 3,000 per arm. What should the PM say?",
    choices: [
      { id: "A", text: "The test proves there is no effect." },
      { id: "B", text: "The result is not significant yet; continue if the test design is still valid." },
      { id: "C", text: "Ship because +6% is large." },
      { id: "D", text: "Stop and restart every day until p < 0.05." },
      { id: "E", text: "Lower the confidence level after seeing the data." },
    ],
    correctChoiceId: "B",
    explanation:
      "The test is under its planned sample size, so non-significance does not prove no effect. Continue according to the preplanned design if there are no validity issues.",
    conceptTags: ["power", "sample-size", "early-read"],
    estimatedSeconds: 75,
  },
  {
    id: "ab-004",
    topic: "ab_testing",
    difficulty: "hard",
    prompt:
      "A test detects +0.1% conversion lift with p=0.01, but engineering estimates two months of cleanup work to ship. What matters most next?",
    choices: [
      { id: "A", text: "Business significance and opportunity cost, not only statistical significance." },
      { id: "B", text: "The p-value alone, because p=0.01 always means ship." },
      { id: "C", text: "Whether the test ran on a Tuesday." },
      { id: "D", text: "Changing the metric to make the lift larger." },
      { id: "E", text: "Ignoring engineering effort because users do not see it." },
    ],
    correctChoiceId: "A",
    explanation:
      "A statistically reliable effect can still be too small to justify cost. PM decisions require business significance, effort, and opportunity cost.",
    conceptTags: ["business-significance", "opportunity-cost"],
    estimatedSeconds: 75,
  },
  {
    id: "ab-005",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "A redesign test is strongly positive in the first two days, then trends back toward neutral by day 14. What risk should the PM consider?",
    choices: [
      { id: "A", text: "Novelty effect or early stopping bias." },
      { id: "B", text: "Sample ratio mismatch is impossible after day two." },
      { id: "C", text: "The first two days are always the only reliable data." },
      { id: "D", text: "The redesign should be shipped before users adapt." },
      { id: "E", text: "Longer tests always create false results." },
    ],
    correctChoiceId: "A",
    explanation:
      "New UI can temporarily change behavior because it is novel. Waiting for the planned duration helps avoid early stopping and novelty-driven decisions.",
    conceptTags: ["novelty-effect", "early-stopping"],
    estimatedSeconds: 75,
  },
];

function validateQuestionBank(questions: Question[]) {
  for (const question of questions) {
    const choiceIds = question.choices.map((choice) => choice.id);
    const uniqueChoiceIds = new Set<ChoiceId>(choiceIds);

    if (question.choices.length !== 5 || uniqueChoiceIds.size !== 5) {
      console.warn(`Question ${question.id} must have exactly five unique choices.`);
    }

    if (!uniqueChoiceIds.has(question.correctChoiceId)) {
      console.warn(`Question ${question.id} has a missing correct choice.`);
    }

    if (!question.explanation || question.conceptTags.length === 0 || question.estimatedSeconds <= 0) {
      console.warn(`Question ${question.id} is missing required review metadata.`);
    }
  }
}

validateQuestionBank(QUESTIONS);
