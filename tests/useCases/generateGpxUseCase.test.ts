import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { createGenerateGpxUseCase } from "../../src/server/useCases/generateGpxUseCase";

const start = {
  id: "B001",
  name: "犀浦",
  address: "成都市",
  city: "成都市",
  district: "郫都区",
  location: { gcj02: { lng: 104.012, lat: 30.758 } },
  source: "amap",
};

const end = {
  ...start,
  id: "B002",
  name: "青城山",
  location: { gcj02: { lng: 103.568, lat: 30.905 } },
};

const plannedRoute = {
  routeId: "route_1",
  routeName: "犀浦到青城山",
  start,
  end,
  waypoints: [],
  distanceKm: 12.35,
  estimatedDurationMin: 61,
  polylineGcj02: [start.location.gcj02, end.location.gcj02],
  polylineWgs84: [
    { lng: 104.01, lat: 30.756 },
    { lng: 103.566, lat: 30.903 },
  ],
  elevation: {
    status: "success",
    sampleIntervalM: 100,
    batchSize: 50,
    gainNoiseThresholdM: 5,
    points: [
      { distanceM: 0, lng: 104.01, lat: 30.756, ele: 500 },
      { distanceM: 100, lng: 103.566, lat: 30.903, ele: 520 },
    ],
    elevationGainM: 20,
  },
  routeFacts: {
    routeName: "犀浦到青城山",
    startPoint: "犀浦",
    endPoint: "青城山",
    distanceKm: 12.35,
    elevationGainM: 20,
    difficulty: "待确认",
    roadType: "待确认",
    highlights: ["待补充"],
    warnings: ["待补充"],
    supplyPoints: ["待补充"],
    estimatedDuration: "约 1 小时 1 分钟",
  },
};

describe("createGenerateGpxUseCase", () => {
  it("writes a GPX route with the planned route name by default", async () => {
    const writeGpx = vi.fn().mockResolvedValue({
      gpxPath: "data/routes/route-1.gpx",
      gpxUrl: "/media/routes/route-1.gpx",
      stravaCompatible: true,
    });
    const useCase = createGenerateGpxUseCase({ writeGpx });

    const result = await useCase({ route: plannedRoute });

    expect(writeGpx).toHaveBeenCalledWith({
      routeId: "route_1",
      name: "犀浦到青城山",
      points: plannedRoute.elevation.points,
      allowMissingElevation: undefined,
    });
    expect(result).toEqual({
      gpxPath: "data/routes/route-1.gpx",
      gpxUrl: "/media/routes/route-1.gpx",
      stravaCompatible: true,
    });
  });

  it("passes a custom name and allowMissingElevation flag to the writer", async () => {
    const writeGpx = vi.fn().mockResolvedValue({
      gpxPath: "data/routes/custom.gpx",
      gpxUrl: "/media/routes/custom.gpx",
      stravaCompatible: false,
    });
    const useCase = createGenerateGpxUseCase({ writeGpx });

    await expect(
      useCase({
        route: {
          ...plannedRoute,
          elevation: {
            ...plannedRoute.elevation,
            points: [{ distanceM: 0, lng: 104.01, lat: 30.756 }],
          },
        },
        name: "自定义路书",
        allowMissingElevation: true,
      }),
    ).resolves.toEqual({
      gpxPath: "data/routes/custom.gpx",
      gpxUrl: "/media/routes/custom.gpx",
      stravaCompatible: false,
    });
    expect(writeGpx).toHaveBeenCalledWith({
      routeId: "route_1",
      name: "自定义路书",
      points: [{ distanceM: 0, lng: 104.01, lat: 30.756 }],
      allowMissingElevation: true,
    });
  });

  it("rejects missing elevation unless explicitly allowed", async () => {
    const writeGpx = vi.fn();
    const useCase = createGenerateGpxUseCase({ writeGpx });

    await expect(
      useCase({
        route: {
          ...plannedRoute,
          elevation: {
            ...plannedRoute.elevation,
            points: [{ distanceM: 0, lng: 104.01, lat: 30.756 }],
          },
        },
      }),
    ).rejects.toThrow(ZodError);
    expect(writeGpx).not.toHaveBeenCalled();
  });
});
