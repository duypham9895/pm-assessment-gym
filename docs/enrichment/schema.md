# Enrichment Candidate Schema

All enrichment artifacts are Markdown files stored inside `docs/enrichment/`. The pipeline does not use a database.

## Status Lifecycle

```text
discovered -> crawled -> needs_rewrite -> needs_answer_key -> approved -> imported
discovered -> crawled -> rejected
approved -> imported
```

## Candidate Markdown

```markdown
---
schemaVersion: 1
status: crawled
sourceUrl: "https://example.com/source"
sourceTitle: "Example PM Assessment"
sourceType: "assessment_vendor"
harvestPolicy: "metadata_only"
permissionNote: "Use for topic/rubric calibration only; do not copy verbatim."
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
  - cohort-analysis
  - causal-reasoning
---

# Prompt
A concrete PM scenario with enough data to answer.

## Choice A
Plausible but wrong PM decision.

## Choice B
Plausible but wrong PM decision.

## Choice C
Correct answer.

## Choice D
Plausible but wrong PM decision.

## Choice E
Plausible but wrong PM decision.

# Explanation
Why the correct answer is right and why the common tempting mistake is wrong.

# Verification Notes
- Answer evidence:
- Originality notes:
- Reviewer decision:
```

## Reviewer Checklist

- Source is listed in `docs/enrichment/source_registry.md` with a harvest policy and last reviewed context.
- Provenance fields are complete: source URL, source title, source type, harvest policy, permission note, extraction method, and crawl date.
- Schema is valid: one app topic, `easy | medium | hard`, exactly five choices A-E, one correct answer, explanation, tags, and `estimatedSeconds` from 45 to 150.
- Answer evidence is present. Missing answer keys block approval.
- Candidate is original or explicitly permitted. Rewritten candidates must not be verbatim copies of gated, paywalled, private, login-only, or proprietary banks.
- Distractors are plausible PM mistakes, not throwaway choices.
- Prompt is not a duplicate or near-duplicate of an existing app question or another pending candidate.
- Import preserves topic coverage, difficulty availability, answer-letter balance, tests, validation, and build health.
