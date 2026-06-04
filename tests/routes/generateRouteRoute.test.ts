import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { createGenerateRouteHandler } from "../../src/server/routes/generateRouteRoute";

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
    points: [{ distanceM: 0, lng: 104.01, lat: 30.756, ele: 500 }],
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
    estimatedDuration: "约 1 小时 1 分钟",
  },
};

describe("createGenerateRouteHandler", () => {
  it("returns a planned route for valid input", async () => {
    const generateRoute = vi.fn().mockResolvedValue(plannedRoute);
    const { req, res } = mockHttp({ start, end });

    await createGenerateRouteHandler(generateRoute)(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ route: plannedRoute });
    expect(generateRoute).toHaveBeenCalledWith({ start, end });
  });

  it("returns 400 for invalid input", async () => {
    const generateRoute = vi.fn();
    const { req, res } = mockHttp({ start: { ...start, source: "manual" }, end });

    await createGenerateRouteHandler(generateRoute)(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Invalid route generation input",
      issues: expect.any(Array),
    });
    expect(generateRoute).not.toHaveBeenCalled();
  });

  it("returns 400 for non-empty waypoints", async () => {
    const generateRoute = vi.fn();
    const { req, res } = mockHttp({ start, end, waypoints: [start] });

    await createGenerateRouteHandler(generateRoute)(req, res);

    expect(res.statusCode).toBe(400);
    expect(generateRoute).not.toHaveBeenCalled();
  });

  it("returns 502 when route planning fails upstream", async () => {
    const generateRoute = vi.fn().mockRejectedValue(new Error("Amap route planning failed"));
    const { req, res } = mockHttp({ start, end });

    await createGenerateRouteHandler(generateRoute)(req, res);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({
      error: "Failed to generate route",
      detail: "Amap route planning failed",
    });
  });

  it("returns 502 when use case output validation fails", async () => {
    const generateRoute = vi.fn().mockRejectedValue(new ZodError([]));
    const { req, res } = mockHttp({ start, end });

    await createGenerateRouteHandler(generateRoute)(req, res);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: "Failed to generate route" });
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
