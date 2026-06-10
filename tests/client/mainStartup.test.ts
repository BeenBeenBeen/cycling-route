import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("client startup", () => {
  it("clears persisted route data before mounting the application", () => {
    const source = readFileSync("src/client/main.ts", "utf8");

    expect(source).toContain("clearRoutePlannerSession();");
    expect(source).toContain("clearRoutePublishDraft();");
    expect(source.indexOf("clearRoutePlannerSession();")).toBeLessThan(
      source.indexOf("createApp(App)"),
    );
    expect(source.indexOf("clearRoutePublishDraft();")).toBeLessThan(
      source.indexOf("createApp(App)"),
    );
  });
});
