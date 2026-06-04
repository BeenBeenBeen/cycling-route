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
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_TEXT_MODEL;
    delete process.env.NEW_API_KEY;
    process.env.DUCKCODING_TEXT_API_KEY = "duck-text-key";
    process.env.DUCKCODING_IMAGE_API_KEY = "duck-image-key";
    process.env.DUCKCODING_BASE_URL = "https://duck.test/v1";
    process.env.DUCKCODING_TEXT_MODEL = "duck-text-test";
    process.env.DUCKCODING_IMAGE_MODEL = "duck-image-test";
    process.env.DUCKCODING_IMAGE_SIZE = "1024x1536";
    process.env.AMAP_API_KEY = "amap-server-key";
    process.env.AMAP_JS_API_KEY = "amap-js-key";
    process.env.OPEN_ELEVATION_BASE_URL = "https://elevation.test/lookup";
    process.env.ELEVATION_SAMPLE_INTERVAL_M = "250";
    process.env.ELEVATION_BATCH_SIZE = "75";
    process.env.ELEVATION_GAIN_NOISE_THRESHOLD_M = "5";
    process.env.HTTP_PROXY = "http://proxy";
    process.env.HTTPS_PROXY = "https://proxy";
    process.env.ALL_PROXY = "socks://proxy";
    process.env.XIAOHONGSHU_PUBLISH_URL = "https://example.test/publish";

    expect(loadConfig()).toEqual({
      port: 8788,
      logLevel: "debug",
      duckcodingTextApiKey: "duck-text-key",
      duckcodingImageApiKey: "duck-image-key",
      duckcodingBaseUrl: "https://duck.test/v1",
      duckcodingTextModel: "duck-text-test",
      duckcodingImageModel: "duck-image-test",
      duckcodingImageSize: "1024x1536",
      amapApiKey: "amap-server-key",
      amapJsApiKey: "amap-js-key",
      openElevationBaseUrl: "https://elevation.test/lookup",
      elevationSampleIntervalM: 250,
      elevationBatchSize: 75,
      elevationGainNoiseThresholdM: 5,
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
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_TEXT_MODEL;
    delete process.env.NEW_API_KEY;
    process.env.DUCKCODING_TEXT_API_KEY = "";
    process.env.DUCKCODING_IMAGE_API_KEY = "";
    process.env.DUCKCODING_BASE_URL = " ";
    process.env.DUCKCODING_TEXT_MODEL = "";
    process.env.DUCKCODING_IMAGE_MODEL = "";
    process.env.DUCKCODING_IMAGE_SIZE = " ";
    process.env.AMAP_API_KEY = "";
    process.env.AMAP_JS_API_KEY = " ";
    delete process.env.OPEN_ELEVATION_BASE_URL;
    delete process.env.ELEVATION_SAMPLE_INTERVAL_M;
    delete process.env.ELEVATION_BATCH_SIZE;
    delete process.env.ELEVATION_GAIN_NOISE_THRESHOLD_M;
    process.env.HTTP_PROXY = "";
    process.env.HTTPS_PROXY = " ";
    process.env.ALL_PROXY = "";
    delete process.env.XIAOHONGSHU_PUBLISH_URL;

    expect(loadConfig()).toEqual({
      port: 8788,
      logLevel: "info",
      duckcodingTextApiKey: undefined,
      duckcodingImageApiKey: undefined,
      duckcodingBaseUrl: undefined,
      duckcodingTextModel: undefined,
      duckcodingImageModel: undefined,
      duckcodingImageSize: undefined,
      amapApiKey: undefined,
      amapJsApiKey: undefined,
      openElevationBaseUrl: "https://api.open-elevation.com/api/v1/lookup",
      elevationSampleIntervalM: 100,
      elevationBatchSize: 100,
      elevationGainNoiseThresholdM: 3,
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

  it("allows a zero elevation gain noise threshold", () => {
    const previousEnv = { ...process.env };
    process.env.ELEVATION_GAIN_NOISE_THRESHOLD_M = "0";

    expect(loadConfig()).toMatchObject({
      elevationGainNoiseThresholdM: 0,
    });

    process.env = previousEnv;
  });

  it("rejects invalid positive integer V2 numeric configuration", () => {
    const previousEnv = { ...process.env };

    process.env.ELEVATION_SAMPLE_INTERVAL_M = "0";
    expect(() => loadConfig()).toThrow(
      "Invalid ELEVATION_SAMPLE_INTERVAL_M: must be a positive integer",
    );

    process.env.ELEVATION_SAMPLE_INTERVAL_M = "100";
    process.env.ELEVATION_BATCH_SIZE = "1.5";
    expect(() => loadConfig()).toThrow(
      "Invalid ELEVATION_BATCH_SIZE: must be a positive integer",
    );

    process.env.ELEVATION_BATCH_SIZE = "100";
    process.env.ELEVATION_GAIN_NOISE_THRESHOLD_M = "-1";
    expect(() => loadConfig()).toThrow(
      "Invalid ELEVATION_GAIN_NOISE_THRESHOLD_M: must be zero or a positive integer",
    );

    process.env = previousEnv;
  });
});
