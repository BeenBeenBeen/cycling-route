import { describe, expect, it } from "vitest";
import { createProductionApp } from "../../src/server/productionApp";

const config = {
  port: 8788,
  logLevel: "error" as const,
  duckcodingTextApiKey: "duck-text-key",
  duckcodingImageApiKey: "duck-image-key",
  duckcodingBaseUrl: "https://www.duckcoding.ai/v1",
  duckcodingTextModel: "gpt-5.5",
  duckcodingImageModel: "gpt-image-1",
  duckcodingImageSize: "1024x1536",
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
  });
});
