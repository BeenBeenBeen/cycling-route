# Place Candidate Dropdown Implementation Plan

**Goal:** Show start and end place candidates directly below their input fields and trigger place search when either field loses focus.

**Architecture:** Add a reusable candidate input component that owns dropdown visibility and candidate rendering. Keep query and selected candidate state in `RoutePlannerView`, while `RoutePlannerForm` coordinates blur-triggered searches and emits selection events.

**Tech Stack:** Vue 3, TypeScript, Naive UI, Vitest, Vue Test Utils

## Tasks

1. Add failing form tests for blur search, inline candidates, selection, and removal of the search button.
2. Add `PlaceCandidateInput.vue` and integrate it into `RoutePlannerForm.vue`.
3. Move candidate props and selection events through `RoutePlannerView.vue`; remove the standalone selector.
4. Update route planner integration tests to use blur-triggered search and inline candidate selection.
5. Run the full test suite and production build.
