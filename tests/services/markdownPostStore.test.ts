import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { saveMarkdownPost } from "../../src/server/services/markdownPostStore";

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

describe("saveMarkdownPost", () => {
  it("stores a publishing draft as markdown", async () => {
    const outputDir = await mkdtemp(path.join(os.tmpdir(), "cycling-post-"));
    const now = new Date(2026, 5, 3, 1, 2, 0);
    try {
      const result = await saveMarkdownPost({
        route,
        post,
        selectedTitle: "标题一",
        coverPath: "/tmp/cover.png",
        outputDir,
        now,
      });

      expect(path.basename(result.markdownPath)).toBe(
        "2026-06-03-0102-成都到青城山周末骑行.md",
      );
      const markdown = await readFile(result.markdownPath, "utf8");
      expect(markdown).toContain("# 标题一");
      expect(markdown).toContain("路线名称：成都到青城山周末骑行");
      expect(markdown).toContain("起点：犀浦");
      expect(markdown).toContain("终点：青城山");
      expect(markdown).toContain("82 km");
      expect(markdown).toContain("620 m");
      expect(markdown).toContain("小红书正文");
      expect(markdown).toContain("路线攻略");
      expect(markdown).toContain("路线彩蛋");
      expect(markdown).toContain("#成都骑行 #路线攻略 #周末骑行");
      expect(markdown).toContain("/tmp/cover.png");
      expect(markdown).toContain(`生成时间：${now.toISOString()}`);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });
});
