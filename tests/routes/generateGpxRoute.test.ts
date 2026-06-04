import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { createGenerateGpxHandler } from "../../src/server/routes/generateGpxRoute";

const route = {
  routeId: "route_1",
  routeName: "犀浦到青城山",
  start: {
    id: "B001",
    name: "犀浦",
    location: { gcj02: { lng: 104.012, lat: 30.758 } },
    source: "amap",
  },
  end: {
    id: "B002",
    name: "青城山",
    location: { gcj02: { lng: 103.568, lat: 30.905 } },
    source: "amap",
  },
  waypoints: [],
  distanceKm: 12.35,
  polylineGcj02: [{ lng: 104.012, lat: 30.758 }],
  polylineWgs84: [{ lng: 104.01, lat: 30.756 }],
  elevation: {
    status: "success",
    sampleIntervalM: 100,
    batchSize: 50,
    gainNoiseThresholdM: 5,
    points: [{ distanceM: 0, lng: 104.01, lat: 30.756, ele: 500 }],
    elevationGainM: 0,
  },
  routeFacts: {
    routeName: "犀浦到青城山",
    startPoint: "犀浦",
    endPoint: "青城山",
    distanceKm: 12.35,
    elevationGainM: 0,
    difficulty: "待确认",
    roadType: "待确认",
    highlights: ["待补充"],
    warnings: ["待补充"],
    supplyPoints: ["待补充"],
  },
};

describe("createGenerateGpxHandler", () => {
  it("returns the generated GPX result", async () => {
    const generateGpx = vi.fn().mockResolvedValue({
      gpxPath: "data/routes/route-1.gpx",
      gpxUrl: "/media/routes/route-1.gpx",
      stravaCompatible: true,
    });
    const { req, res } = mockHttp({ route });

    await createGenerateGpxHandler(generateGpx)(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      gpxPath: "data/routes/route-1.gpx",
      gpxUrl: "/media/routes/route-1.gpx",
      stravaCompatible: true,
    });
    expect(generateGpx).toHaveBeenCalledWith({ route });
  });

  it("returns 400 when GPX validation fails", async () => {
    const generateGpx = vi.fn().mockRejectedValue(new ZodError([]));
    const { req, res } = mockHttp({ route });

    await createGenerateGpxHandler(generateGpx)(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Invalid GPX generation input",
      issues: expect.any(Array),
    });
  });

  it("returns 500 when GPX writing fails unexpectedly", async () => {
    const generateGpx = vi.fn().mockRejectedValue(new Error("disk full"));
    const { req, res } = mockHttp({ route });

    await createGenerateGpxHandler(generateGpx)(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: "Failed to generate GPX",
      detail: "disk full",
    });
  });
});

const mockHttp = (body: unknown) => {
  const req = { body };
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return { req, res };
};
