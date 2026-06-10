# Contextual Actions and Input Loading Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Place each route-planning action directly below the UI region it operates on and show an in-field loading indicator while an input-triggered request is pending.

**Architecture:** Move route actions out of the generic workflow card and expose them from the owning route-planning components. Pass the existing `loadingAction` state down to those components so inputs and buttons render one consistent request state without introducing a second loading source.

**Tech Stack:** Vue 3, TypeScript, Naive UI, Vitest, Vue Test Utils

---

## Product Design Constraints

1. An action button must be placed directly below the input or output region that provides its required context. The region and its actions must share one card or visual container.
2. Do not create a separate generic “流程操作” panel when actions have a clear owning input or output region.
3. Every input that triggers an asynchronous request must show a spinner at the trailing edge of the input from request start until success or failure.
4. The loading indicator must not replace the current input value, shift the field layout, or appear outside the input boundary.
5. While a request is pending, prevent duplicate action submission. Related controls may remain readable but must expose the same loading state.
6. Loading state must come from the request owner and be passed to input components explicitly; individual inputs must not infer network state from candidate or result data.

## Tasks

### Task 1: Route input action and loading state

**Files:**
- Modify: `tests/client/RoutePlannerForm.test.ts`
- Modify: `src/client/components/PlaceCandidateInput.vue`
- Modify: `src/client/components/RoutePlannerForm.vue`

1. Add failing tests for the contextual route button and trailing loading indicators.
2. Run the focused test and verify failure.
3. Add explicit loading props and render Naive UI spinners in the input suffix slots.
4. Place “生成骑行路线” below the start/end fields in the same card.
5. Run the focused test and verify success.

### Task 2: GPX and publishing actions

**Files:**
- Modify: `tests/client/GpxDownloadPanel.test.ts`
- Modify: `tests/client/RouteSummaryBar.test.ts`
- Modify: `src/client/components/GpxDownloadPanel.vue`
- Modify: `src/client/components/RouteSummaryBar.vue`

1. Add failing tests for contextual GPX generation and publishing actions.
2. Move GPX generation into the GPX card and publishing navigation into the route summary card.
3. Verify focused component tests.

### Task 3: Route planner integration

**Files:**
- Modify: `tests/client/RoutePlannerView.test.ts`
- Modify: `src/client/views/RoutePlannerView.vue`

1. Add an integration assertion that the generic workflow card is absent.
2. Wire existing request state and action handlers into the owning components.
3. Run route planner integration tests, the full suite, and the production build.
