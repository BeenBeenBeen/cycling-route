import { describe, expect, it } from "vitest";
import { parseRouteInput } from "../../src/server/domain/routeInput";

const validRoute = {
  routeName: "成都到青城山周末骑行",
  startPoint: "犀浦",
  endPoint: "青城山",
  distanceKm: 82,
  elevationGainM: 620,
  difficulty: "进阶",
  roadType: "绿道、公路、乡道",
  highlights: ["绿道舒服", "青城山适合拍照"],
  warnings: ["返程注意车流"],
  supplyPoints: ["都江堰城区"],
};

describe("parseRouteInput", () => {
  it("accepts valid route input", () => {
    expect(parseRouteInput(validRoute)).toMatchObject(validRoute);
  });

  it("rejects empty required fields", () => {
    expect(() => parseRouteInput({ ...validRoute, routeName: "" })).toThrow();
  });

  it("rejects invalid distance and elevation", () => {
    expect(() => parseRouteInput({ ...validRoute, distanceKm: 0 })).toThrow();
    expect(() => parseRouteInput({ ...validRoute, elevationGainM: -1 })).toThrow();
  });

  it("cleans list fields", () => {
    const parsed = parseRouteInput({
      ...validRoute,
      highlights: ["  绿道舒服  ", ""],
    });
    expect(parsed.highlights).toEqual(["绿道舒服"]);
  });

  it("treats blank optional text fields as omitted", () => {
    const parsed = parseRouteInput({
      ...validRoute,
      bestSeason: "",
      extraNotes: "   ",
    });

    expect(parsed).not.toHaveProperty("bestSeason");
    expect(parsed).not.toHaveProperty("extraNotes");
  });
});
