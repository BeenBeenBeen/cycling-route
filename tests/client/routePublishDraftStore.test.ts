// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearRoutePublishDraft,
  readRoutePublishDraft,
  writeRoutePublishDraft,
  type RoutePublishDraft,
} from "../../src/client/stores/routePublishDraftStore";

const draft: RoutePublishDraft = {
  plannedRoute: {
    routeId: "route_1",
    routeName: "犀浦到青城山",
    start: { id: "B001", name: "犀浦", location: { gcj02: { lng: 104, lat: 30 } }, source: "amap" },
    end: { id: "B002", name: "青城山", location: { gcj02: { lng: 103, lat: 31 } }, source: "amap" },
    waypoints: [],
    distanceKm: 12.35,
    polylineGcj02: [{ lng: 104, lat: 30 }],
    polylineWgs84: [{ lng: 103.998, lat: 30.002 }],
    elevation: {
      status: "success",
      sampleIntervalM: 100,
      batchSize: 100,
      gainNoiseThresholdM: 3,
      points: [{ distanceM: 0, lng: 103.998, lat: 30.002, ele: 500 }],
      elevationGainM: 120,
    },
    routeFacts: {
      routeName: "犀浦到青城山",
      startPoint: "犀浦",
      endPoint: "青城山",
      distanceKm: 12.35,
      elevationGainM: 120,
      difficulty: "待确认",
      roadType: "待确认",
      highlights: ["待补充"],
      warnings: ["待补充"],
      supplyPoints: ["待补充"],
    },
  },
  routeFacts: {
    routeName: "犀浦到青城山",
    startPoint: "犀浦",
    endPoint: "青城山",
    distanceKm: 12.35,
    elevationGainM: 120,
    difficulty: "待确认",
    roadType: "待确认",
    highlights: ["待补充"],
    warnings: ["待补充"],
    supplyPoints: ["待补充"],
  },
  gpxPath: "data/routes/route-1.gpx",
  gpxUrl: "/media/routes/route-1.gpx",
  updatedAt: "2026-06-09T00:00:00.000Z",
};

describe("routePublishDraftStore", () => {
  beforeEach(() => localStorage.clear());

  it("writes and reads the latest route publish draft", () => {
    writeRoutePublishDraft(draft);

    expect(readRoutePublishDraft()).toEqual(draft);
  });

  it("returns null for missing or invalid drafts", () => {
    expect(readRoutePublishDraft()).toBeNull();

    localStorage.setItem("cycling-route.routePublishDraft", "{bad json");
    expect(readRoutePublishDraft()).toBeNull();
  });

  it("clears the draft", () => {
    writeRoutePublishDraft(draft);
    clearRoutePublishDraft();

    expect(readRoutePublishDraft()).toBeNull();
  });
});
