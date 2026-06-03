import { describe, expect, it, vi } from "vitest";
import {
  createLoggedFetch,
  resolveProxyUrl,
} from "../../src/server/services/openaiClient";

describe("resolveProxyUrl", () => {
  it("prefers HTTPS then ALL then HTTP proxy", () => {
    expect(
      resolveProxyUrl({
        httpsProxy: "https://p",
        allProxy: "socks://p",
        httpProxy: "http://p",
      }),
    ).toBe("https://p");
    expect(resolveProxyUrl({ allProxy: "socks://p", httpProxy: "http://p" })).toBe(
      "socks://p",
    );
  });
});

describe("createLoggedFetch", () => {
  it("logs headers and body with redaction-ready fields", async () => {
    const logger = { debug: vi.fn(), info: vi.fn(), error: vi.fn() };
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response("{}", { status: 200, statusText: "OK" }));
    const logged = createLoggedFetch(fetch, logger as any);

    await logged("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: "Bearer secret", "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-test", input: "hello" }),
    });

    expect(logger.debug).toHaveBeenCalledWith(
      "openai.request.debug",
      expect.objectContaining({
        requestHeaders: expect.any(Object),
        requestBody: { model: "gpt-test", input: "hello" },
      }),
    );
    expect(logger.info).toHaveBeenCalledWith(
      "openai.request.completed",
      expect.objectContaining({
        status: 200,
        durationMs: expect.any(Number),
      }),
    );
  });

  it("logs OpenAI request failures and rethrows", async () => {
    const logger = { debug: vi.fn(), info: vi.fn(), error: vi.fn() };
    const error = new Error("network failed");
    const fetch = vi.fn<typeof globalThis.fetch>().mockRejectedValue(error);
    const logged = createLoggedFetch(fetch, logger as any);

    await expect(
      logged("https://api.openai.com/v1/responses", { method: "POST" }),
    ).rejects.toThrow("network failed");

    expect(logger.error).toHaveBeenCalledWith(
      "openai.request.failed",
      expect.objectContaining({
        error: { name: "Error", message: "network failed" },
        durationMs: expect.any(Number),
      }),
    );
  });
});
