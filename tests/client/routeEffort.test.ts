import { describe, expect, it } from "vitest";
import {
  estimateCyclingCalories,
  formatRideDuration,
} from "../../src/client/routeEffort";

describe("route effort", () => {
  it("formats route duration into hours and minutes", () => {
    expect(formatRideDuration(61)).toBe("1 小时 1 分钟");
    expect(formatRideDuration(45)).toBe("45 分钟");
    expect(formatRideDuration(undefined)).toBe("--");
  });

  it("estimates moderate cycling calories and rounds to tens", () => {
    expect(estimateCyclingCalories(61)).toBe(600);
    expect(estimateCyclingCalories(undefined)).toBeNull();
  });
});
