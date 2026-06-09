import { describe, expect, it, vi } from "vitest";
import { createGeneratePostUseCase } from "../../src/server/useCases/generatePostUseCase";

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

describe("createGeneratePostUseCase", () => {
  it("generates and validates post content", async () => {
    const generatePost = vi.fn().mockResolvedValue({
      titleCandidates: ["a", "b", "c"],
      body: "正文",
      guide: "攻略",
      easterEgg: "彩蛋",
      hashtags: ["成都骑行", "路线攻略", "周末骑行"],
      coverTitle: "成都到青城山",
      coverSubtitle: "82km / 620m",
      imagePrompt: "no text cycling poster background",
    });
    const useCase = createGeneratePostUseCase({ generatePost });

    await expect(useCase(route)).resolves.toMatchObject({
      coverTitle: "成都到青城山",
    });
    expect(generatePost).toHaveBeenCalledWith(route);
  });

  it("rejects generated post content that violates the schema", async () => {
    const generatePost = vi.fn().mockResolvedValue({
      titleCandidates: ["only one"],
      body: "正文",
      guide: "攻略",
      easterEgg: "彩蛋",
      hashtags: ["成都骑行"],
      coverTitle: "成都到青城山",
      coverSubtitle: "82km / 620m",
      imagePrompt: "no text cycling poster background",
    });
    const useCase = createGeneratePostUseCase({ generatePost } as any);

    await expect(useCase(route)).rejects.toThrow();
  });
});
