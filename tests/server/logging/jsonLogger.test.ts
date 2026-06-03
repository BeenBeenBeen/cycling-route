import { describe, expect, it, vi } from "vitest";
import {
  createJsonLogger,
  redactValue,
} from "../../../src/server/logging/jsonLogger";

describe("jsonLogger", () => {
  it("redacts sensitive keys", () => {
    expect(
      redactValue({
        apiKey: "secret",
        OPENAI_API_KEY: "sk-test",
        NEW_API_KEY: "duck-test",
        DUCKCODING_TEXT_API_KEY: "duck-text-key",
        DUCKCODING_IMAGE_API_KEY: "duck-image-key",
        api_key: "snake-secret",
        nested: { token: "abc" },
      }),
    ).toEqual({
      apiKey: "[redacted]",
      OPENAI_API_KEY: "[redacted]",
      NEW_API_KEY: "[redacted]",
      DUCKCODING_TEXT_API_KEY: "[redacted]",
      DUCKCODING_IMAGE_API_KEY: "[redacted]",
      api_key: "[redacted]",
      nested: { token: "[redacted]" },
    });
  });

  it("omits base64 image fields", () => {
    expect(
      redactValue({
        b64_json: "abc123",
        base64: "abc123",
        image_base64: "abc123",
      }),
    ).toEqual({
      b64_json: "[omitted]",
      base64: "[omitted]",
      image_base64: "[omitted]",
    });
  });

  it("truncates large payloads as a whole", () => {
    const redacted = redactValue(
      Object.fromEntries(
        Array.from({ length: 40 }, (_, index) => [`field${index}`, "x".repeat(300)]),
      ),
      { maxSerializedBytes: 1024 },
    );

    expect(redacted).toEqual({
      truncated: true,
      preview: expect.any(String),
    });
    expect(JSON.stringify(redacted).length).toBeLessThan(1200);
  });

  it("writes one JSON log line", () => {
    const sink = vi.fn();
    const logger = createJsonLogger({ sink });
    logger.info("api.request.started", {
      requestHeaders: {
        authorization: "Bearer key",
        "content-type": "application/json",
      },
    });
    const parsed = JSON.parse(sink.mock.calls[0][0]);
    expect(parsed.event).toBe("api.request.started");
    expect(parsed.requestHeaders.authorization).toBe("[redacted]");
  });

  it("filters log entries below the configured level", () => {
    const sink = vi.fn();
    const logger = createJsonLogger({ sink, level: "info" });

    logger.debug("api.request.debug", { requestBody: { routeName: "成都" } });
    logger.info("api.request.started");

    expect(sink).toHaveBeenCalledTimes(1);
    expect(JSON.parse(sink.mock.calls[0][0]).event).toBe("api.request.started");
  });

  it("writes debug logs when configured for debug level", () => {
    const sink = vi.fn();
    const logger = createJsonLogger({ sink, level: "debug" });

    logger.debug("api.request.debug", { requestBody: { routeName: "成都" } });

    expect(sink).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(sink.mock.calls[0][0]);
    expect(parsed.level).toBe("debug");
    expect(parsed.event).toBe("api.request.debug");
    expect(parsed.requestBody).toEqual({ routeName: "成都" });
  });

  it("does not allow fields to override core log metadata", () => {
    const sink = vi.fn();
    const logger = createJsonLogger({ sink });

    logger.info("api.request.started", {
      event: "wrong.event",
      level: "error",
      time: "2000-01-01T00:00:00.000Z",
    });

    const parsed = JSON.parse(sink.mock.calls[0][0]);
    expect(parsed.event).toBe("api.request.started");
    expect(parsed.level).toBe("info");
    expect(parsed.time).not.toBe("2000-01-01T00:00:00.000Z");
  });
});
