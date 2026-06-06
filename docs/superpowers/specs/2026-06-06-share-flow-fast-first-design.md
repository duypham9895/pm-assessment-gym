# Share Flow Fast First Design

Date: 2026-06-06
Status: Approved design for implementation
Owner: PM Assessment Gym

## Summary

The share feature should change from a gated senior-review form into a fast-first workflow. After a user finishes a Full Mock or Topic Drill, opening share should immediately show a copyable review packet derived from the attempt. The user can copy the default packet without filling any fields, then optionally enrich it with senior-review context when they want targeted coaching.

Selected direction: **Fast First, Enrich After**.

The feature remains local-first: copyable Markdown plus the existing `/shared-review` packet reader. It must not add accounts, backend storage, hosted links, public result URLs, dashboards, or commenting.

## Problem

The current share modal is useful but too heavy immediately after an exam or practice attempt. It requires target role, feedback request, and test conditions before the packet exists. That makes sharing feel complex and unfriendly at the exact moment the user wants relief, a quick handoff, or a lightweight record of the attempt.

The product should keep the coaching-quality path, but it should not make every user complete a mini-brief before copying anything.

## Goals

- Let the user copy a useful packet immediately from Results.
- Make the default packet privacy-conscious and lightweight.
- Keep richer senior-review context available without blocking copy.
- Preserve the current Senior Brief and Safe Summary distinction.
- Keep the workflow calm, dense, and assessment-focused.
- Preserve `/shared-review` import behavior and local-only sharing boundaries.
- Update README when implementation changes user-facing behavior.

## Non-Goals

- No accounts, backend, database, sync, or hosted private links.
- No social-share, leaderboard, public profile, certification, or readiness score.
- No new dashboard surface.
- No result URL sharing that implies cross-device access to localStorage results.
- No broad redesign of Results outside the share entry and modal workflow.

## Product Decisions

### Decision 1: Copy Is No Longer Gated

The share modal opens with a valid Markdown preview and enabled copy action. Default values are derived from the attempt:

- Candidate: `Anonymous candidate`
- Feedback request: a generic review request focused on reasoning risk and next practice
- Test conditions: inferred from feedback mode, with Practice attempts labeled as learning artifacts and Exam attempts labeled as timed attempts unless the user edits the context
- Detail preset: Safe Summary

Rationale: a finished attempt already has enough signal for a lightweight packet: score, mode, feedback mode, duration, weakest topic, confident misses, pacing signals, and next plan.

### Decision 2: Safe Summary Is Default

The default packet uses `safe_summary`. It should omit full prompt text, correct-answer text, choice text, and explanations. It should still include attempt summary, score, weakest topic, topic breakdown, confidence calibration, timing signals when available, concept tags, next plan, reviewer prompts, and caveats.

Rationale: quick sharing should avoid exposing question-bank content by default. Users can opt into richer detail for trusted reviewers.

### Decision 3: Senior Brief Is Explicit

Switching to `senior_brief` keeps the current value of missed prompt, chosen answer, correct answer, explanation, all choices, and tags. The UI must show a visible warning near the preset control:

`Senior Brief can include missed question prompts, correct answers, and explanations. Share only with a trusted reviewer.`

Rationale: senior coaching often needs evidence, but content exposure should be intentional.

### Decision 4: Senior Context Is Optional Enrichment

The modal should include a collapsed or visually secondary section named `Add senior context`. Opening it reveals the existing context fields:

- Target role or assessment
- Feedback request
- Test conditions
- Share identity and optional display label
- Interview date or deadline
- Target company / product area
- My self-assessment
- Specific question for senior

None of these fields block copying. Editing any field updates the preview immediately.

Rationale: context improves review quality, but the workflow should not feel like homework.

## UX Flow

### Results Entry

Keep `Share for review` as a secondary action on Results. It should remain visible only after a submitted attempt and should not appear while taking a test.

