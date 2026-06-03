import { describe, expect, it, vi } from "vitest";
import { createGenerateCoverUseCase } from "../../src/server/useCases/generateCoverUseCase";

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

describe("createGenerateCoverUseCase", () => {
  it("generates a background and composes the final cover", async () => {
    const generateBackground = vi.fn().mockResolvedValue("/tmp/background.png");
    const composeCover = vi.fn().mockResolvedValue({
      coverPath: "/tmp/cover.png",
      coverUrl: "/media/images/cover.png",
    });
    const useCase = createGenerateCoverUseCase({ generateBackground, composeCover });

    const result = await useCase({
      route,
      imagePrompt: "Strava-like cycling poster background, no text",
      coverTitle: "成都到青城山",
      coverSubtitle: "82km / 620m",
    });

    expect(result).toEqual({
      coverPath: "/tmp/cover.png",
      coverUrl: "/media/images/cover.png",
    });
    expect(generateBackground).toHaveBeenCalledWith(
      "Strava-like cycling poster background, no text",
    );
    expect(composeCover).toHaveBeenCalledWith({
      backgroundPath: "/tmp/background.png",
      route,
      coverTitle: "成都到青城山",
      coverSubtitle: "82km / 620m",
    });
  });

  it("rejects invalid cover requests", async () => {
    const useCase = createGenerateCoverUseCase({
      generateBackground: vi.fn(),
      composeCover: vi.fn(),
    });

    await expect(
      useCase({
        route: { ...route, distanceKm: 0 },
        imagePrompt: "prompt",
        coverTitle: "成都到青城山",
        coverSubtitle: "82km / 620m",
      }),
    ).rejects.toThrow();
  });
});
