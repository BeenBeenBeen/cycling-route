import { describe, expect, it } from "vitest";
import { createProductionApp } from "../../src/server/productionApp";

const config = {
  port: 8788,
  appMode: "deployment" as const,
  logLevel: "error" as const,
  duckcodingTextApiKey: "duck-text-key",
  duckcodingImageApiKey: "duck-image-key",
  duckcodingBaseUrl: "https://www.duckcoding.ai/v1",
  duckcodingTextModel: "gpt-5.5",
  duckcodingImageModel: "gpt-image-1",
  duckcodingImageSize: "1024x1536",
  amapApiKey: "amap-server-key",
  amapJsApiKey: "amap-js-key",
  openElevationBaseUrl: "https://api.open-elevation.com/api/v1/lookup",
  elevationSampleIntervalM: 100,
  elevationBatchSize: 100,
  elevationGainNoiseThresholdM: 3,
  proxy: {},
  xiaohongshuPublishUrl: "https://creator.xiaohongshu.com/publish/publish",
};

describe("createProductionApp", () => {
  it("registers generate APIs with production dependencies", async () => {
    const app = createProductionApp(config);
    const routes = (app as any).router.stack
      .map((layer: any) => layer.route?.path)
      .filter(Boolean);

    expect(routes).toContain("/api/generate-post");
    expect(routes).toContain("/api/generate-cover");
    expect(routes).toContain("/api/generate-gpx");
    expect(routes).toContain("/media/routes/:filename");
  });
});
