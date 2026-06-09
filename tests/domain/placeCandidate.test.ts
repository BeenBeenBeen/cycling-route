import { describe, expect, it } from "vitest";
import { parsePlaceCandidate } from "../../src/server/domain/placeCandidate";

describe("parsePlaceCandidate", () => {
  it("accepts an amap candidate with gcj02 coordinates", () => {
    const candidate = parsePlaceCandidate({
      id: "B001",
      name: "成都东站",
      address: "成都市成华区",
      city: "成都市",
      district: "成华区",
      location: { gcj02: { lng: 104.141, lat: 30.63 } },
      source: "amap",
    });

    expect(candidate.location.gcj02.lng).toBeCloseTo(104.141);
  });

  it("rejects unsupported sources", () => {
    expect(() =>
      parsePlaceCandidate({
        id: "1",
        name: "x",
        location: { gcj02: { lng: 104, lat: 30 } },
        source: "manual",
      }),
    ).toThrow();
  });

  it("rejects invalid gcj02 coordinates", () => {
    expect(() =>
      parsePlaceCandidate({
        id: "1",
        name: "x",
        location: { gcj02: { lng: 181, lat: 30 } },
        source: "amap",
      }),
    ).toThrow();
  });
});
