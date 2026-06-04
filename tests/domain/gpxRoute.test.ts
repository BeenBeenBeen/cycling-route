import { describe, expect, it } from "vitest";
import { parseGpxRoute } from "../../src/server/domain/gpxRoute";

const validGpxRoute = {
  routeId: "route_20260604_001",
  name: "成都东站到青城山",
  points: [{ distanceM: 0, lng: 104.139, lat: 30.632, ele: 512 }],
  gpxPath: "data/gpx/route_20260604_001.gpx",
  gpxUrl: "/downloads/route_20260604_001.gpx",
  stravaCompatible: true,
};

describe("parseGpxRoute", () => {
  it("accepts a strava compatible gpx route", () => {
    const route = parseGpxRoute(validGpxRoute);

    expect(route.stravaCompatible).toBe(true);
  });

  it("requires a .gpx download url", () => {
    expect(() =>
      parseGpxRoute({
        ...validGpxRoute,
        gpxUrl: "/downloads/route_20260604_001.txt",
      }),
    ).toThrow();
  });

  it("requires stravaCompatible", () => {
    expect(() => {
      const { stravaCompatible: _stravaCompatible, ...route } = validGpxRoute;
      parseGpxRoute(route);
    }).toThrow();
  });
});
