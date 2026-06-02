import { describe, expect, it } from "vitest";
import { publishDraftSchema } from "../../src/server/domain/publishDraft";

const validDraft = {
  title: "成都周末骑到青城山",
  body: "这条路线适合周末出发。",
  hashtags: ["成都骑行"],
  coverPath: "data/images/cover.png",
};

describe("publishDraftSchema", () => {
  it("accepts a valid publish draft", () => {
    expect(() => publishDraftSchema.parse(validDraft)).not.toThrow();
  });

  it("rejects blank required text", () => {
    expect(() => publishDraftSchema.parse({ ...validDraft, title: "" })).toThrow();
    expect(() => publishDraftSchema.parse({ ...validDraft, body: "" })).toThrow();
    expect(() => publishDraftSchema.parse({ ...validDraft, coverPath: "" })).toThrow();
  });

  it("rejects empty or blank hashtags", () => {
    expect(() => publishDraftSchema.parse({ ...validDraft, hashtags: [] })).toThrow();
    expect(() =>
      publishDraftSchema.parse({ ...validDraft, hashtags: [""] }),
    ).toThrow();
  });
});
