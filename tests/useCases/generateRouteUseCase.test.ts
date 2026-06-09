import { describe, expect, it, vi } from "vitest";
import type { PlaceCandidate } from "../../src/server/domain/placeCandidate";
import { createGenerateRouteUseCase } from "../../src/server/useCases/generateRouteUseCase";

const place = (id: string, name: string, lng: number, lat: number): PlaceCandidate => ({
  id,
  name,
  address: "成都市",
  city: "成都市",
  district: "郫都区",
  location: { gcj02: { lng, lat } },
  source: "amap",
});

const start = place("B001", "犀浦", 104.012, 30.758);
const end = place("B002", "青城山", 103.568, 30.905);

describe("createGenerateRouteUseCase", () => {
  it("plans a cycling route, samples elevation, and fills route facts", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1_780_000_000_000);
    const planCyclingRoute = vi.fn().mockResolvedValue({
      distanceM: 12_345,
      durationSeconds: 3_660,
      polylineGcj02: [
        start.location.gcj02,
        { lng: 104.014, lat: 30.758 },
        end.location.gcj02,
      ],
    });
    const lookupElevation = vi.fn(async (samples) =>
      samples.map((sample: any, index: number) => ({ ...sample, ele: 500 + index * 10 })),
    );
    const useCase = createGenerateRouteUseCase({
      planCyclingRoute,
      lookupElevation,
      sampleIntervalM: 100,
      elevationBatchSize: 50,
      gainNoiseThresholdM: 5,
    });

    const route = await useCase({ start, end });

    expect(planCyclingRoute).toHaveBeenCalledWith({ start, end });
    expect(lookupElevation).toHaveBeenCalledOnce();
    expect(lookupElevation.mock.calls[0][0][0]).toMatchObject({ distanceM: 0 });
    expect(lookupElevation.mock.calls[0][0].some((point: any) => point.distanceM === 100)).toBe(
      true,
    );
    expect(route).toMatchObject({
      routeId: "route_1780000000000",
      routeName: "犀浦到青城山",
      start,
      end,
      waypoints: [],
      distanceKm: 12.35,
      estimatedDurationMin: 61,
      elevation: {
        status: "success",
        sampleIntervalM: 100,
        batchSize: 50,
        gainNoiseThresholdM: 5,
      },
      routeFacts: {
        routeName: "犀浦到青城山",
        startPoint: "犀浦",
        endPoint: "青城山",
        distanceKm: 12.35,
        difficulty: "待确认",
        roadType: "待确认",
        highlights: ["待补充"],
        warnings: ["待补充"],
        supplyPoints: ["待补充"],
        estimatedDuration: "约 1 小时 1 分钟",
      },
    });
    expect(route.polylineGcj02).toEqual([
      start.location.gcj02,
      { lng: 104.014, lat: 30.758 },
      end.location.gcj02,
    ]);
    expect(route.polylineWgs84).not.toEqual(route.polylineGcj02);
    expect(route.elevation.elevationGainM).toBeGreaterThan(0);
    expect(route.routeFacts.elevationGainM).toBe(route.elevation.elevationGainM);
  });

  it("uses request sampling overrides", async () => {
    const planCyclingRoute = vi.fn().mockResolvedValue({
      distanceM: 1_000,
      polylineGcj02: [start.location.gcj02, end.location.gcj02],
    });
    const lookupElevation = vi.fn(async (samples) =>
      samples.map((sample: any) => ({ ...sample, ele: 500 })),
    );
    const useCase = createGenerateRouteUseCase({
      planCyclingRoute,
      lookupElevation,
      sampleIntervalM: 100,
      elevationBatchSize: 50,
      gainNoiseThresholdM: 5,
    });

    const route = await useCase({
      start,
      end,
      sampleIntervalM: 250,
      elevationBatchSize: 12,
    });

    expect(route.elevation.sampleIntervalM).toBe(250);
    expect(route.elevation.batchSize).toBe(12);
    expect(lookupElevation).toHaveBeenCalledWith(expect.any(Array), { batchSize: 12 });
  });

  it("returns the route with failed elevation when lookup fails", async () => {
    const planCyclingRoute = vi.fn().mockResolvedValue({
      distanceM: 5_000,
      durationSeconds: 2_700,
      polylineGcj02: [start.location.gcj02, end.location.gcj02],
    });
    const lookupElevation = vi.fn().mockRejectedValue(new Error("Open-Elevation timed out"));
    const useCase = createGenerateRouteUseCase({
      planCyclingRoute,
      lookupElevation,
      sampleIntervalM: 100,
      elevationBatchSize: 50,
      gainNoiseThresholdM: 5,
    });

    const route = await useCase({ start, end });

    expect(route.elevation.status).toBe("failed");
    expect(route.elevation.error).toBe("Open-Elevation timed out");
    expect(route.elevation.points.every((point) => point.ele === undefined)).toBe(true);
    expect(route.routeFacts.elevationGainM).toBe(0);
    expect(route.routeFacts.estimatedDuration).toBe("约 45 分钟");
  });

  it("rejects invalid places and non-empty waypoints before planning", async () => {
    const planCyclingRoute = vi.fn();
    const lookupElevation = vi.fn();
    const useCase = createGenerateRouteUseCase({
      planCyclingRoute,
      lookupElevation,
      sampleIntervalM: 100,
      elevationBatchSize: 50,
      gainNoiseThresholdM: 5,
    });

    await expect(
      useCase({ start: { ...start, source: "manual" } as any, end }),
    ).rejects.toThrow();
    await expect(useCase({ start, end, waypoints: [place("B003", "都江堰", 103.62, 30.99)] }))
      .rejects.toThrow("Waypoints are not supported in V2.0 route generation.");
    expect(planCyclingRoute).not.toHaveBeenCalled();
  });
});
