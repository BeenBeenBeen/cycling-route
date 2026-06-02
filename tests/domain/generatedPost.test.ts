import { describe, expect, it } from "vitest";
import { generatedPostSchema } from "../../src/server/domain/generatedPost";

const validPost = {
  titleCandidates: ["a", "b", "c"],
  body: "正文",
  guide: "攻略",
  easterEgg: "彩蛋",
  hashtags: ["成都骑行", "路线攻略", "周末骑行"],
  coverTitle: "成都到青城山",
  coverSubtitle: "82km / 620m",
  imagePrompt: "no text cycling poster background",
};

describe("generatedPostSchema", () => {
  it("requires structured post fields", () => {
    expect(() => generatedPostSchema.parse(validPost)).not.toThrow();
  });

  it("requires exactly three title candidates", () => {
    expect(() =>
      generatedPostSchema.parse({ ...validPost, titleCandidates: ["a", "b"] }),
    ).toThrow();
    expect(() =>
      generatedPostSchema.parse({
        ...validPost,
        titleCandidates: ["a", "b", "c", "d"],
      }),
    ).toThrow();
  });

  it("requires at least three hashtags", () => {
    expect(() =>
      generatedPostSchema.parse({ ...validPost, hashtags: ["成都骑行", "路线攻略"] }),
    ).toThrow();
  });

  it("rejects blank generated text fields", () => {
    expect(() => generatedPostSchema.parse({ ...validPost, body: "   " })).toThrow();
    expect(() =>
      generatedPostSchema.parse({ ...validPost, coverTitle: "   " }),
    ).toThrow();
    expect(() =>
      generatedPostSchema.parse({ ...validPost, imagePrompt: "   " }),
    ).toThrow();
  });
});
