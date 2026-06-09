import { describe, expect, it } from "vitest";
import { sampleRouteEveryMeters } from "../../src/server/services/routeSampler";

describe("sampleRouteEveryMeters", () => {
  it("includes first and last points and samples intermediate distances", () => {
    const samples = sampleRouteEveryMeters(
      [
        { lng: 104.0, lat: 30.0 },
        { lng: 104.0, lat: 30.002 },
      ],
      100,
    );

    expect(samples[0]).toEqual({ distanceM: 0, lng: 104.0, lat: 30.0 });
    expect(samples[1]?.distanceM).toBeCloseTo(100);
    expect(samples[2]?.distanceM).toBeCloseTo(200);
    expect(samples.at(-1)?.distanceM).toBeGreaterThan(220);
    expect(samples.at(-1)?.lng).toBeCloseTo(104.0);
    expect(samples.at(-1)?.lat).toBeCloseTo(30.002);
    expect(samples.length).toBeGreaterThanOrEqual(3);
  });

  it("rejects invalid sample intervals", () => {
    expect(() => sampleRouteEveryMeters([{ lng: 104, lat: 30 }], 0)).toThrow();
    expect(() => sampleRouteEveryMeters([{ lng: 104, lat: 30 }], -1)).toThrow();
  });

  it("rejects routes without points", () => {
    expect(() => sampleRouteEveryMeters([], 100)).toThrow();
  });

  it("returns the only point for a single-point route", () => {
    expect(sampleRouteEveryMeters([{ lng: 104, lat: 30 }], 100)).toEqual([
      { distanceM: 0, lng: 104, lat: 30 },
    ]);
  });

  it("does not duplicate a segment boundary when it lands on a sample interval", () => {
    const samples = sampleRouteEveryMeters(
      [
        { lng: 104.0, lat: 30.0 },
        { lng: 104.0, lat: 30.0008993216 },
        { lng: 104.0, lat: 30.0017986432 },
      ],
      100,
    );

    const pointsAt100m = samples.filter((sample) => Math.abs(sample.distanceM - 100) < 1);
    expect(pointsAt100m).toHaveLength(1);
  });
});
