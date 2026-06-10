# Mobile Responsive Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make route planning and publishing usable without horizontal overflow on phone and tablet viewports.

**Architecture:** Keep the existing desktop layout and use Naive UI responsive grid declarations for component-level column changes. Use global media queries only for page composition, navigation, spacing, map sizing, and mobile ordering.

**Tech Stack:** Vue 3, TypeScript, Naive UI, CSS media queries, Vitest, Playwright

---

## Responsive Rules

- Under `960px`, pages use one content column and natural vertical scrolling.
- On route planning, the mobile order is route input, map/elevation, route summary, then GPX actions.
- Under `640px`, page padding is `8px`, cards and overlays use compact spacing, and statistics use smaller values.
- Form grids start at one column and progressively increase at Naive UI `s` and `m` breakpoints.
- Navigation must remain fully visible and tappable without horizontal page overflow.
- Long labels, file paths, radio options, chart labels, and action text must wrap inside their containers.

## Tasks

1. Add failing tests for responsive form, summary, and map grids.
2. Replace fixed component grids with responsive `cols` declarations.
3. Add mobile route-planner ordering and compact page/header/map styles.
4. Add mobile publishing form and generated-content wrapping rules.
5. Verify `375x812`, `768x1024`, and desktop viewports with Playwright.
6. Run the full test suite and production build.
