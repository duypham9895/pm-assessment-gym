# Keyboard-First Assessment Flow PRD

Date: 2026-05-23
Status: Draft for product review
Owner: PM Assessment Gym

## Role Assignments

- Product Manager: define scope, sequencing, product metrics, and guardrails for the keyboard-first assessment loop.
- Senior UI/UX Designer: define shortcut mapping, focus behavior, visual affordances, accessibility behavior, and failure states.
- Content Writer: define first-time guidance, shortcut labels, aria labels, tooltips, and low-friction coaching copy.
- Engineering: implement only after this PRD is approved; start with tests for shortcut behavior, focus behavior, and non-regression of existing answer locking.

## Problem

The current test screen supports `1`-`5` for selecting answer choices, but the rest of the assessment loop still requires mouse/touch interaction. A focused user should be able to read, answer, set confidence, move between answer choices, jump between questions, and recover from incomplete states without taking their hands off the keyboard.

This matters because PM assessment practice is timed, repetitive, and attention-sensitive. The interaction should feel closer to a real assessment instrument than a general web form.

## Current State

- The test screen already has five answer choices, a three-option confidence control, a question navigator, `Previous`, `Next unanswered`, and `Next`.
- `src/App.tsx` currently handles global `1`-`5` while the test view is active.
- Global answer hotkeys already ignore `input`, `textarea`, and `select` targets.
- Practice mode already locks answer and confidence changes after feedback is visible.
- There is a visible hint: `Tip: press 1-5 to pick a choice.`
- There is no shortcut help overlay, no shortcut preference, no confidence shortcut, no next/previous question shortcut, and no answer-focus shortcut.

## Research Inputs

- W3C WCAG 2.1.1 says keyboard users need equivalent access to pointer actions and warns that platform/browser conventions should be followed when possible: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
- W3C WCAG 2.1.4 says single-character shortcuts need a way to turn off, remap, or be active only when the relevant component has focus: https://www.w3.org/WAI/WCAG21/Understanding/character-key-shortcuts.html
- WAI-ARIA radio group guidance uses `Tab` to enter, `Space` to select, and arrow keys for moving within options when radio semantics are used: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
- WAI-ARIA toolbar guidance supports reducing tab stops with grouped controls and arrow-key movement inside the group: https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
- WAI-ARIA button guidance keeps `Enter` and `Space` activation as baseline behavior: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- NWEA test navigation docs support `Tab`, `Shift+Tab`, `Space`, and `A-E` or `1-5` answer selection for tests with five or fewer choices: https://teach.mapnwea.org/assist/help_map/Content/Testing/accomm_keyboardnav.htm
- ExamSoft accessibility docs describe keyboard answer navigation through `Tab` or arrow keys and selection through `Space` or `Enter`: https://support.examsoft.com/hc/en-us/articles/13291240030989-Examplify-Accessibility-Features
- OEC exam docs use left/right arrows for previous/next question navigation: https://www.oec-exam.uzh.ch/docs/ans/navigation/navigation-during-exam/

## Users And Jobs

Primary user: focused PM assessment taker practicing under time pressure.

Secondary user: review-oriented learner revisiting unanswered or low-confidence questions.

First-time user: someone entering the assessment page without knowing shortcuts exist.

Jobs:

- Select an answer quickly while reading the question.
- Mark confidence quickly so review priority is meaningful later.
- Move to the next or previous answer option without the mouse.
- Move to the next, previous, or next unanswered question without the mouse.
- Discover the core shortcuts without reading a manual.
- Recover when a shortcut is unavailable, disabled, or accidentally pressed.

## Goals

- Let a desktop user complete the full question loop with keyboard only.
- Keep mouse, touch, and tab navigation fully usable.
- Make shortcut labels visible but visually quiet.
- Avoid context-dependent ambiguity where the same key means two different high-impact actions.
- Respect browser/system shortcuts and assistive technology users.
- Preserve existing practice-mode locking and exam-mode answer editability.

## Non-Goals

- Do not redesign the whole assessment UI.
- Do not change scoring logic.
- Do not add new confidence levels.
- Do not require keyboard shortcuts on mobile.
- Do not build fully custom user-defined shortcut remapping in the first pass.
- Do not add a command palette or power-user analytics dashboard in the first pass.

## Recommended Shortcut Map

### Direct Answer Selection

| Action | Shortcut | Notes |
| --- | --- | --- |
| Select answer A | `1` | Existing behavior. |
| Select answer B | `2` | Existing behavior. |
| Select answer C | `3` | Existing behavior. |
| Select answer D | `4` | Existing behavior. |
| Select answer E | `5` | Existing behavior. |

### Answer Focus Navigation

| Action | Shortcut | Notes |
| --- | --- | --- |
| Move to previous answer choice | `ArrowUp` | Moves focus/highlight inside answer choices. |
| Move to next answer choice | `ArrowDown` | Moves focus/highlight inside answer choices. |
| Select focused answer choice | `Enter` or `Space` | Baseline accessible button behavior. |

