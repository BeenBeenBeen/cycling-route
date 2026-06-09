import { describe, expect, it, vi } from "vitest";
import { createOpenElevationProvider } from "../../src/server/services/openElevationProvider";

describe("createOpenElevationProvider", () => {
  it("posts locations in batches and maps elevations back in input order", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(
        Response.json({ results: [{ elevation: 501 }, { elevation: 508 }] }),
      )
      .mockResolvedValueOnce(Response.json({ results: [{ elevation: 512 }] }));

    const provider = createOpenElevationProvider({
      baseUrl: "https://elevation.example/api/v1/lookup",
      batchSize: 2,
      fetch,
    });
    const result = await provider([
      { distanceM: 0, lng: 104.1, lat: 30.6 },
      { distanceM: 100, lng: 104.2, lat: 30.7 },
      { distanceM: 200, lng: 104.3, lat: 30.8 },
    ]);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({
      locations: [
        { latitude: 30.6, longitude: 104.1 },
        { latitude: 30.7, longitude: 104.2 },
      ],
    });
    expect(JSON.parse(String(fetch.mock.calls[1][1]?.body))).toEqual({
      locations: [{ latitude: 30.8, longitude: 104.3 }],
    });
    expect(result).toEqual([
      { distanceM: 0, lng: 104.1, lat: 30.6, ele: 501 },
      { distanceM: 100, lng: 104.2, lat: 30.7, ele: 508 },
      { distanceM: 200, lng: 104.3, lat: 30.8, ele: 512 },
    ]);
  });

  it("uses a request batch size override for one lookup", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(Response.json({ results: [{ elevation: 501 }] }))
      .mockResolvedValueOnce(Response.json({ results: [{ elevation: 508 }] }))
      .mockResolvedValueOnce(Response.json({ results: [{ elevation: 512 }] }));

    const provider = createOpenElevationProvider({
      baseUrl: "https://elevation.example/api/v1/lookup",
      batchSize: 50,
      fetch,
    });

    await provider(
      [
        { distanceM: 0, lng: 104.1, lat: 30.6 },
        { distanceM: 100, lng: 104.2, lat: 30.7 },
        { distanceM: 200, lng: 104.3, lat: 30.8 },
      ],
      { batchSize: 1 },
    );

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body)).locations).toHaveLength(1);
    expect(JSON.parse(String(fetch.mock.calls[1][1]?.body)).locations).toHaveLength(1);
    expect(JSON.parse(String(fetch.mock.calls[2][1]?.body)).locations).toHaveLength(1);
  });

  it("does not log Authorization-like fields", async () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      Response.json({ results: [{ elevation: 501 }] }),
    );

    const provider = createOpenElevationProvider({
      baseUrl: "https://elevation.example/api/v1/lookup",
      batchSize: 1,
      fetch,
      logger: logger as any,
    });
    await provider([{ distanceM: 0, lng: 104.1, lat: 30.6 }]);

    expect(JSON.stringify(logger.info.mock.calls)).not.toMatch(/authorization/i);
    expect(JSON.stringify(logger.error.mock.calls)).not.toMatch(/authorization/i);
  });

  it("throws readable errors for invalid config and upstream HTTP failures", async () => {
    await expect(
      createOpenElevationProvider({
        baseUrl: "https://elevation.example/api/v1/lookup",
        batchSize: 0,
        fetch: vi.fn<typeof globalThis.fetch>(),
      })([{ distanceM: 0, lng: 104.1, lat: 30.6 }]),
    ).rejects.toThrow(/batchSize/i);

    await expect(
      createOpenElevationProvider({
        baseUrl: "https://elevation.example/api/v1/lookup",
        batchSize: 1,
        fetch: vi
          .fn<typeof globalThis.fetch>()
          .mockResolvedValue(new Response("bad gateway", { status: 502, statusText: "Bad Gateway" })),
      })([{ distanceM: 0, lng: 104.1, lat: 30.6 }]),
    ).rejects.toThrow(/Open-Elevation.*502/i);
  });

  it("logs and exposes upstream response details for failed batches", async () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const provider = createOpenElevationProvider({
      baseUrl: "https://elevation.example/api/v1/lookup",
      batchSize: 2,
      fetch: vi.fn<typeof globalThis.fetch>().mockResolvedValue(
        new Response("upstream gateway timeout", {
          status: 504,
          statusText: "Gateway Timeout",
        }),
      ),
      logger: logger as any,
    });

    await expect(
      provider([
        { distanceM: 0, lng: 104.1, lat: 30.6 },
        { distanceM: 100, lng: 104.2, lat: 30.7 },
        { distanceM: 200, lng: 104.3, lat: 30.8 },
      ]),
    ).rejects.toThrow(
      "Open-Elevation HTTP request failed with status 504 Gateway Timeout: upstream gateway timeout (batch 1/2).",
    );

    expect(logger.error).toHaveBeenCalledWith("elevation.lookup.failed", {
      status: 504,
      statusText: "Gateway Timeout",
      responseBody: "upstream gateway timeout",
      batchIndex: 1,
      batchCount: 2,
      batchPointCount: 2,
      completedPointCount: 0,
    });
  });

  it("logs the underlying cause when the elevation request cannot connect", async () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const cause = Object.assign(new Error("connect ETIMEDOUT 203.0.113.1:443"), {
      code: "ETIMEDOUT",
    });
    const fetchError = new TypeError("fetch failed", { cause });
    const provider = createOpenElevationProvider({
      baseUrl: "https://elevation.example/api/v1/lookup",
      batchSize: 1,
      fetch: vi.fn<typeof globalThis.fetch>().mockRejectedValue(fetchError),
      logger: logger as any,
    });

    await expect(
      provider([{ distanceM: 0, lng: 104.1, lat: 30.6 }]),
    ).rejects.toThrow(
      "Open-Elevation request failed: fetch failed; cause: connect ETIMEDOUT 203.0.113.1:443 (ETIMEDOUT) (batch 1/1).",
    );

    expect(logger.error).toHaveBeenCalledWith("elevation.lookup.failed", {
      error: {
        name: "TypeError",
        message: "fetch failed",
        cause: {
          name: "Error",
          message: "connect ETIMEDOUT 203.0.113.1:443",
          code: "ETIMEDOUT",
        },
      },
      batchIndex: 1,
      batchCount: 1,
      batchPointCount: 1,
      completedPointCount: 0,
    });
  });
});
