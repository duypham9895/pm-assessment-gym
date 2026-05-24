---
schemaVersion: 1
status: imported
sourceUrl: "fixture://local-approved-product-analytics"
sourceTitle: Local Approved Product Analytics Fixture
sourceType: local_fixture
harvestPolicy: public_question_ok
permissionNote: Original local fixture created for importer verification; not copied from an external bank.
extractionMethod: manual_fixture
crawledAt: 2026-05-24
reviewedAt: 2026-05-24
reviewer: Codex
originalityStatus: original
topic: product_analytics
difficulty: medium
correctChoiceId: A
estimatedSeconds: 90
id: pa-021
importedAt: 2026-05-24
appQuestionId: pa-021
conceptTags:
  - onboarding-quality
  - activation-metrics
---

# Prompt
A B2B product team adds an onboarding checklist. Checklist completion doubles from 28% to 56%, but paid team creation stays flat. What should the PM examine before expanding the checklist work?

## Choice A
Whether completed checklist steps lead users to the collaborative actions that usually precede paid team creation.

## Choice B
Whether the launch announcement drove enough one-time page views to call the checklist successful.

## Choice C
Whether sales can manually convert every user who starts but does not finish the checklist.

## Choice D
Whether paid team creation should be removed from the metric tree because it did not improve.

## Choice E
Whether the checklist should be expanded to every page before understanding downstream behavior.

# Explanation
Checklist completion is only valuable if it moves users toward the behaviors that predict paid team creation. The PM should inspect whether completed steps connect to collaborative activation, rather than celebrating a shallow completion metric.

# Verification Notes
- Answer evidence: reviewer verified the metric-tree logic and confirmed choice A is the only option that connects checklist completion to downstream paid team creation.
- Originality notes: original local fixture written for pipeline validation, not copied from an external source.
- Reviewer decision: approved