Decision: `ArrowUp`/`ArrowDown` should navigate answer choices. If answer choices are later implemented as true radio buttons, the implementation should follow WAI-ARIA radio behavior and may select on arrow movement. For the current button-based UI, arrow movement should focus first, and `Enter`/`Space` should choose, which reduces accidental answer changes.

### Confidence Selection

| Action | Shortcut | Notes |
| --- | --- | --- |
| Set confidence to Guessing | `Shift+1` | Avoids collision with answer A. |
| Set confidence to Unsure | `Shift+2` | Keeps same numeric mental model. |
| Set confidence to Confident | `Shift+3` | Avoids mnemonic-letter ambiguity. |

Decision: prefer `Shift+1`-`Shift+3` over `G/U/C`. Mnemonic letters are memorable, but they are single-character global shortcuts and create extra WCAG 2.1.4 risk. They also introduce a mental model mismatch because answer C is selected by `3`, while confidence Confident would be selected by `C`.

### Question Navigation

| Action | Shortcut | Notes |
| --- | --- | --- |
| Previous question | `ArrowLeft` | Common exam navigation pattern. Disabled on first question. |
| Next question | `ArrowRight` | Common exam navigation pattern. Disabled on last question. |
| Next unanswered question | `Shift+ArrowRight` | Mirrors existing `Next unanswered` button. |
| Previous unanswered question | `Shift+ArrowLeft` | Later unless a visible equivalent control is also added. |

Decision: arrow-key question navigation should not override answer-choice or confidence-control behavior when focus is inside those controls. If focus is inside the answer choices, `ArrowUp`/`ArrowDown` are answer navigation. If focus is inside confidence, `ArrowLeft`/`ArrowRight` move within confidence. Global question navigation can apply from the question region, blank page context, question navigator, or footer actions.

### Help And Escape

| Action | Shortcut | Notes |
| --- | --- | --- |
| Open shortcuts help | `?` or visible button | Only when shortcuts are enabled. |
| Close shortcuts help | `Esc` | Restore focus to opener. |

Because `?` is also a printable-character shortcut, the help overlay must include a setting to turn character shortcuts off. The visible help button remains available through pointer and tab navigation.

## Shortcut Preference

Add a small setting in the shortcuts help overlay:

- Label: `Keyboard shortcuts`
- Options: `On` and `Off`
- Default: `On` on desktop.
- Persistence: localStorage.
- Behavior when off: disable direct printable shortcuts such as `1`-`5` and `?`; keep native tab, arrow-within-focused-control, `Enter`, and `Space` behavior available.

This satisfies the accessibility need for users who may accidentally trigger single-character shortcuts or use speech input. Full custom remapping is a later enhancement.

## Core User Flows

### Fast Keyboard Loop

1. User reads question.
2. User presses `3` to select answer C.
3. User presses `Shift+2` to mark Unsure.
4. User presses `ArrowRight` to move next.
5. Focus resets to the new question region or the selected answer if the next question was already answered.

### Answer Navigation Loop

1. User tabs into answer choices.
2. User presses `ArrowDown` to move through choices.
3. User presses `Space` to select the highlighted choice.
4. User sees the same selected-state treatment as mouse users.

### Review Unanswered Loop

1. User answers several questions and skips one.
2. User presses `Shift+ArrowRight`.
3. App jumps to the next unanswered question.
4. If all questions are answered, app shows `All questions have an answer.`

### First-Time User Loop

1. User enters the test screen for the first time.
2. User sees one compact keyboard tip near the question controls.
3. Shortcut badges are visible on answers, confidence, and navigation.
4. User can open the help overlay from a button.
5. Once dismissed, the tip does not interrupt later questions.

## UI Requirements

### Shortcut Badges

- Answer badges: show `1`, `2`, `3`, `4`, `5` in the existing choice-letter block.
- Confidence badges: show `Shift+1`, `Shift+2`, `Shift+3` inside each confidence option.
- Navigation badges: show `←`, `Shift+→`, and `→` inside or beside current navigation buttons. Show `Shift+←` only if a visible previous-unanswered control is added.
- Badges must be visually secondary, high contrast, and consistent.
- On narrow mobile layouts, badges may collapse or hide, but the help button remains visible.

### First-Time Tip

Initial copy:

`Use 1-5 to answer, Shift+1-3 for confidence, and arrows to move between questions.`

Dismiss action:

`Got it`

Compact reminder after dismissal:

`Shortcuts`

Rules:

- Show only on the test screen.
- Persist dismissal in localStorage.
- Keep the tip to one line on desktop when possible.
- Do not block answering.

### Shortcuts Help Overlay

The overlay should include grouped shortcuts:

- Answers
- Confidence
- Move through answers
- Questions
- Unanswered questions
- Standard controls
- Keyboard shortcuts setting

Overlay requirements:

