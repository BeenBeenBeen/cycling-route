import { describe, expect, it } from "vitest";
import { resolveApiProxyTarget } from "../../src/config/ports";

describe("resolveApiProxyTarget", () => {
  it("uses the configured backend port", () => {
    expect(resolveApiProxyTarget({ PORT: "8788" })).toBe("http://127.0.0.1:8788");
  });

  it("uses 8787 by default", () => {
    expect(resolveApiProxyTarget({})).toBe("http://127.0.0.1:8787");
  });
});
