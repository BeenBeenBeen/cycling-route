import { describe, expect, it } from "vitest";
import { parsePlannedRoute } from "../../src/server/domain/plannedRoute";

const place = {
  id: "B001",
  name: "成都东站",
  address: "成都市成华区",
  city: "成都市",
  district: "成华区",
  location: { gcj02: { lng: 104.141, lat: 30.63 } },
  source: "amap",
};

const elevation = {
  status: "success",
  sampleIntervalM: 100,
  batchSize: 100,
  gainNoiseThresholdM: 3,
  points: [{ distanceM: 0, lng: 104.139, lat: 30.632, ele: 512 }],
  elevationGainM: 620,
};

const routeFacts = {
  routeName: "成都东站到青城山",
  startPoint: "成都东站",
  endPoint: "青城山",
  distanceKm: 82.4,
  elevationGainM: 620,
  difficulty: "待确认",
  roadType: "待确认",
  highlights: ["待补充"],
  warnings: ["待补充"],
  supplyPoints: ["待补充"],
};

const validRoute = {
  routeId: "route_20260604_001",
  routeName: "成都东站到青城山",
  start: place,
  end: { ...place, id: "B002", name: "青城山" },
  waypoints: [],
  distanceKm: 82.4,
  estimatedDurationMin: 318,
  polylineGcj02: [{ lng: 104.141, lat: 30.63 }],
  polylineWgs84: [{ lng: 104.139, lat: 30.632 }],
  elevation,
  routeFacts,
};

describe("parsePlannedRoute", () => {
  it("accepts a planned route with both coordinate polylines", () => {
    const route = parsePlannedRoute(validRoute);

    expect(route.polylineGcj02).toHaveLength(1);
    expect(route.polylineWgs84).toHaveLength(1);
  });

  it("requires both gcj02 and wgs84 polylines", () => {
    expect(() => {
      const { polylineWgs84: _polylineWgs84, ...route } = validRoute;
      parsePlannedRoute(route);
    }).toThrow();
  });

  it("rejects empty route ids", () => {
    expect(() => parsePlannedRoute({ ...validRoute, routeId: "" })).toThrow();
  });
});
