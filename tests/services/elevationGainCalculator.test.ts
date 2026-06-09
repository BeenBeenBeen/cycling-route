import { describe, expect, it } from "vitest";
import { calculateElevationGainM } from "../../src/server/services/elevationGainCalculator";

describe("calculateElevationGainM", () => {
  it("sums climbs above the noise threshold", () => {
    expect(
      calculateElevationGainM(
        [{ ele: 500 }, { ele: 502 }, { ele: 510 }, { ele: 508 }, { ele: 520 }],
        3,
      ),
    ).toBe(20);
  });

  it("calculates cumulative gain instead of endpoint elevation difference", () => {
    expect(
      calculateElevationGainM(
        [{ ele: 100 }, { ele: 130 }, { ele: 90 }, { ele: 120 }],
        0,
      ),
    ).toBe(60);
  });

  it("returns zero when fewer than two elevation values exist", () => {
    expect(calculateElevationGainM([{ ele: 500 }], 3)).toBe(0);
    expect(calculateElevationGainM([{ lng: 104, lat: 30 }], 3)).toBe(0);
  });

  it("ignores points without valid numeric elevation", () => {
    expect(
      calculateElevationGainM(
        [
          { ele: 100 },
          {},
          { ele: Number.NaN },
          { ele: 104 },
          { ele: Number.POSITIVE_INFINITY },
          { ele: 109 },
        ],
        3,
      ),
    ).toBe(9);
  });

  it("counts positive deltas equal to the threshold", () => {
    expect(calculateElevationGainM([{ ele: 100 }, { ele: 103 }], 3)).toBe(3);
  });

  it("rounds the accumulated gain to whole meters", () => {
    expect(calculateElevationGainM([{ ele: 100.2 }, { ele: 103.6 }, { ele: 106.9 }], 3)).toBe(7);
  });

  it("rejects negative thresholds", () => {
    expect(() => calculateElevationGainM([{ ele: 100 }, { ele: 101 }], -1)).toThrow();
  });
});
