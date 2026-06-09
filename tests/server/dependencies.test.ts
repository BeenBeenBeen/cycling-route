import { describe, expect, it } from "vitest";
import { vi } from "vitest";
import type { AppConfig } from "../../src/server/config";
import { createProductionDependencies } from "../../src/server/dependencies";

const config: AppConfig = {
  port: 8787,
  appMode: "development",
  logLevel: "error",
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
  proxy: {},
  xiaohongshuPublishUrl: "https://example.test/publish",
};

const route = {
  routeName: "成都到青城山周末骑行",
  startPoint: "犀浦",
  endPoint: "青城山",
  distanceKm: 82,
  elevationGainM: 620,
  difficulty: "进阶",
  roadType: "绿道、公路、乡道",
  highlights: ["绿道舒服"],
  warnings: ["返程注意车流"],
  supplyPoints: ["都江堰城区"],
};

describe("createProductionDependencies", () => {
  it("logs the effective server configuration", () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    createProductionDependencies(config, { logger } as any);

    expect(logger.info).toHaveBeenCalledWith(
      "server.config.loaded",
      expect.objectContaining({
        port: 8787,
        logLevel: "error",
        hasDuckcodingTextApiKey: true,
        hasDuckcodingImageApiKey: true,
        duckcodingBaseUrl: "https://duck.test/v1",
        duckcodingTextModel: "duck-text-test",
        duckcodingImageModel: "duck-image-test",
        duckcodingImageSize: "1024x1536",
        hasAmapApiKey: true,
        hasAmapJsApiKey: true,
        openElevationBaseUrl: "https://elevation.test/lookup",
        elevationSampleIntervalM: 250,
        elevationBatchSize: 75,
        elevationGainNoiseThresholdM: 5,
      }),
    );
    expect(JSON.stringify(logger.info.mock.calls)).not.toContain("amap-server-key");
    expect(JSON.stringify(logger.info.mock.calls)).not.toContain("amap-js-key");
  });

  it("returns all API dependencies when configuration is complete", () => {
    const dependencies = createProductionDependencies(config);

    expect(dependencies.generatePost).toEqual(expect.any(Function));
    expect(dependencies.generateCover).toEqual(expect.any(Function));
    expect(dependencies.saveMarkdown).toEqual(expect.any(Function));
    expect(dependencies.assistPublish).toEqual(expect.any(Function));
    expect(dependencies.searchPlaces).toEqual(expect.any(Function));
    expect(dependencies.generateRoute).toEqual(expect.any(Function));
    expect(dependencies.generateGpx).toEqual(expect.any(Function));
    expect(dependencies.logger).toBeDefined();
  });

  it("does not crash on missing OpenAI configuration until the API is called", async () => {
    const dependencies = createProductionDependencies({
      ...config,
      duckcodingTextApiKey: undefined,
      duckcodingImageApiKey: undefined,
    });

    await expect(dependencies.generatePost?.(route)).rejects.toThrow(
      "DUCKCODING_TEXT_API_KEY is required",
    );
    await expect(
      dependencies.generateCover?.({
        route,
        imagePrompt: "cycling poster background",
        coverTitle: "成都到青城山",
        coverSubtitle: "82km / 620m",
      }),
    ).rejects.toThrow("DUCKCODING_IMAGE_API_KEY is required");
  });
});
