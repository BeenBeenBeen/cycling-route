import { describe, expect, it } from "vitest";
import { parsePort } from "../../src/config/ports";
import { loadConfig } from "../../src/server/config";

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

describe("loadConfig", () => {
  it("loads all server configuration values from environment variables", () => {
    const previousEnv = { ...process.env };
    process.env.PORT = "8788";
    process.env.LOG_LEVEL = "debug";
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.OPENAI_TEXT_MODEL = "gpt-test";
    process.env.OPENAI_IMAGE_MODEL = "gpt-image-test";
    process.env.HTTP_PROXY = "http://proxy";
    process.env.HTTPS_PROXY = "https://proxy";
    process.env.ALL_PROXY = "socks://proxy";
    process.env.XIAOHONGSHU_PUBLISH_URL = "https://example.test/publish";

    expect(loadConfig()).toEqual({
      port: 8788,
      logLevel: "debug",
      openaiApiKey: "sk-test",
      openaiTextModel: "gpt-test",
      openaiImageModel: "gpt-image-test",
      proxy: {
        httpProxy: "http://proxy",
        httpsProxy: "https://proxy",
        allProxy: "socks://proxy",
      },
      xiaohongshuPublishUrl: "https://example.test/publish",
    });

    process.env = previousEnv;
  });

  it("normalizes blank optional configuration values", () => {
    const previousEnv = { ...process.env };
    process.env.PORT = "8788";
    process.env.LOG_LEVEL = "info";
    process.env.OPENAI_API_KEY = "";
    process.env.OPENAI_TEXT_MODEL = " ";
    process.env.OPENAI_IMAGE_MODEL = "";
    process.env.HTTP_PROXY = "";
    process.env.HTTPS_PROXY = " ";
    process.env.ALL_PROXY = "";
    delete process.env.XIAOHONGSHU_PUBLISH_URL;

    expect(loadConfig()).toEqual({
      port: 8788,
      logLevel: "info",
      openaiApiKey: undefined,
      openaiTextModel: undefined,
      openaiImageModel: undefined,
      proxy: {
        httpProxy: undefined,
        httpsProxy: undefined,
        allProxy: undefined,
      },
      xiaohongshuPublishUrl:
        "https://creator.xiaohongshu.com/publish/publish",
    });

    process.env = previousEnv;
  });
});
