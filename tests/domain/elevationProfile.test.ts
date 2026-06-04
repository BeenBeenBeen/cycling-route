import { describe, expect, it } from "vitest";
import { parseElevationProfile } from "../../src/server/domain/elevationProfile";

const validProfile = {
  status: "success",
  sampleIntervalM: 100,
  batchSize: 100,
  gainNoiseThresholdM: 3,
  points: [{ distanceM: 0, lng: 104.139, lat: 30.632, ele: 512 }],
  elevationGainM: 620,
};

describe("parseElevationProfile", () => {
  it.each(["success", "partial", "failed"] as const)("accepts %s status", (status) => {
    const profile = parseElevationProfile({
      ...validProfile,
      status,
      elevationGainM: status === "failed" ? undefined : 620,
      error: status === "failed" ? "open-elevation unavailable" : undefined,
    });

    expect(profile.status).toBe(status);
  });

  it("rejects invalid status", () => {
    expect(() =>
      parseElevationProfile({
        ...validProfile,
        status: "pending",
      }),
    ).toThrow();
  });

  it("rejects invalid sampling parameters", () => {
    expect(() =>
      parseElevationProfile({
        ...validProfile,
        sampleIntervalM: 0,
      }),
    ).toThrow();
  });
});
