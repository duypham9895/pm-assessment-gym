# Hosted Private Share Links Follow-Up PRD

Date: 2026-05-25
Status: Future option, blocked until a backend/storage pattern is approved
Owner: PM Assessment Gym

## Context

The shared-results review implementation inspected the repository for backend, API, database, or approved server-side storage patterns. The app is currently a static Vite React app deployed with Vercel SPA rewrites and localStorage-only persistence. Because there is no approved backend pattern, hosted private share links should not be bolted on in this phase.

## Goal

Add cross-device private review links only after the product explicitly accepts a backend/storage architecture and the privacy posture that comes with storing assessment packets outside the user's device.

## Non-Goals

- No accounts or senior dashboards.
- No public result pages.
- No raw local attempt IDs as authorization.
- No answer-detail storage without explicit consent.
- No search-indexable packet pages.
- No readiness score, cohort comparison, commenting system, payments, or broad learning-platform expansion.

## Required Product Decisions

- Storage provider: choose an approved Vercel-compatible storage layer or backend service.
- Retention policy: define default expiration, maximum lifetime, and whether users can shorten it.
- Revoke/delete: provide a way to delete a hosted packet or invalidate its token.
- Detail consent: require explicit consent before storing prompts, answer text, correct answers, explanations, or timing data.
- Access model: decide whether links are bearer-token private links only, or whether any additional passcode/email gate is required.
- Import/export parity: hosted packets should use the same minimized data contract as the local review packet.

## Data Minimization

Store only the derived review packet fields needed for senior review:

- Candidate-entered context.
- Attempt summary and score.
- Topic diagnostics.
- Confidence calibration.
- Timing summary.
- Priority mistakes at the chosen detail level.
- Reviewer prompts and caveats.

Do not store:

- localStorage keys.
- Raw local attempt IDs or session IDs.
- Theme, keyboard preferences, browser/device data, or attempt history.
- In-progress snapshots.
- Answer details when the user chooses Safe Summary.

## Security Requirements

- Use random high-entropy, non-sequential share IDs.
- Share IDs must not be derived from local attempt IDs, timestamps, or incremental counters.
- Missing, revoked, expired, and malformed links must return the same non-enumerating unavailable state.
- One share token must not reveal or enumerate other packets.
- Hosted pages must set `noindex` behavior through metadata and deployment headers.
- Stored packet reads must validate expiration and revoke status before returning content.
- Writes must validate the packet schema and accepted detail consent.

## Vercel And Deployment Implications

- Static SPA rewrites are not enough for hosted links; the app needs a server route or approved storage-backed API.
- If using Vercel Functions, add tests around function behavior and deployment environment variables.
- If using Vercel KV/Postgres/Blob or another store, document provisioning, local development setup, and preview/production isolation.
- Add rate limits or abuse controls appropriate to anonymous write endpoints.
- Add observability that avoids logging packet content.

## Minimum API Shape

```text
POST /api/share-packets
  Body: minimized ShareReviewPacket plus explicit consent flags
  Returns: { shareId, url, expiresAt }

GET /api/share-packets/:shareId
  Returns: packet when token exists, active, and unexpired
  Returns: unavailable for missing, revoked, expired, or malformed IDs

DELETE /api/share-packets/:shareId
  Requires delete token or equivalent creator secret
  Marks packet revoked or deletes it
```

## Tests Required Before Launch

- Creates share IDs that are high entropy and non-sequential.
- Does not accept raw local attempt IDs as share IDs.
- Does not return packet content for missing links.
- Does not return packet content for expired links.
- Does not return packet content for revoked/deleted links.
- Does not store Senior Brief answer details unless detail consent is explicit.
- Safe Summary hosted packets omit prompts, correct answer text, answer explanations, and all answer-key details.
- Hosted pages include non-indexing behavior.
- API errors do not leak whether neighboring share IDs exist.

## Rollout Recommendation

Keep the copyable local review packet as the default. Add hosted links only after users show that cross-device reading is worth the additional storage, security, retention, and consent surface area.
