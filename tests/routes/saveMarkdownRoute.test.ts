import { describe, expect, it, vi } from "vitest";
import { createSaveMarkdownHandler } from "../../src/server/routes/saveMarkdownRoute";

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

const validBody = {
  route,
  post,
  selectedTitle: "标题一",
  coverPath: "/tmp/cover.png",
  gpxPath: "data/routes/test.gpx",
};

describe("createSaveMarkdownHandler", () => {
  it("returns a markdown path for valid input", async () => {
    const saveMarkdown = vi
      .fn()
      .mockResolvedValue({ markdownPath: "/tmp/post.md" });
    const { req, res } = mockHttp(validBody);

    await createSaveMarkdownHandler(saveMarkdown)(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ markdownPath: "/tmp/post.md" });
    expect(saveMarkdown).toHaveBeenCalledWith(validBody);
  });

  it("returns 400 for invalid input", async () => {
    const saveMarkdown = vi.fn();
    const { req, res } = mockHttp({ ...validBody, selectedTitle: "" });

    await createSaveMarkdownHandler(saveMarkdown)(req, res);

    expect(res.statusCode).toBe(400);
    expect(saveMarkdown).not.toHaveBeenCalled();
  });

  it("returns 500 when writing fails", async () => {
    const saveMarkdown = vi.fn().mockRejectedValue(new Error("disk full"));
    const { req, res } = mockHttp(validBody);

    await createSaveMarkdownHandler(saveMarkdown)(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: "Failed to save markdown",
      detail: "disk full",
    });
  });
});

const mockHttp = (body: unknown) => {
  const req = { body };
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return { req, res };
};
