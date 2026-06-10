import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("mobile viewport", () => {
  it("uses the device viewport in embedded mobile browsers", () => {
    const html = readFileSync("index.html", "utf8");

    expect(html).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    );
  });
});