- Open from visible button and `?` when shortcuts are enabled.
- Close with `Esc`.
- Trap focus while open.
- Restore focus to the opener.
- Include the `Keyboard shortcuts On/Off` setting.
- Do not appear automatically after the first-time tip is dismissed.

## Content Requirements

### Tooltip And Aria Label Examples

- Answer A: `Select answer A. Keyboard shortcut 1.`
- Guessing: `Set confidence to Guessing. Keyboard shortcut Shift 1.`
- Previous question: `Go to previous question. Keyboard shortcut Left Arrow.`
- Next unanswered: `Jump to next unanswered question. Keyboard shortcut Shift Right Arrow.`
- Shortcuts: `Show keyboard shortcuts.`

### Empty And Disabled States

- No answer selected: `Choose an answer to continue.`
- No confidence selected: `Add confidence when you are ready.`
- Previous disabled: `This is the first question.`
- Next disabled: `This is the last question.`
- Next unanswered disabled: `All questions have an answer.`
- Shortcut unavailable in editable field: no visible toast by default; ignore the shortcut.

Tone rules:

- Be calm, direct, and short.
- Use verbs: `Choose`, `Mark`, `Go`, `Jump`.
- Do not shame incomplete work.
- Keep assessment view copy compact.
- Put longer guidance in the shortcuts overlay only.

## Accessibility Requirements

- Every shortcut action must have an equivalent visible control.
- All controls remain reachable and operable by `Tab`, `Shift+Tab`, `Enter`, and `Space`.
- Global shortcuts must be ignored inside `input`, `textarea`, `select`, contenteditable elements, and modal dialogs.
- Do not intercept browser/system shortcuts using `Meta`, `Ctrl`, or `Alt`.
- Preserve visible focus indicators.
- Announce question changes through focus movement to the question heading/region or a polite live region.
- Shortcut badges should be either hidden from screen readers when redundant or represented in concise accessible help text.
- If shortcut mode is turned off, the page must remain fully usable through standard keyboard navigation.
- Practice-mode locked answers must ignore all answer and confidence shortcuts.

## Analytics And Success Metrics

Recommended event names:

- `shortcut_answer_select`
- `shortcut_confidence_select`
- `shortcut_question_next`
- `shortcut_question_previous`
- `shortcut_next_unanswered`
- `shortcut_help_open`
- `shortcut_mode_toggle`

Product metrics:

- Increase share of answered questions using keyboard shortcuts.
- Reduce average time per question for shortcut users without lowering score.
- Reduce mouse/touch interactions during timed sessions.
- Maintain or improve completion rate.

Quality metrics:

- No regression in existing answer-locking tests.
- No shortcut fires in editable fields.
- No shortcut changes locked practice answers.
- No keyboard trap in the help overlay.
- All shortcut actions have automated tests where practical.

## MVP Scope

Must have:

- Centralized shortcut definitions.
- `1`-`5` answer shortcuts preserved.
- `Shift+1`-`Shift+3` confidence shortcuts.
- `ArrowUp`/`ArrowDown` answer focus navigation.
- `Enter`/`Space` selection for focused answer.
- `ArrowLeft`/`ArrowRight` previous/next question navigation, scoped so focused controls are not overridden.
- `Shift+ArrowRight` next unanswered navigation.
- Shortcut badges on answer, confidence, and navigation controls.
- First-time dismissible keyboard tip.
- Help overlay with shortcut list and on/off preference.
- LocalStorage persistence for dismissed tip and shortcut mode.
- Tests for shortcut behavior and disabled/locked states.

Should have:

- Live region or deterministic focus movement on question change.
- Disabled-state copy exposed through tooltip/title or help text.
- `Shift+ArrowLeft` previous unanswered navigation, only if a visible equivalent control is added.
- Browser QA across Chromium, Safari, and Firefox.

Later:

- Full remapping.
- Per-user shortcut presets.
- Analytics dashboard for shortcut adoption.
- Review-mode shortcuts for wrong, low-confidence, or bookmarked questions.

## Implementation Plan Outline

Implementation should be planned after PRD approval. Expected task slices:

1. Add failing tests for confidence shortcuts, question navigation shortcuts, input/contenteditable guards, and practice locked-state behavior.
2. Create a shortcut registry that defines key, label, action, scope, and whether the key is printable.
3. Add localStorage-backed shortcut preferences and first-time tip dismissal.
4. Update `TestView` markup with shortcut badges, help button, accessible labels, and deterministic focus targets.
5. Implement shortcut handling from the registry with scope guards.
6. Implement the shortcuts help overlay and focus management.
7. Add CSS for badges, tip, overlay, and responsive behavior.
8. Run automated tests, build, and manual keyboard-only QA.

## Open Decisions For Review

- Should `ArrowLeft`/`ArrowRight` always move questions, or only when focus is outside answer/confidence controls?
- Do we need a visible `Previous unanswered` control in the same implementation, or should that remain a later enhancement?
- Should the first-time tip appear once per browser or once per session?
- Should shortcut mode default to `On` for all desktop users, or should it only turn on after the user first uses a shortcut?
