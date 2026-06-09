import { describe, expect, it, vi } from "vitest";
import { createSaveMarkdownUseCase } from "../../src/server/useCases/saveMarkdownUseCase";

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

const post = {
  titleCandidates: ["标题一", "标题二", "标题三"],
  body: "小红书正文",
  guide: "路线攻略",
  easterEgg: "路线彩蛋",
  hashtags: ["成都骑行", "路线攻略", "周末骑行"],
  coverTitle: "成都到青城山",
  coverSubtitle: "82km / 620m",
  imagePrompt: "no text cycling poster background",
};

describe("createSaveMarkdownUseCase", () => {
  it("passes optional GPX path to the markdown store", async () => {
    const saveMarkdown = vi.fn().mockResolvedValue({ markdownPath: "/tmp/post.md" });
    const useCase = createSaveMarkdownUseCase({ saveMarkdown });

    await expect(
      useCase({
        route,
        post,
        selectedTitle: "标题一",
        coverPath: "/tmp/cover.png",
        gpxPath: "data/routes/test.gpx",
      }),
    ).resolves.toEqual({ markdownPath: "/tmp/post.md" });

    expect(saveMarkdown).toHaveBeenCalledWith({
      route,
      post,
      selectedTitle: "标题一",
      coverPath: "/tmp/cover.png",
      gpxPath: "data/routes/test.gpx",
    });
  });
});
