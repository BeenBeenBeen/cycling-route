import { describe, expect, it } from "vitest";
import { buildPostPrompt } from "../../src/server/domain/promptBuilder";

describe("buildPostPrompt", () => {
  it("preserves route facts and requires JSON output", () => {
    const prompt = buildPostPrompt({
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
    });

    expect(prompt).toContain("输出必须是 JSON");
    expect(prompt).toContain("82");
    expect(prompt).toContain("620");
    expect(prompt).toContain("不能编造确定存在的店铺、景点或服务");
    expect(prompt).toContain("无最终中文文字");
  });
});
