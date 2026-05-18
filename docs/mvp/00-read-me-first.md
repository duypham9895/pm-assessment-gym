# PM Assessment Gym MVP — Read Me First

**Date created:** 2026-05-18  
**Target build day:** Tuesday, 2026-05-19  
**Interview deadline:** exam day, 2026-05-22  
**Project folder:** `/Users/edwardpham/Documents/Programming/Projects/pm-assessment`

## Purpose

This folder contains the final pre-build plan for PM Assessment Gym. It replaces the original large blueprint for the pre-exam day build. The original blueprint remains useful as a long-term vision, but this package is the plan to follow if Edward asks tomorrow:

> Build the PM Assessment Gym app using the MVP plan.

## Core Decision

The MVP is a **practice accelerator**, not a full training platform.

Before exam day, the app should do only four things well:

1. Run timed PM multiple-choice mock tests.
2. Let Edward drill one topic at a time.
3. Explain wrong answers clearly.
4. Preserve the last few attempts so progress and weak topics are visible.

Everything else is postponed.

## Documents In This Folder

1. `01-final-scope.md`
   - Defines exactly what is in and out before exam day.

2. `02-product-spec.md`
   - Describes the app, user goals, screens, and behavior.

3. `03-user-flows.md`
   - Explains how the user moves through full mock, topic drill, practice mode, and results review.

4. `04-technical-architecture.md`
   - Defines the recommended stack, file structure, and implementation boundaries.

5. `05-data-model-and-scoring.md`
   - Defines TypeScript types, scoring rules, weak-topic logic, and localStorage shape.

6. `06-content-authoring-plan.md`
   - Explains how many questions are needed, what good questions look like, and how to create them fast.

7. `07-testing-and-fallback-plan.md`
   - Defines the minimum verification plan and what to do if the build slips.

8. `08-tomorrow-handoff.md`
   - Short command-style instructions for tomorrow’s build session.

## Main Implementation Plan

The actual task-by-task build plan is here:

`docs/superpowers/plans/2026-05-18-pm-assessment-gym-mvp.md`

## Most Important Rule

If app building starts to compete with interview practice, cut app features immediately.

The priority order is:

1. Representative questions.
2. Timed practice.
3. Wrong-answer review.
4. Topic-specific drills.
5. Everything else.

