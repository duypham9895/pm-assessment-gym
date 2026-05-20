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

const SEED_QUESTIONS: Question[] = [
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

const CHOICE_ID_ORDER: ChoiceId[] = ["A", "B", "C", "D", "E"];

function makeQuestion(
  question: Omit<Question, "choices"> & { choices: Record<ChoiceId, string> }
): Question {
  return {
    ...question,
    choices: CHOICE_ID_ORDER.map((id) => ({ id, text: question.choices[id] })),
  };
}

const EXPANDED_QUESTIONS: Question[] = [
  makeQuestion({
    id: "pa-006",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "A freemium product defines activation as creating one project. Activated users still churn quickly unless they invite a teammate. What should the PM do next?",
    choices: {
      A: "Evaluate whether teammate invitation is a better activation milestone.",
      B: "Keep the activation metric unchanged because it already improved.",
      C: "Remove churn from the dashboard until activation stabilizes.",
      D: "Count every website visit as activation to grow the metric.",
      E: "Focus only on paid acquisition because activation is a product metric.",
    },
    correctChoiceId: "A",
    explanation:
      "Activation should represent the behavior that predicts retained value. If project creation is too shallow and invited teams retain better, the PM should test a deeper activation definition.",
    conceptTags: ["activation-quality", "retention-leading-indicator"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "pa-007",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "A marketplace adds guest checkout. Checkout completion rises, but repeat purchase rate falls for guest users. What should be analyzed first?",
    choices: {
      A: "Compare guest and account cohorts on repeat purchase, support issues, and lifetime value.",
      B: "Remove guest checkout immediately because one metric declined.",
      C: "Declare success because checkout completion is closest to revenue.",
      D: "Stop tracking repeat purchase for users who do not create accounts.",
      E: "Move the guest checkout button lower without measuring anything else.",
    },
    correctChoiceId: "A",
    explanation:
      "A PM should evaluate the tradeoff across the funnel and lifecycle. Guest checkout may improve short-term conversion while weakening downstream relationship or retention quality.",
    conceptTags: ["cohort-analysis", "lifecycle-metrics"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "pa-008",
    topic: "product_analytics",
    difficulty: "easy",
    prompt:
      "A food delivery app wants to measure whether users are getting reliable value. Which metric is the best input metric for the experience?",
    choices: {
      A: "Orders delivered on time and without refund requests.",
      B: "Total app installs from paid ads.",
      C: "Number of push notifications sent per week.",
      D: "Number of restaurants listed in the database.",
      E: "Total homepage page views.",
    },
    correctChoiceId: "A",
    explanation:
      "Reliable delivery is close to the customer value promise. Installs, notifications, listings, and page views can matter, but they are weaker indicators of fulfilled user value.",
    conceptTags: ["input-metric", "customer-value"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "pa-009",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "A team sees subscription revenue up 12%, but refunds are up 40% and trial-to-paid quality is lower. What is the best PM interpretation?",
    choices: {
      A: "Revenue is the only metric that matters, so the launch is cleanly successful.",
      B: "The revenue gain may be low quality and should be reviewed with guardrails.",
      C: "Refunds prove the product has no market fit.",
      D: "Trial-to-paid quality cannot be compared after a revenue increase.",
      E: "The PM should change the refund definition after the launch.",
    },
    correctChoiceId: "B",
    explanation:
      "Revenue growth can hide quality problems. Refunds and lower-quality conversions are guardrails that help decide whether growth is durable or harmful.",
    conceptTags: ["guardrail-metrics", "revenue-quality"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "pa-010",
    topic: "product_analytics",
    difficulty: "hard",
    prompt:
      "A consumer app has high day-1 retention from a viral feature, but day-30 retention is flat. Which question best tests whether the feature creates durable value?",
    choices: {
      A: "How many impressions did the launch announcement receive?",
      B: "Do users who repeat the feature in week 2 retain better by day 30?",
      C: "Was the feature name memorable in the press release?",
      D: "Can the team add more animations to increase day-1 usage?",
      E: "Did the app store ranking improve on launch day?",
    },
    correctChoiceId: "B",
    explanation:
      "Durable product value should show up in repeated behavior and later retention. A week-2 repeat usage cohort is more informative than launch attention or day-1 novelty.",
    conceptTags: ["retention", "repeat-behavior"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "pa-011",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "A funnel report shows product page views are stable, add-to-cart is stable, but payment success falls after a new payment provider launch. What should the PM prioritize?",
    choices: {
      A: "Redesign the product detail page because revenue declined.",
      B: "Increase discounting to offset failed payments.",
      C: "Investigate payment provider errors, declines, and latency by method.",
      D: "Remove add-to-cart from the funnel because it did not change.",
      E: "Stop the analysis because page views are stable.",
    },
    correctChoiceId: "C",
    explanation:
      "The first changed funnel step is payment success, and it changed after a related provider launch. The PM should diagnose that operational step before changing unrelated surfaces.",
    conceptTags: ["funnel-diagnosis", "payment-conversion"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "pa-012",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "A language app increases daily lesson starts by making lessons shorter, but total weekly learning minutes decline. What should the PM conclude?",
    choices: {
      A: "Shorter lessons are definitely bad and should be removed immediately.",
      B: "Lesson starts are always more important than total engagement.",
      C: "The metric improved may be too shallow; evaluate learning depth and retention.",
      D: "Weekly minutes should be hidden because it conflicts with starts.",
      E: "The app should count every notification as a lesson start.",
    },
    correctChoiceId: "C",
    explanation:
      "A higher start count can be misleading if each session is less valuable. The PM should connect the input metric to deeper engagement and learning outcomes.",
    conceptTags: ["metric-quality", "engagement-depth"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "pa-013",
    topic: "product_analytics",
    difficulty: "hard",
    prompt:
      "An acquisition campaign brings 50,000 new users at low CAC, but their 7-day retention is half the organic cohort. What analysis should come next?",
    choices: {
      A: "Scale the campaign because CAC is low.",
      B: "Stop all paid acquisition because one cohort retained worse.",
      C: "Blend all cohorts to avoid overreacting.",
      D: "Compare payback, retention, and downstream conversion by acquisition channel.",
      E: "Judge the campaign only by install volume.",
    },
    correctChoiceId: "D",
    explanation:
      "Low acquisition cost can still be poor business if users do not retain or monetize. Channel-level cohort economics clarify whether growth is efficient.",
    conceptTags: ["acquisition-quality", "cohort-economics"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "pa-014",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "A dashboard shows average sessions per user rose from 3.1 to 3.8, but the median stayed at 2. What is the most likely concern?",
    choices: {
      A: "The median is invalid because it did not increase.",
      B: "Average sessions cannot be used for product analytics.",
      C: "Every user became more engaged.",
      D: "A small group of heavy users may be driving the average increase.",
      E: "The product should stop tracking sessions.",
    },
    correctChoiceId: "D",
    explanation:
      "When the mean rises but the median does not, the change may be concentrated in the upper tail. Distribution and segment checks are needed before claiming broad engagement improvement.",
    conceptTags: ["distribution", "average-vs-median"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "pa-015",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "A B2B product has more workspaces created, but fewer workspaces reach three active members. Which metric should the PM emphasize?",
    choices: {
      A: "Total workspace creation only.",
      B: "Marketing site visits from all channels.",
      C: "Number of feature flags released.",
      D: "Workspaces reaching a collaborative activation threshold.",
      E: "Number of help articles updated.",
    },
    correctChoiceId: "D",
    explanation:
      "For collaborative products, value often appears when a team actually works together. Workspaces reaching an active-member threshold is a stronger activation metric than creation alone.",
    conceptTags: ["team-activation", "north-star-input"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "pa-016",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "A new personalization feature increases clicks on recommended items but decreases search usage and total purchases. What is the right PM concern?",
    choices: {
      A: "Recommendation clicks prove the feature is successful.",
      B: "Search usage should never be measured with recommendations.",
      C: "The team should optimize only the recommendation module.",
      D: "The feature may be cannibalizing or distracting from higher-intent behavior.",
      E: "Purchases are unrelated to recommendation quality.",
    },
    correctChoiceId: "D",
    explanation:
      "A local module metric can improve while the product outcome worsens. The PM should check whether recommendation clicks replace higher-intent paths or create distraction.",
    conceptTags: ["local-vs-global-metrics", "cannibalization"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "pa-017",
    topic: "product_analytics",
    difficulty: "easy",
    prompt:
      "A team wants to diagnose a sudden drop in booking conversion. Which first cut is most useful?",
    choices: {
      A: "Read the latest brand campaign copy.",
      B: "Ask executives which page they personally dislike.",
      C: "Compare total company revenue by quarter.",
      D: "Count how many engineers worked on the product.",
      E: "Break the booking funnel into step-level conversion before and after the drop.",
    },
    correctChoiceId: "E",
    explanation:
      "Step-level funnel conversion identifies where the drop begins. That narrows the investigation before opinions, broad revenue views, or unrelated team data distract the PM.",
    conceptTags: ["funnel-diagnosis", "step-conversion"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "pa-018",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "A messaging product's DAU rises after adding read receipts, but message sends per active user fall. What should the PM inspect?",
    choices: {
      A: "Only DAU, because it is growing.",
      B: "The number of colors used in the read receipt icon.",
      C: "App store rank on the launch day.",
      D: "Whether users opened the settings page.",
      E: "Whether read receipts changed user behavior, anxiety, or conversation depth.",
    },
    correctChoiceId: "E",
    explanation:
      "A usage count can rise while meaningful interaction falls. The PM should inspect behavior quality and potential side effects, not only the active-user aggregate.",
    conceptTags: ["engagement-quality", "behavior-change"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "pa-019",
    topic: "product_analytics",
    difficulty: "hard",
    prompt:
      "A SaaS team improves onboarding completion from 60% to 76%, but expansion revenue six months later is unchanged. What is the best next hypothesis?",
    choices: {
      A: "Onboarding completion is useless in every SaaS product.",
      B: "Expansion revenue cannot be influenced by product behavior.",
      C: "The team should stop measuring onboarding.",
      D: "The sales team caused the metric mismatch.",
      E: "The new completion event may not represent the actions that predict expansion.",
    },
    correctChoiceId: "E",
    explanation:
      "The completion metric may be too shallow or disconnected from later value. The PM should identify which onboarding behaviors predict expansion and refine the activation model.",
    conceptTags: ["activation-quality", "lagging-metric"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "pa-020",
    topic: "product_analytics",
    difficulty: "medium",
    prompt:
      "A checkout team celebrates fewer form errors, but conversion does not improve. Which product analytics question is most useful?",
    choices: {
      A: "Did the team rename the form fields?",
      B: "Can the form error metric be removed?",
      C: "Is conversion too hard to measure?",
      D: "Should every field be optional?",
      E: "Were the reduced errors on fields that previously blocked or discouraged purchase?",
    },
    correctChoiceId: "E",
    explanation:
      "Reducing errors matters most when those errors affect the user decision or completion path. The PM should connect the local quality metric to purchase behavior.",
    conceptTags: ["metric-tree", "conversion-drivers"],
    estimatedSeconds: 75,
  }),

  makeQuestion({
    id: "dl-006",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "A conversion rate rises from 10% to 12%. What is the relative lift?",
    choices: {
      A: "20%, because the rate increased by 2 points over a 10% baseline.",
      B: "2%, because 12 minus 10 equals 2.",
      C: "12%, because the new conversion rate is 12%.",
      D: "120%, because 12 is 120% of 10.",
      E: "The relative lift cannot be calculated from these numbers.",
    },
    correctChoiceId: "A",
    explanation:
      "The absolute change is 2 percentage points, while the relative lift is 2 divided by the 10% baseline, or 20%. PMs must separate points from percent lift.",
    conceptTags: ["relative-lift", "percentage-points"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "dl-007",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "A survey says 68% of 50 respondents prefer a feature. What is the main reason to be cautious?",
    choices: {
      A: "Percentages from surveys are never useful.",
      B: "The sample is small, so the estimate may have wide uncertainty.",
      C: "Preference always predicts paid conversion.",
      D: "The result proves the entire user base prefers the feature.",
      E: "The PM should multiply 68 by 50 to get preference rate.",
    },
    correctChoiceId: "B",
    explanation:
      "A small sample can produce an unstable estimate, especially if the sample is not representative. The PM should treat it as directional evidence, not a population truth.",
    conceptTags: ["sample-size", "survey-uncertainty"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "dl-008",
    topic: "data_literacy",
    difficulty: "hard",
    prompt:
      "A model has 95% accuracy for detecting abusive content, but only 2% of content is abusive. What does accuracy alone hide?",
    choices: {
      A: "Whether the model uses modern infrastructure.",
      B: "False positives and false negatives relative to the low base rate.",
      C: "The total number of app sessions.",
      D: "Whether the product has enough moderators on payroll.",
      E: "The color of the moderation queue UI.",
    },
    correctChoiceId: "B",
    explanation:
      "With rare events, a high accuracy score can still create many incorrect actions or miss important cases. Base rates and the confusion matrix matter more than accuracy alone.",
    conceptTags: ["base-rates", "confusion-matrix"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "dl-009",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "A PM sees a correlation of 0.72 between emails sent and purchases. What is the safest interpretation?",
    choices: {
      A: "Sending more emails definitely causes more purchases.",
      B: "Purchases definitely cause the team to send more emails.",
      C: "The variables move together, but causality still needs stronger evidence.",
      D: "Correlation means the experiment is statistically significant.",
      E: "The PM should stop measuring purchases.",
    },
    correctChoiceId: "C",
    explanation:
      "Correlation shows association, not cause. A PM needs a stronger design such as an experiment, holdout, or causal analysis before crediting emails for purchases.",
    conceptTags: ["correlation-vs-causation", "causal-evidence"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "dl-010",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "A data table has 18% of rows missing acquisition channel, and missing rows convert worse. What should the PM avoid?",
    choices: {
      A: "Checking whether the missingness is concentrated by platform.",
      B: "Asking how the channel field is collected.",
      C: "Dropping missing rows without understanding whether they are biased.",
      D: "Comparing conversion with and without missing rows.",
      E: "Investigating tracking changes.",
    },
    correctChoiceId: "C",
    explanation:
      "Missing data may be systematic, not random. Dropping it can bias conclusions, especially when missing rows behave differently from complete rows.",
    conceptTags: ["missing-data", "selection-bias"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "dl-011",
    topic: "data_literacy",
    difficulty: "easy",
    prompt:
      "Revenue grew from $80,000 to $100,000. What was the percent increase?",
    choices: {
      A: "20%, because revenue rose by $20,000.",
      B: "80%, because the starting value was $80,000.",
      C: "25%, because $20,000 divided by $80,000 equals 25%.",
      D: "125%, because the new value is 125% of the old value.",
      E: "The percent increase cannot be calculated.",
    },
    correctChoiceId: "C",
    explanation:
      "Percent increase uses the change divided by the starting value. The change is $20,000 and the baseline is $80,000, so the increase is 25%.",
    conceptTags: ["percent-change", "baseline"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "dl-012",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "A test result has p=0.07 against a pre-set 0.05 threshold. What should the PM say?",
    choices: {
      A: "The variant is proven harmful.",
      B: "The variant is proven neutral.",
      C: "The result did not meet the pre-set significance threshold.",
      D: "The PM should lower the threshold after seeing the result.",
      E: "The p-value means there is a 7% chance the variant works.",
    },
    correctChoiceId: "C",
    explanation:
      "A p-value above the pre-set threshold means the test did not meet the agreed statistical bar. It does not prove no effect, and the threshold should not be changed after peeking.",
    conceptTags: ["p-value", "decision-rule"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "dl-013",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "Segment A has 100 users with $10 ARPU. Segment B has 900 users with $2 ARPU. What is blended ARPU?",
    choices: {
      A: "$6.00, the simple average of $10 and $2.",
      B: "$10.00, because Segment A is higher value.",
      C: "$2.00, because Segment B has more users.",
      D: "$2.80, because total revenue is $2,800 across 1,000 users.",
      E: "$12.00, because the ARPUs should be added.",
    },
    correctChoiceId: "D",
    explanation:
      "Weighted averages use segment size. Segment A contributes $1,000 and Segment B contributes $1,800, for $2,800 across 1,000 users, or $2.80 ARPU.",
    conceptTags: ["weighted-average", "arpu"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "dl-014",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "A KPI dashboard compares this Monday to last Sunday and shows traffic up 30%. What is the main data literacy issue?",
    choices: {
      A: "Traffic should never be measured daily.",
      B: "The dashboard needs more colors.",
      C: "A 30% increase is always statistically significant.",
      D: "Day-of-week effects may make the comparison misleading.",
      E: "Sunday data should always be deleted.",
    },
    correctChoiceId: "D",
    explanation:
      "Different weekdays often have different traffic patterns. A fair comparison should control for seasonality or compare like-for-like periods before drawing conclusions.",
    conceptTags: ["seasonality", "like-for-like-comparison"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "dl-015",
    topic: "data_literacy",
    difficulty: "hard",
    prompt:
      "A feature appears to improve retention in a voluntary opt-in group. Why is this evidence weaker than an experiment?",
    choices: {
      A: "Retention cannot be measured for opt-in users.",
      B: "Opt-in groups are always too small to analyze.",
      C: "The feature must be harmful if users chose it.",
      D: "Users who opt in may already be more motivated or different.",
      E: "Experiments are only useful for pricing pages.",
    },
    correctChoiceId: "D",
    explanation:
      "Voluntary adoption creates selection bias: users who opt in may have higher intent or different needs. The effect cannot be cleanly attributed to the feature without stronger design.",
    conceptTags: ["selection-bias", "observational-data"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "dl-016",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "A PM wants to compare NPS across countries, but one country has 25 responses and another has 4,000. What should they consider?",
    choices: {
      A: "Only compare the two raw NPS values.",
      B: "Ignore the large country because it dominates the dataset.",
      C: "Use the small country as the main benchmark.",
      D: "Sample size, confidence intervals, and whether respondents are representative.",
      E: "Change NPS to revenue because surveys are useless.",
    },
    correctChoiceId: "D",
    explanation:
      "A country with 25 responses has much higher uncertainty than one with 4,000. Representativeness and confidence intervals matter before ranking countries.",
    conceptTags: ["sample-size", "confidence-interval"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "dl-017",
    topic: "data_literacy",
    difficulty: "easy",
    prompt:
      "If 40 out of 500 trial users convert to paid, what is the conversion rate?",
    choices: {
      A: "4%, because 40 is about 4 out of 100.",
      B: "5%, because there are 500 users.",
      C: "12.5%, because 500 divided by 40 is 12.5.",
      D: "40%, because 40 users converted.",
      E: "8%, because 40 divided by 500 equals 0.08.",
    },
    correctChoiceId: "E",
    explanation:
      "Conversion rate is conversions divided by the eligible population. Here 40 / 500 = 0.08, so the rate is 8%.",
    conceptTags: ["conversion-rate", "basic-arithmetic"],
    estimatedSeconds: 45,
  }),
  makeQuestion({
    id: "dl-018",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "A retention report excludes users who never completed onboarding. What risk does that create?",
    choices: {
      A: "It makes retention harder to calculate in spreadsheets.",
      B: "It includes too many unsuccessful users.",
      C: "It proves onboarding has no effect.",
      D: "It makes the app look worse than reality.",
      E: "It may overstate retention by removing early drop-offs from the denominator.",
    },
    correctChoiceId: "E",
    explanation:
      "Excluding users who fail onboarding changes the denominator and can make retention look healthier. PMs should define cohorts from a consistent starting event.",
    conceptTags: ["denominator", "cohort-definition"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "dl-019",
    topic: "data_literacy",
    difficulty: "hard",
    prompt:
      "A 95% confidence interval for revenue lift is -$0.10 to +$0.80 per user. What is the best interpretation?",
    choices: {
      A: "The lift is guaranteed to be positive.",
      B: "The lift is guaranteed to be negative.",
      C: "The result proves the metric was misconfigured.",
      D: "The PM should report only the upper bound.",
      E: "The interval includes zero, so the direction is uncertain under this design.",
    },
    correctChoiceId: "E",
    explanation:
      "Because the interval crosses zero, the data is consistent with a small loss, no effect, or a gain. The PM should avoid overclaiming a positive effect.",
    conceptTags: ["confidence-interval", "uncertainty"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "dl-020",
    topic: "data_literacy",
    difficulty: "medium",
    prompt:
      "A PM compares average revenue per user before and after a price change, but the user mix shifted toward enterprise accounts. What should they do?",
    choices: {
      A: "Attribute the full ARPU increase to the price change.",
      B: "Ignore account mix because ARPU is an average.",
      C: "Use only the enterprise segment and delete the rest.",
      D: "Switch the metric to total signups.",
      E: "Segment or standardize by user mix before estimating the price effect.",
    },
    correctChoiceId: "E",
    explanation:
      "A mix shift can move ARPU even if behavior within each segment is unchanged. Segmenting or standardizing helps separate price impact from composition effects.",
    conceptTags: ["mix-shift", "standardization"],
    estimatedSeconds: 90,
  }),

  makeQuestion({
    id: "ci-006",
    topic: "chart_interpretation",
    difficulty: "easy",
    prompt:
      "A bar chart compares conversion rates but uses different denominators for each bar. What should the PM check first?",
    choices: {
      A: "Whether each rate is calculated from a comparable eligible population.",
      B: "Whether the bars use the same brand color.",
      C: "Whether the chart has enough animation.",
      D: "Whether the highest bar is placed first.",
      E: "Whether the chart title uses a question mark.",
    },
    correctChoiceId: "A",
    explanation:
      "Rates are only comparable when their denominators represent comparable populations. Mismatched eligibility can make a chart look meaningful when it is not.",
    conceptTags: ["denominator", "rate-comparison"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "ci-007",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "A retention curve drops sharply on day 1, then flattens. What is the most useful PM reading?",
    choices: {
      A: "The curve proves long-term users dislike the product.",
      B: "The biggest opportunity may be early onboarding or first value.",
      C: "The product has no retention problem after day 1.",
      D: "Retention curves cannot inform product work.",
      E: "The y-axis should always be hidden for retention charts.",
    },
    correctChoiceId: "B",
    explanation:
      "A steep early drop suggests many users fail to reach initial value. The flatter tail suggests the PM should focus first on onboarding, expectation setting, or first-session value.",
    conceptTags: ["retention-curve", "first-value"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ci-008",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "A stacked area chart shows total usage rising, but the newest segment is shrinking inside the stack. What should the PM avoid concluding?",
    choices: {
      A: "The total can rise while one segment weakens.",
      B: "Every segment is growing because the top line grows.",
      C: "Segment shares are worth inspecting.",
      D: "The chart should be checked against segment-level values.",
      E: "Composition can change under a rising aggregate.",
    },
    correctChoiceId: "B",
    explanation:
      "A growing total does not mean every component is growing. Stacked charts require reading both the aggregate boundary and the individual segment thickness.",
    conceptTags: ["stacked-area-chart", "segment-composition"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ci-009",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "A cohort heatmap shows newer cohorts are lighter across every week than older cohorts. What does this most likely signal?",
    choices: {
      A: "The color palette is too light to use.",
      B: "Older users are always less valuable.",
      C: "Recent cohorts may be retaining worse and need diagnosis.",
      D: "The team should only look at total active users.",
      E: "Cohort charts cannot show retention patterns.",
    },
    correctChoiceId: "C",
    explanation:
      "If each newer cohort shows weaker retention at comparable ages, the product or acquisition quality may have worsened. Cohort views reveal this before aggregates do.",
    conceptTags: ["cohort-heatmap", "retention-diagnosis"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ci-010",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "A chart labels revenue in thousands, but the PM reads $250 as $250 instead of $250,000. What kind of error is this?",
    choices: {
      A: "A seasonality error.",
      B: "A confidence interval error.",
      C: "A units and scale interpretation error.",
      D: "A sample ratio mismatch.",
      E: "A cohort definition error.",
    },
    correctChoiceId: "C",
    explanation:
      "Chart units and scales are part of the data. Misreading thousands as raw dollars changes the magnitude by 1,000x and can lead to bad prioritization.",
    conceptTags: ["chart-units", "scale-reading"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "ci-011",
    topic: "chart_interpretation",
    difficulty: "hard",
    prompt:
      "A log-scale chart shows two products growing as parallel lines. What does that usually imply?",
    choices: {
      A: "They have the same absolute increase each period.",
      B: "They have no relationship to each other.",
      C: "They may be growing at similar percentage rates.",
      D: "The smaller product will definitely overtake the larger product.",
      E: "The chart proves both products are profitable.",
    },
    correctChoiceId: "C",
    explanation:
      "On a log scale, equal slopes generally reflect similar relative or percentage growth rates, not equal absolute changes. The PM must read the scale before interpreting slope.",
    conceptTags: ["log-scale", "growth-rate"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "ci-012",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "A line chart has one extreme spike from a data outage recovery day. What should the PM do before interpreting the trend?",
    choices: {
      A: "Fit a trendline through the spike and report acceleration.",
      B: "Delete all data before the spike.",
      C: "Annotate and analyze the outlier separately from the underlying trend.",
      D: "Convert the line chart into a pie chart.",
      E: "Assume every future day will match the spike.",
    },
    correctChoiceId: "C",
    explanation:
      "Known operational outliers can distort trend reading. Annotating and separating the recovery day helps prevent the PM from mistaking instrumentation artifacts for user behavior.",
    conceptTags: ["outlier", "trend-reading"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ci-013",
    topic: "chart_interpretation",
    difficulty: "easy",
    prompt:
      "A pie chart has 14 tiny acquisition channels and three slices look almost equal. What is the main readability issue?",
    choices: {
      A: "Pie charts should always include animation.",
      B: "The chart proves the channels have equal ROI.",
      C: "The chart should use only warm colors.",
      D: "Small differences and many categories are hard to compare in a pie chart.",
      E: "The PM should add more slices to improve detail.",
    },
    correctChoiceId: "D",
    explanation:
      "Pie charts are weak for comparing many categories or small differences. A sorted bar chart or table would usually support PM decisions better.",
    conceptTags: ["chart-selection", "category-comparison"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "ci-014",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "A chart shows total support tickets by month. Tickets rise 25%, while active users rise 80%. What chart would better answer if quality worsened?",
    choices: {
      A: "Cumulative tickets since launch.",
      B: "Total active users only.",
      C: "A pie chart of ticket categories.",
      D: "Tickets per active user or per 1,000 sessions over time.",
      E: "A chart with no y-axis labels.",
    },
    correctChoiceId: "D",
    explanation:
      "Raw ticket count can rise simply because the product grew. Normalizing by active users or sessions shows whether the experience generated more issues per unit of usage.",
    conceptTags: ["normalization", "rate-vs-count"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ci-015",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "A dashboard shows week-over-week conversion with no sample sizes. Why is that a problem?",
    choices: {
      A: "Conversion should never be plotted weekly.",
      B: "Sample sizes only matter for revenue charts.",
      C: "The PM should report only the largest weekly increase.",
      D: "The PM cannot judge noise or stability without denominators.",
      E: "The chart should use cumulative conversion only.",
    },
    correctChoiceId: "D",
    explanation:
      "A conversion rate without denominator context can hide tiny, noisy samples. Sample sizes help the PM judge whether week-to-week movement is stable or just variance.",
    conceptTags: ["sample-size", "denominator"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ci-016",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "A map shows high sales in California and Texas, but not sales per capita. What should the PM be careful about?",
    choices: {
      A: "Maps cannot show product data.",
      B: "Large states should always be removed.",
      C: "The map proves marketing works best in those states.",
      D: "Population size may explain high counts, so rates may be needed.",
      E: "Per-capita views are only useful for finance teams.",
    },
    correctChoiceId: "D",
    explanation:
      "Large populations can produce high counts even when penetration is average. A rate or per-capita view helps distinguish market size from relative strength.",
    conceptTags: ["rate-vs-count", "geographic-data"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ci-017",
    topic: "chart_interpretation",
    difficulty: "hard",
    prompt:
      "A box plot shows the median load time improved, but the 95th percentile worsened. What PM concern is most appropriate?",
    choices: {
      A: "The product improved for every user.",
      B: "The box plot is invalid because percentiles changed differently.",
      C: "Median should be removed from performance dashboards.",
      D: "Only average load time matters for user experience.",
      E: "Tail latency may be hurting a subset even if the typical user improved.",
    },
    correctChoiceId: "E",
    explanation:
      "A better median can coexist with a worse tail. For performance, high-percentile latency often affects frustrated users and should be checked as a guardrail.",
    conceptTags: ["percentiles", "tail-latency"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "ci-018",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "A conversion chart starts after a large drop already happened, making the recent line look stable. What should the PM ask for?",
    choices: {
      A: "A shorter chart with only the final two days.",
      B: "A chart without the y-axis.",
      C: "A pie chart of the same conversion data.",
      D: "A chart sorted by conversion value instead of time.",
      E: "A longer time window including the pre-drop baseline and annotations.",
    },
    correctChoiceId: "E",
    explanation:
      "A narrow time window can hide the real change. Including the baseline and relevant annotations helps the PM understand whether the current level is normal or degraded.",
    conceptTags: ["time-window", "baseline"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ci-019",
    topic: "chart_interpretation",
    difficulty: "medium",
    prompt:
      "A chart shows average order value rising, but a histogram shows most orders unchanged and a few very large orders added. What is the better conclusion?",
    choices: {
      A: "Every user is spending more.",
      B: "The histogram is unrelated to average order value.",
      C: "The PM should only report the mean.",
      D: "The chart proves prices should increase for everyone.",
      E: "The mean may be lifted by outliers rather than broad behavior change.",
    },
    correctChoiceId: "E",
    explanation:
      "Distribution views show whether an average moved broadly or because of a few extreme values. This matters before changing pricing or forecasting demand.",
    conceptTags: ["histogram", "outliers"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ci-020",
    topic: "chart_interpretation",
    difficulty: "hard",
    prompt:
      "A dashboard uses green for increases and red for decreases across all metrics, including churn and error rate. What is the UX/data issue?",
    choices: {
      A: "Green and red should never be used in dashboards.",
      B: "Every increase should be celebrated.",
      C: "Only positive business metrics should be charted.",
      D: "Only finance metrics need color semantics.",
      E: "Color semantics should reflect whether movement is good or bad for the metric.",
    },
    correctChoiceId: "E",
    explanation:
      "An increase in churn or errors is bad even though it is an increase. Dashboard color should encode good-versus-bad movement, not blindly map up to green.",
    conceptTags: ["color-semantics", "dashboard-interpretation"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "ir-006",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "Three user groups complain about setup time, required fields, and unclear progress. Which product inference is best supported?",
    choices: {
      A: "The pricing page is the main blocker.",
      B: "The onboarding flow likely has friction that should be investigated.",
      C: "The product is targeting the wrong industry.",
      D: "The team should remove analytics from the product.",
      E: "Users are asking for more enterprise permissions.",
    },
    correctChoiceId: "B",
    explanation:
      "The evidence repeats around setup friction, not pricing, industry fit, analytics, or permissions. The strongest inference stays close to the repeated observations.",
    conceptTags: ["evidence-based-inference", "onboarding-friction"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ir-007",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "A PM observes that users who save a template, invite a teammate, and schedule a report are the only group with high retention. What is the best hypothesis?",
    choices: {
      A: "Templates alone guarantee retention.",
      B: "A combined workflow may represent meaningful product adoption.",
      C: "Inviting teammates is harmful because only some users do it.",
      D: "Reports are irrelevant to retention.",
      E: "The onboarding survey is the only metric needed.",
    },
    correctChoiceId: "B",
    explanation:
      "The pattern suggests a cluster of behaviors may mark real adoption. It is a hypothesis to test, not proof that any single action alone causes retention.",
    conceptTags: ["pattern-inference", "activation-behavior"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ir-008",
    topic: "inductive_reasoning",
    difficulty: "hard",
    prompt:
      "A table shows cohorts from paid social have high signups but low activation, while referrals have fewer signups but high activation. Which inference follows best?",
    choices: {
      A: "Paid social is always a bad channel.",
      B: "Acquisition source may predict user intent or fit.",
      C: "Referral users should be excluded from analysis.",
      D: "Activation cannot vary by channel.",
      E: "The product should only optimize signup volume.",
    },
    correctChoiceId: "B",
    explanation:
      "The evidence points to channel quality differences. It does not prove paid social is always bad, but it suggests source may be linked to intent or fit.",
    conceptTags: ["channel-quality", "inductive-inference"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "ir-009",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "Weekly values are 4, 8, 16, 32 for projects created after a template launch. What simple pattern best describes the sequence?",
    choices: {
      A: "It increases by 4 each week.",
      B: "It alternates up and down.",
      C: "It doubles each week.",
      D: "It decreases by half each week.",
      E: "It stays constant after week 2.",
    },
    correctChoiceId: "C",
    explanation:
      "Each value is two times the previous one. The PM should still avoid forecasting indefinite doubling without more context, but the observed sequence doubles.",
    conceptTags: ["sequence-rule", "growth-pattern"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "ir-010",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "A support analysis shows billing tickets spike after invoices, password tickets spike after forced resets, and delivery tickets spike after carrier delays. What principle is supported?",
    choices: {
      A: "Support tickets are random and cannot be predicted.",
      B: "Billing tickets cause password tickets.",
      C: "Ticket volume often follows triggering product or operational events.",
      D: "Every ticket category should have the same owner.",
      E: "The PM should merge all ticket categories.",
    },
    correctChoiceId: "C",
    explanation:
      "Each ticket spike follows a relevant event, so a reasonable pattern is event-triggered support demand. The inference stays descriptive rather than claiming one category causes another.",
    conceptTags: ["event-pattern", "support-analysis"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ir-011",
    topic: "inductive_reasoning",
    difficulty: "hard",
    prompt:
      "Users who try advanced filters often return, but interviews say many new users cannot find basic filters. What is the best next inference?",
    choices: {
      A: "Advanced filters should be removed.",
      B: "New users do not need filters.",
      C: "Filter discoverability may be blocking users from reaching a valuable behavior.",
      D: "Retention is unrelated to product navigation.",
      E: "The team should hide filters behind paid plans.",
    },
    correctChoiceId: "C",
    explanation:
      "The evidence links filter usage with retention and discoverability problems among new users. The best inference is that access to a valuable behavior may be blocked.",
    conceptTags: ["discoverability", "valuable-behavior"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "ir-012",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "A PM sees low usage for a feature, but the few teams using it have high renewal rates and mention it in interviews. What should they infer?",
    choices: {
      A: "Low usage proves the feature has no value.",
      B: "High renewal proves the feature causes renewal.",
      C: "The feature may be valuable to a specific segment despite low aggregate usage.",
      D: "The feature should be removed before analysis.",
      E: "Interview data should always override usage data.",
    },
    correctChoiceId: "C",
    explanation:
      "Low aggregate usage can hide strong value for a narrower segment. The PM should investigate segment fit before removing or broadly scaling the feature.",
    conceptTags: ["segment-inference", "aggregate-vs-segment"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ir-013",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "If every churned enterprise account had no admin owner assigned, and retained accounts usually had one, what is the strongest hypothesis?",
    choices: {
      A: "Enterprise accounts always churn for the same reason.",
      B: "Admin ownership is irrelevant because it is not a feature.",
      C: "Retained accounts never need support.",
      D: "Lack of a clear owner may be associated with churn risk.",
      E: "The product should remove admin roles.",
    },
    correctChoiceId: "D",
    explanation:
      "The pattern supports an association between missing ownership and churn risk. It is not definitive causation, but it is strong enough to investigate.",
    conceptTags: ["churn-signal", "hypothesis-generation"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ir-014",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "A product has complaints about slow load on Android, lower Android conversion, and higher Android crash rates. What conclusion is best supported?",
    choices: {
      A: "The product should stop supporting web users.",
      B: "Android users dislike the brand.",
      C: "Conversion is unrelated to reliability.",
      D: "Android reliability and performance likely deserve focused investigation.",
      E: "The team should change pricing on iOS first.",
    },
    correctChoiceId: "D",
    explanation:
      "Multiple independent signals point to Android reliability and performance. The inference is specific to the platform and supported by both qualitative and quantitative evidence.",
    conceptTags: ["platform-diagnosis", "evidence-triangulation"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ir-015",
    topic: "inductive_reasoning",
    difficulty: "easy",
    prompt:
      "A sequence of support SLA misses is 2, 4, 8, 16. If the pattern continues, what is next?",
    choices: {
      A: "18",
      B: "20",
      C: "24",
      D: "32",
      E: "64",
    },
    correctChoiceId: "D",
    explanation:
      "The sequence doubles each step: 2, 4, 8, 16, then 32. The PM should also ask whether the process is deteriorating exponentially.",
    conceptTags: ["sequence-rule", "doubling"],
    estimatedSeconds: 45,
  }),
  makeQuestion({
    id: "ir-016",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "Users who abandon checkout mention surprise fees, and the biggest drop occurs immediately after fees are shown. What is the best inference?",
    choices: {
      A: "The search page is the main problem.",
      B: "Users are not interested in the product category.",
      C: "Checkout abandonment is impossible to diagnose.",
      D: "Fee transparency or fee amount likely contributes to abandonment.",
      E: "The team should hide all fees until after purchase.",
    },
    correctChoiceId: "D",
    explanation:
      "Both user feedback and funnel timing point to fees as a likely contributor. The inference is not proof, but it is the best-supported next area to test.",
    conceptTags: ["funnel-inference", "qualitative-quantitative"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ir-017",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "A PM compares three launches: each one that reduced setup steps improved completion, while each one that added setup steps hurt completion. What should they infer?",
    choices: {
      A: "Setup steps have no relationship to completion.",
      B: "Completion will always improve by the same amount.",
      C: "The team should stop measuring completion.",
      D: "All setup fields should be deleted immediately.",
      E: "Setup friction appears to influence completion and should guide future tests.",
    },
    correctChoiceId: "E",
    explanation:
      "Repeated directional evidence supports a friction hypothesis. It should guide future tests, while still considering field value, user quality, and downstream effects.",
    conceptTags: ["pattern-recognition", "onboarding-friction"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ir-018",
    topic: "inductive_reasoning",
    difficulty: "hard",
    prompt:
      "A sales-led product sees self-serve users fail when setup requires procurement details, while sales-assisted users complete setup. What inference is most reasonable?",
    choices: {
      A: "Self-serve users have no buying intent.",
      B: "Sales-assisted users should be removed from analysis.",
      C: "Procurement data is irrelevant to setup.",
      D: "The app should force every user into sales calls.",
      E: "The setup path may be mismatched to self-serve context and available information.",
    },
    correctChoiceId: "E",
    explanation:
      "The same requirement may be manageable with sales help but too heavy for self-serve users. The PM should infer a context-fit problem, not lack of intent.",
    conceptTags: ["context-fit", "self-serve-onboarding"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "ir-019",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "A table shows teams with weekly planning rituals adopt roadmap features, while ad hoc teams mostly use notes. What inference is most useful?",
    choices: {
      A: "Notes are a bad feature.",
      B: "Every team should be forced into weekly planning.",
      C: "Roadmap features are useless for small teams.",
      D: "Planning rituals are caused by roadmap features.",
      E: "Team workflow maturity may shape which product features create value.",
    },
    correctChoiceId: "E",
    explanation:
      "The pattern suggests feature value depends on workflow maturity. The PM should segment needs rather than assume one feature is universally best.",
    conceptTags: ["segmentation", "workflow-maturity"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ir-020",
    topic: "inductive_reasoning",
    difficulty: "medium",
    prompt:
      "A PM sees that every low-rated onboarding session includes a permissions error, while high-rated sessions rarely do. What is the best supported action?",
    choices: {
      A: "Ignore permissions because ratings are subjective.",
      B: "Replace the onboarding survey with a pricing survey.",
      C: "Remove permissions from the product entirely.",
      D: "Assume permissions are the only onboarding issue forever.",
      E: "Investigate permissions errors as a likely driver of poor onboarding experience.",
    },
    correctChoiceId: "E",
    explanation:
      "The recurring pattern makes permissions errors a strong candidate issue. The PM should investigate and test fixes without claiming it is the only possible cause.",
    conceptTags: ["root-cause-hypothesis", "onboarding-quality"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "di-006",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A table shows free users convert to paid at 4%, team users at 12%, and enterprise trial users at 18%. Which conclusion is safest from this table alone?",
    choices: {
      A: "Enterprise trials should get all roadmap resources.",
      B: "The segments have different conversion rates, but prioritization needs segment size, value, and effort.",
      C: "Free users should be blocked because they convert lowest.",
      D: "The table proves enterprise trials cause higher conversion.",
      E: "Team users and enterprise users are the same opportunity.",
    },
    correctChoiceId: "B",
    explanation:
      "The table shows differences in conversion rate, but a PM still needs reach, revenue potential, strategic fit, and effort before choosing a priority.",
    conceptTags: ["table-reading", "prioritization"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "di-007",
    topic: "data_interpretation",
    difficulty: "hard",
    prompt:
      "Overall NPS improved from 22 to 28, but every region's NPS fell. What likely happened?",
    choices: {
      A: "The survey vendor made a math error for sure.",
      B: "The response mix shifted toward regions with higher NPS.",
      C: "Every region improved despite the table.",
      D: "NPS cannot be segmented by region.",
      E: "The PM should ignore regional movement.",
    },
    correctChoiceId: "B",
    explanation:
      "If every segment worsens while the aggregate improves, a mix shift toward higher-scoring segments can explain the reversal. This is a Simpson's paradox pattern.",
    conceptTags: ["simpsons-paradox", "mix-shift"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "di-008",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A pricing table shows Plan A has 10,000 users at $8 ARPU and Plan B has 1,000 users at $60 ARPU. Which plan has higher total monthly revenue?",
    choices: {
      A: "Plan B because its ARPU is higher.",
      B: "Plan A, with $80,000 versus Plan B's $60,000.",
      C: "They are equal because both have paid users.",
      D: "Plan B because 60 is greater than 8.",
      E: "It cannot be calculated from users and ARPU.",
    },
    correctChoiceId: "B",
    explanation:
      "Total revenue is users multiplied by ARPU. Plan A generates 10,000 x $8 = $80,000, while Plan B generates 1,000 x $60 = $60,000.",
    conceptTags: ["table-reading", "arpu"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "di-009",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A usage table shows mobile users have lower conversion but much higher session frequency than desktop users. What should the PM do?",
    choices: {
      A: "Declare desktop the only valuable platform.",
      B: "Compare the user journey and value by platform before making tradeoffs.",
      C: "Remove mobile sessions from the analysis.",
      D: "Assume session frequency causes low conversion.",
      E: "Merge mobile and desktop to avoid complexity.",
    },
    correctChoiceId: "B",
    explanation:
      "Different platforms can serve different jobs. The PM should inspect intent, journey stage, conversion opportunity, and value before prioritizing only one metric.",
    conceptTags: ["platform-segmentation", "metric-tradeoff"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "di-010",
    topic: "data_interpretation",
    difficulty: "easy",
    prompt:
      "A table shows 120 cancellations out of 2,400 subscribers this month. What is monthly churn rate?",
    choices: {
      A: "2%, because 120 is a small count.",
      B: "20%, because 2,400 divided by 120 is 20.",
      C: "5%, because 120 divided by 2,400 equals 0.05.",
      D: "120%, because 120 users canceled.",
      E: "It cannot be calculated.",
    },
    correctChoiceId: "C",
    explanation:
      "Churn rate is cancellations divided by the subscriber base. Here 120 / 2,400 = 0.05, or 5% for the month.",
    conceptTags: ["churn-rate", "denominator"],
    estimatedSeconds: 45,
  }),
  makeQuestion({
    id: "di-011",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A campaign report shows click-through rate doubled, but conversion after click fell by half. What happened to final conversion from impressions?",
    choices: {
      A: "It doubled.",
      B: "It fell by half.",
      C: "It roughly stayed the same.",
      D: "It cannot be reasoned about.",
      E: "It became zero.",
    },
    correctChoiceId: "C",
    explanation:
      "If CTR doubles but post-click conversion halves, the product of the two rates is roughly unchanged. The campaign may be attracting more clicks without better final outcomes.",
    conceptTags: ["rate-chain", "funnel-math"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "di-012",
    topic: "data_interpretation",
    difficulty: "hard",
    prompt:
      "A table shows trial signups: 1,000 from Channel X with 8% paid conversion, and 200 from Channel Y with 20% paid conversion. Which channel produced more paid users?",
    choices: {
      A: "Channel Y because its conversion rate is higher.",
      B: "They produced the same number of paid users.",
      C: "Channel X, with 80 paid users versus Channel Y's 40.",
      D: "Channel Y, with 200 paid users.",
      E: "It cannot be calculated without retention.",
    },
    correctChoiceId: "C",
    explanation:
      "Paid users are signups multiplied by conversion rate. Channel X produces 80 paid users, while Channel Y produces 40 despite its higher rate.",
    conceptTags: ["rate-vs-volume", "channel-analysis"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "di-013",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A table shows average handling time increased from 4 to 6 minutes, but first-contact resolution improved from 50% to 72%. What is the best interpretation?",
    choices: {
      A: "The support team definitely got worse.",
      B: "The support team definitely got better in every way.",
      C: "There is a tradeoff: longer interactions may be resolving more issues.",
      D: "Average handling time should be removed.",
      E: "First-contact resolution is unrelated to support quality.",
    },
    correctChoiceId: "C",
    explanation:
      "The metrics move in opposite operational directions. A PM should evaluate whether longer calls are acceptable if they reduce repeat contacts and improve customer outcomes.",
    conceptTags: ["metric-tradeoff", "support-quality"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "di-014",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A feature has 5% adoption overall, but 48% adoption among admins and 1% among viewers. What does this suggest?",
    choices: {
      A: "The feature is a failure for everyone.",
      B: "The overall adoption rate is the only useful number.",
      C: "Viewer adoption must be increased before learning anything.",
      D: "The feature may be intended for or valuable to a specific role.",
      E: "Admin behavior should be removed from the dataset.",
    },
    correctChoiceId: "D",
    explanation:
      "Overall adoption hides role-level behavior. If admins are the intended users, low overall adoption may be acceptable or even expected.",
    conceptTags: ["role-segmentation", "feature-adoption"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "di-015",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A report shows conversion improved after a redesign, but traffic also shifted from cold ads to branded search. What is the main interpretation risk?",
    choices: {
      A: "Branded search should never be included in conversion reports.",
      B: "The redesign must have caused the entire improvement.",
      C: "The conversion rate should be replaced by click-through rate.",
      D: "The improvement may be partly due to higher-intent traffic mix.",
      E: "Traffic source does not affect conversion.",
    },
    correctChoiceId: "D",
    explanation:
      "Higher-intent traffic can convert better independent of design changes. The PM should control or segment by channel before attributing the gain to the redesign.",
    conceptTags: ["traffic-mix", "attribution-risk"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "di-016",
    topic: "data_interpretation",
    difficulty: "hard",
    prompt:
      "An experiment table shows conversion +2%, revenue per visitor -6%, and refund rate +20%. What decision frame is best?",
    choices: {
      A: "Ship because conversion is positive.",
      B: "Reject because every negative guardrail invalidates every test.",
      C: "Ignore revenue because conversion was the primary metric.",
      D: "Evaluate whether the conversion lift is worth the revenue and refund tradeoffs.",
      E: "Change the primary metric after seeing the table.",
    },
    correctChoiceId: "D",
    explanation:
      "The table shows a tradeoff, not an automatic ship or reject. PM judgment should weigh primary metric lift against guardrails and business impact.",
    conceptTags: ["guardrail-metrics", "decision-tradeoff"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "di-017",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A table shows 70% of enterprise accounts use SSO, but only 8% of all accounts use SSO. What is the most useful interpretation?",
    choices: {
      A: "SSO is not important because overall usage is low.",
      B: "SSO should be removed from enterprise plans.",
      C: "The usage table proves SSO causes enterprise expansion.",
      D: "SSO may be a segment-critical feature despite low overall usage.",
      E: "All accounts should be forced to use SSO.",
    },
    correctChoiceId: "D",
    explanation:
      "A feature can be critical for a high-value segment while appearing small in aggregate. PMs should interpret usage in the context of segment needs and business value.",
    conceptTags: ["segment-critical-feature", "aggregate-vs-segment"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "di-018",
    topic: "data_interpretation",
    difficulty: "easy",
    prompt:
      "A table shows 300 users started onboarding and 180 completed it. What is completion rate?",
    choices: {
      A: "40%, because 120 did not complete.",
      B: "180%, because 180 users completed.",
      C: "30%, because 300 users started.",
      D: "It cannot be calculated from starts and completions.",
      E: "60%, because 180 divided by 300 equals 0.60.",
    },
    correctChoiceId: "E",
    explanation:
      "Completion rate is completions divided by starts. Here 180 / 300 = 0.60, so 60% of users completed onboarding.",
    conceptTags: ["completion-rate", "funnel-math"],
    estimatedSeconds: 45,
  }),
  makeQuestion({
    id: "di-019",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A weekly table shows revenue flat, but active customers grew 20%. What likely happened to revenue per active customer?",
    choices: {
      A: "It increased by 20%.",
      B: "It stayed flat because revenue stayed flat.",
      C: "It cannot be inferred.",
      D: "It doubled.",
      E: "It decreased because the same revenue is spread across more active customers.",
    },
    correctChoiceId: "E",
    explanation:
      "If total revenue is flat while active customers increase, revenue per active customer falls. This is a denominator effect that aggregates can hide.",
    conceptTags: ["denominator", "per-user-metric"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "di-020",
    topic: "data_interpretation",
    difficulty: "medium",
    prompt:
      "A table shows power users have high retention but low support satisfaction because they hit advanced limits. What should the PM infer?",
    choices: {
      A: "Power users are not valuable because satisfaction is lower.",
      B: "The team should optimize only for casual users.",
      C: "Retention and satisfaction can never be interpreted together.",
      D: "Advanced limits should be ignored because retention is high.",
      E: "High-value users may be retained despite pain, signaling an important improvement area.",
    },
    correctChoiceId: "E",
    explanation:
      "Strong retention can coexist with painful limitations when users depend on the product. The PM should not ignore dissatisfaction in an important segment.",
    conceptTags: ["power-users", "segment-pain"],
    estimatedSeconds: 75,
  }),

  makeQuestion({
    id: "ab-006",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "Before launching an onboarding experiment, what is the most important setup step?",
    choices: {
      A: "Define the hypothesis, primary metric, guardrails, sample size, and decision rule.",
      B: "Choose the variant that the CEO prefers.",
      C: "Wait to pick metrics until after results arrive.",
      D: "Run the test only on users who complain.",
      E: "Stop the test as soon as any metric moves.",
    },
    correctChoiceId: "A",
    explanation:
      "A valid experiment needs a pre-defined hypothesis, metrics, sample size, and decision rule. Choosing after results creates bias and makes the result hard to trust.",
    conceptTags: ["experiment-design", "decision-rule"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ab-007",
    topic: "ab_testing",
    difficulty: "hard",
    prompt:
      "A test reports p=0.03 after the team checked results every hour and stopped the moment p dropped below 0.05. What is the risk?",
    choices: {
      A: "The test is stronger because the team watched it closely.",
      B: "Repeated peeking and early stopping can inflate false positives.",
      C: "The p-value is irrelevant only when conversion is measured.",
      D: "The test proves the treatment is harmful.",
      E: "Hourly checks guarantee sample ratio mismatch.",
    },
    correctChoiceId: "B",
    explanation:
      "Repeated looks without a planned sequential method increase the chance of finding a temporary significant result. The stopping rule should be defined before the test.",
    conceptTags: ["early-stopping", "false-positive-risk"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "ab-008",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "A notification experiment improves opens but increases unsubscribes. Which metric role do unsubscribes likely play?",
    choices: {
      A: "A vanity metric that should be ignored.",
      B: "The only primary metric.",
      C: "A guardrail metric for user harm.",
      D: "A sample size calculation.",
      E: "A randomization unit.",
    },
    correctChoiceId: "C",
    explanation:
      "Unsubscribes capture a potential user harm from more aggressive notifications. They are a guardrail that helps decide whether more opens are worth the cost.",
    conceptTags: ["guardrail-metrics", "notification-testing"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "ab-009",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "A pricing page test has a primary metric of checkout conversion. Revenue per visitor rises, but checkout conversion falls. What should the PM do?",
    choices: {
      A: "Ship automatically because revenue moved up.",
      B: "Reject automatically because conversion moved down.",
      C: "Interpret against the pre-defined objective and business tradeoff.",
      D: "Change the primary metric after seeing both results.",
      E: "Ignore revenue because checkout conversion was listed first.",
    },
    correctChoiceId: "C",
    explanation:
      "Pricing often creates conversion-revenue tradeoffs. The decision should follow the pre-defined objective and business context instead of blindly reacting to one metric.",
    conceptTags: ["primary-metric", "business-tradeoff"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ab-010",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "A PM wants to test a checkout redesign expected to lift conversion by only 0.2 percentage points. What does that imply for sample size?",
    choices: {
      A: "A smaller effect needs a smaller sample.",
      B: "Sample size is unrelated to expected effect size.",
      C: "A smaller minimum detectable effect usually requires a larger sample.",
      D: "The PM should skip randomization.",
      E: "The test should run for exactly one day.",
    },
    correctChoiceId: "C",
    explanation:
      "Detecting smaller effects reliably usually requires more observations. MDE, baseline rate, power, and significance level drive the sample size plan.",
    conceptTags: ["mde", "sample-size"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ab-011",
    topic: "ab_testing",
    difficulty: "hard",
    prompt:
      "An A/B test randomizes by user, but users in the same company share workspaces and see each other's changes. What is the concern?",
    choices: {
      A: "The test cannot measure any product metric.",
      B: "The treatment must be shown to everyone.",
      C: "Interference may contaminate control and treatment experiences.",
      D: "The p-value will always be exactly zero.",
      E: "Company accounts should be excluded from all tests.",
    },
    correctChoiceId: "C",
    explanation:
      "When users interact inside shared accounts, one user's treatment can affect another user's experience. Randomizing by company or workspace may be more valid.",
    conceptTags: ["randomization-unit", "interference"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "ab-012",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "A test shows a positive result only for a tiny segment after checking 25 segments. What should the PM be careful about?",
    choices: {
      A: "Segment analysis always invalidates experiments.",
      B: "The tiny segment must be the only audience that matters.",
      C: "The PM should delete all other segments.",
      D: "Multiple comparisons can create noisy false discoveries.",
      E: "The original primary metric no longer matters.",
    },
    correctChoiceId: "D",
    explanation:
      "The more segments the team checks, the more likely one appears significant by chance. Segment findings should be pre-planned or treated as exploratory.",
    conceptTags: ["multiple-comparisons", "segment-analysis"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ab-013",
    topic: "ab_testing",
    difficulty: "easy",
    prompt:
      "A test is intended to split users 50/50, but logs show 70% treatment and 30% control. What should the PM check first?",
    choices: {
      A: "Whether treatment conversion is higher.",
      B: "Whether the button color is attractive.",
      C: "Whether the test ran on a weekday.",
      D: "Sample ratio mismatch or assignment/logging problems.",
      E: "Whether the PM likes the treatment more.",
    },
    correctChoiceId: "D",
    explanation:
      "A large split mismatch can signal broken assignment, eligibility, or logging. The PM should investigate validity before trusting outcome metrics.",
    conceptTags: ["sample-ratio-mismatch", "experiment-validity"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "ab-014",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "A search ranking experiment increases clicks but decreases completed purchases. What is the best interpretation?",
    choices: {
      A: "Clicks are always the right primary metric.",
      B: "The ranking definitely improved product quality.",
      C: "Purchases should be ignored because they happen later.",
      D: "The treatment may be optimizing curiosity rather than purchase intent.",
      E: "Search ranking experiments cannot use guardrails.",
    },
    correctChoiceId: "D",
    explanation:
      "More clicks can mean lower relevance or curiosity clicks if downstream purchase falls. PMs should choose metrics that reflect the intended user and business outcome.",
    conceptTags: ["metric-selection", "downstream-conversion"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ab-015",
    topic: "ab_testing",
    difficulty: "hard",
    prompt:
      "A marketplace test improves buyer conversion but reduces seller response rate. What should the PM consider?",
    choices: {
      A: "Only buyer conversion because buyers pay.",
      B: "Only seller response because sellers supply inventory.",
      C: "Changing the metric after results to make a clean decision.",
      D: "Marketplace balance and whether one side's gain harms the other side.",
      E: "Removing sellers from the experiment analysis.",
    },
    correctChoiceId: "D",
    explanation:
      "Marketplace experiments often affect multiple sides. A buyer-side lift can still damage liquidity or seller health, so guardrails should reflect ecosystem balance.",
    conceptTags: ["marketplace-metrics", "ecosystem-guardrails"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "ab-016",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "A PM sees a non-significant negative result halfway through a planned experiment. What is usually best if no validity issue exists?",
    choices: {
      A: "Stop immediately because any negative movement proves harm.",
      B: "Restart the test with a new metric.",
      C: "Ship the control as a new variant.",
      D: "Declare the treatment neutral forever.",
      E: "Continue to the planned sample or duration before deciding.",
    },
    correctChoiceId: "E",
    explanation:
      "Halfway reads can be noisy. Unless there is a severe guardrail breach or validity problem, the PM should follow the planned test design.",
    conceptTags: ["early-read", "test-duration"],
    estimatedSeconds: 75,
  }),
  makeQuestion({
    id: "ab-017",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "An experiment on annual plans needs to measure renewal, but renewal takes a year. What should the PM do?",
    choices: {
      A: "Ignore renewal because it is slow.",
      B: "Use only immediate clicks and ship if clicks rise.",
      C: "Never test annual plan changes.",
      D: "Change the renewal date for treatment users.",
      E: "Use a valid leading metric while tracking long-term renewal as a lagging outcome.",
    },
    correctChoiceId: "E",
    explanation:
      "Long-term outcomes may need leading indicators, but those indicators should be validated against the real business outcome. The lagging metric should still be tracked.",
    conceptTags: ["leading-metric", "lagging-outcome"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "ab-018",
    topic: "ab_testing",
    difficulty: "easy",
    prompt:
      "Why should an A/B test define its primary metric before launch?",
    choices: {
      A: "So the team can choose the best-looking metric after results.",
      B: "So the test does not need randomization.",
      C: "So every guardrail can be ignored.",
      D: "So the PM can avoid estimating sample size.",
      E: "To prevent cherry-picking and align the decision rule in advance.",
    },
    correctChoiceId: "E",
    explanation:
      "A pre-defined primary metric reduces cherry-picking and clarifies how the team will make the launch decision once data arrives.",
    conceptTags: ["primary-metric", "cherry-picking"],
    estimatedSeconds: 60,
  }),
  makeQuestion({
    id: "ab-019",
    topic: "ab_testing",
    difficulty: "medium",
    prompt:
      "A test increases conversion for new users but decreases conversion for returning users. What should the PM do next?",
    choices: {
      A: "Average the result and ignore the segment difference.",
      B: "Ship only to everyone because one segment improved.",
      C: "Reject the treatment because one segment declined.",
      D: "Delete returning users from the analysis.",
      E: "Evaluate whether the segment effect is reliable and whether targeted rollout makes sense.",
    },
    correctChoiceId: "E",
    explanation:
      "Segment differences can be meaningful, but they must be reliable and decision-relevant. A targeted rollout may be appropriate if the pattern is valid and operationally feasible.",
    conceptTags: ["heterogeneous-treatment-effect", "targeted-rollout"],
    estimatedSeconds: 90,
  }),
  makeQuestion({
    id: "ab-020",
    topic: "ab_testing",
    difficulty: "hard",
    prompt:
      "A PM wants to test a referral incentive, but treatment users can invite control users and change their behavior. What is the main experimental challenge?",
    choices: {
      A: "The metric must be a survey metric.",
      B: "Referral tests never need control groups.",
      C: "The incentive must be hidden from all users.",
      D: "The test should run for only one day.",
      E: "Network effects or spillovers can violate independent treatment assumptions.",
    },
    correctChoiceId: "E",
    explanation:
      "Referral products can create spillovers because treated users influence untreated users. The PM may need cluster randomization or a design that accounts for network effects.",
    conceptTags: ["network-effects", "spillover"],
    estimatedSeconds: 90,
  }),
];

export const QUESTIONS: Question[] = [...SEED_QUESTIONS, ...EXPANDED_QUESTIONS];

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
