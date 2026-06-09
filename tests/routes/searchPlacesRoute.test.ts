import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { createSearchPlacesHandler } from "../../src/server/routes/searchPlacesRoute";

const candidates = [
  {
    id: "B001",
    name: "犀浦",
    address: "成都市",
    city: "成都市",
    district: "郫都区",
    location: { gcj02: { lng: 104.01, lat: 30.67 } },
    source: "amap",
  },
];

describe("createSearchPlacesHandler", () => {
  it("returns candidates for valid search input", async () => {
    const searchPlaces = vi.fn().mockResolvedValue({
      startCandidates: candidates,
      endCandidates: candidates,
    });
    const { req, res } = mockHttp({
      startQuery: "犀浦",
      endQuery: "青城山",
      city: "成都",
      limit: 3,
    });

    await createSearchPlacesHandler(searchPlaces)(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      startCandidates: candidates,
      endCandidates: candidates,
    });
    expect(searchPlaces).toHaveBeenCalledWith({
      startQuery: "犀浦",
      endQuery: "青城山",
      city: "成都",
      limit: 3,
    });
  });

  it("returns 400 for blank required queries", async () => {
    const searchPlaces = vi.fn();
    const { req, res } = mockHttp({ startQuery: " ", endQuery: "青城山" });

    await createSearchPlacesHandler(searchPlaces)(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Invalid place search input",
      issues: expect.any(Array),
    });
    expect(searchPlaces).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid limit", async () => {
    const searchPlaces = vi.fn();
    const { req, res } = mockHttp({ startQuery: "犀浦", endQuery: "青城山", limit: 11 });

    await createSearchPlacesHandler(searchPlaces)(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Invalid place search input",
      issues: expect.any(Array),
    });
    expect(searchPlaces).not.toHaveBeenCalled();
  });

  it("returns 502 when upstream search fails", async () => {
    const searchPlaces = vi.fn().mockRejectedValue(new Error("Amap place search failed"));
    const { req, res } = mockHttp({ startQuery: "犀浦", endQuery: "青城山" });

    await createSearchPlacesHandler(searchPlaces)(req, res);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({
      error: "Failed to search places",
      detail: "Amap place search failed",
    });
  });

  it("returns 502 when use case validation fails", async () => {
    const searchPlaces = vi.fn().mockRejectedValue(new ZodError([]));
    const { req, res } = mockHttp({ startQuery: "犀浦", endQuery: "青城山" });

    await createSearchPlacesHandler(searchPlaces)(req, res);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: "Failed to search places" });
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
