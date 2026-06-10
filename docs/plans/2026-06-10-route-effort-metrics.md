# Route Effort Metrics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Use the application theme color for the map hover point and show estimated ride duration and calorie consumption with route distance.

**Architecture:** Keep AMap route duration as the source of truth for ride time. Calculate calories in a small client-side domain module using a documented 70 kg rider and 8 MET moderate-cycling assumption, then present all three effort metrics in the route summary distance section.

**Tech Stack:** Vue 3, TypeScript, Naive UI, Vitest

---

## Calculation Rules

- Ride duration uses `PlannedRoute.estimatedDurationMin` returned by route planning.
- Estimated calories use `kcal = MET * 3.5 * weightKg / 200 * durationMin`.
- Defaults: `MET = 8`, `weightKg = 70`.
- Missing duration displays `--` for both duration and calories.
- Calorie output is rounded to the nearest 10 kcal to communicate that it is an estimate.

## Tasks

1. Add failing unit tests for duration formatting and calorie estimation.
2. Add a focused route-effort calculation module.
3. Add failing route summary tests for distance, ride time, and calories in one module.
4. Update the route summary component.
5. Update the map hover marker test and change its fill color to the theme primary color.
6. Run focused tests, the full suite, and the production build.
