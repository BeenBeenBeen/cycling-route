import { describe, expect, it } from "vitest";
import { parsePort } from "../../src/config/ports";

describe("parsePort", () => {
  it("parses valid integer ports", () => {
    expect(parsePort("8788")).toBe(8788);
  });

  it("rejects invalid ports with a clear error", () => {
    expect(() => parsePort("abc")).toThrow(
      "Invalid PORT: must be an integer between 1 and 65535",
    );
    expect(() => parsePort("0")).toThrow(
      "Invalid PORT: must be an integer between 1 and 65535",
    );
    expect(() => parsePort("65536")).toThrow(
      "Invalid PORT: must be an integer between 1 and 65535",
    );
  });
});
