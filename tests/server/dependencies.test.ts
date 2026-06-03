import { describe, expect, it } from "vitest";
import type { AppConfig } from "../../src/server/config";
import { createProductionDependencies } from "../../src/server/dependencies";

const config: AppConfig = {
  port: 8787,
  logLevel: "error",
  openaiApiKey: "sk-test",
  openaiTextModel: "gpt-test",
  openaiImageModel: "gpt-image-1",
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
  it("returns all API dependencies when configuration is complete", () => {
    const dependencies = createProductionDependencies(config);

    expect(dependencies.generatePost).toEqual(expect.any(Function));
    expect(dependencies.generateCover).toEqual(expect.any(Function));
    expect(dependencies.saveMarkdown).toEqual(expect.any(Function));
    expect(dependencies.assistPublish).toEqual(expect.any(Function));
    expect(dependencies.logger).toBeDefined();
  });

  it("does not crash on missing OpenAI configuration until the API is called", async () => {
    const dependencies = createProductionDependencies({
      ...config,
      openaiApiKey: undefined,
      openaiTextModel: undefined,
      openaiImageModel: undefined,
    });

    await expect(dependencies.generatePost?.(route)).rejects.toThrow(
      "OPENAI_API_KEY is required",
    );
    await expect(
      dependencies.generateCover?.({
        route,
        imagePrompt: "cycling poster background",
        coverTitle: "成都到青城山",
        coverSubtitle: "82km / 620m",
      }),
    ).rejects.toThrow("OPENAI_API_KEY is required");
  });
});