### Modal First State

Title:

`Share review packet`

Helper copy:

`Copy a clean result summary now, or add senior context for deeper coaching.`

Primary ready state:

- Show a compact `Ready to copy` block.
- Explain what the default packet includes: score, weakest topic, confidence risk, pacing signal, and next drill.
- Enable `Copy packet` immediately.

Detail preset control:

- `Safe Summary` selected by default.
- `Senior Brief` available as a deliberate opt-in.
- Changing presets updates the preview before copy.

Preview:

- Keep a Markdown preview textarea or preview region.
- It should contain the generated packet on open, not a placeholder asking the user to complete fields.

Optional context:

- The default modal should not show every field as the first visual impression.
- A secondary `Add senior context` control reveals the context fields.
- Context fields remain editable and update the packet preview.

Actions:

- Primary: `Copy packet`
- Secondary: `Add senior context` or `Hide senior context`
- Secondary: `Cancel`

Copy success:

`Review packet copied. Share it with a trusted reviewer.`

Copy failure:

`Copy failed. Select the preview text and copy it manually.`

## Data And Code Boundaries

`src/shareReport.ts` should continue owning deterministic packet building, Markdown rendering, and import parsing.

Implementation may add helper functions for default context, for example:

```ts
function getDefaultShareContext(attempt: Attempt): ShareCandidateContext
```

The packet schema can stay version `1` if defaults are represented through the existing `candidateContext` shape. Do not add new required schema fields unless `/shared-review` and tests are updated with backward compatibility.

`src/App.tsx` should own the modal state, optional context reveal state, preset selection, copy status, focus restoration, and preview rendering.

`src/styles.css` should keep the existing calm panel/modal language, but reduce the perceived form weight by making the first state summary-led rather than field-led.

## Accessibility Requirements

- Opening the modal focuses the first useful action or the modal title region, not a required input.
- Escape closes the modal and restores focus to `Share for review`.
- Backdrop click closes the modal through the shared modal overlay behavior.
- Copy success/failure remains announced through `role="status"` and `aria-live="polite"`.
- The detail preset control must expose selected state.
- `Add senior context` must expose expanded/collapsed state with `aria-expanded` when implemented as a disclosure button.
- Preview remains keyboard reachable and manually selectable for fallback copy.

## QA Acceptance Criteria

- Results shows `Share for review`; test-taking view does not.
- Opening Share shows `Share review packet` and an enabled copy button immediately.
- Default preset is `Safe Summary`.
- Default Markdown preview contains a packet without requiring form input.
- Default copied packet does not include missed prompt text, correct-answer text, choice text, or explanations.
- Switching to `Senior Brief` updates the preview and includes missed prompt/explanation evidence.
- `Add senior context` reveals the context fields.
- Editing target role, feedback request, test conditions, identity, or optional notes updates the preview.
- Clipboard success and failure paths still work.
- Modal focus restoration and shared modal dismissal behavior still work.
- `/shared-review` continues to parse existing Markdown packets.
- Existing share-report unit tests continue to pass, with tests updated for the new ungated default behavior.
- `npm run test`, `npm run validate:questions`, and `npm run build` pass before completion.
- Rendered desktop and mobile QA checks confirm no clipping, overlap, or unusable modal layout.

## README Updates

After implementation, update README feature and routes/share-copy sections to clarify:

- Share opens with an immediately copyable Safe Summary.
- Senior Brief is available for trusted reviewers.
- Senior context is optional enrichment, not required before copying.
- Sharing remains local-first and no-backend.

## Open Risks

- Default context language could feel too generic for senior coaching. Mitigation: use direct but modest copy and keep optional context easy to open.
- Safe Summary may be less useful than Senior Brief for deep feedback. Mitigation: make the Senior Brief opt-in visible and clear.
- The modal may still feel large on mobile. Mitigation: test mobile viewport and keep optional context below the first copy action.
