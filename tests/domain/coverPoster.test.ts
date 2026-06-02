import { describe, expect, it } from "vitest";
import { coverPosterRequestSchema } from "../../src/server/domain/coverPoster";

const validRoute = {
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

const validRequest = {
  route: validRoute,
  imagePrompt: "Strava-like cycling poster background, no text",
  coverTitle: "成都到青城山",
  coverSubtitle: "82km / 620m",
};

describe("coverPosterRequestSchema", () => {
  it("accepts a valid cover request", () => {
    expect(() => coverPosterRequestSchema.parse(validRequest)).not.toThrow();
  });

  it("rejects blank cover fields", () => {
    expect(() =>
      coverPosterRequestSchema.parse({ ...validRequest, imagePrompt: "" }),
    ).toThrow();
    expect(() =>
      coverPosterRequestSchema.parse({ ...validRequest, coverTitle: "" }),
    ).toThrow();
  });

  it("rejects invalid nested route facts", () => {
    expect(() =>
      coverPosterRequestSchema.parse({
        ...validRequest,
        route: { ...validRoute, distanceKm: 0 },
      }),
    ).toThrow();
  });
});
