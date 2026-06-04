import { describe, expect, it, vi } from "vitest";
import type { PlaceCandidate } from "../../src/server/domain/placeCandidate";
import { createAmapCyclingRoutePlanner } from "../../src/server/services/amapCyclingRoutePlanner";

const place = (id: string, lng: number, lat: number): PlaceCandidate => ({
  id,
  name: id,
  location: { gcj02: { lng, lat } },
  source: "amap",
});

describe("createAmapCyclingRoutePlanner", () => {
  it("parses amap cycling route distance, duration and merged step polylines", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      Response.json({
        status: "1",
        route: {
          paths: [
            {
              distance: "1200",
              duration: "360",
              steps: [
                { polyline: "104.1,30.6;104.2,30.7" },
                { polyline: "104.2,30.7;104.3,30.8" },
              ],
            },
          ],
        },
      }),
    );

    const plan = createAmapCyclingRoutePlanner({ apiKey: "amap-secret", fetch });
    const result = await plan({
      start: place("start", 104.1, 30.6),
      end: place("end", 104.3, 30.8),
    });

    expect(result).toEqual({
      distanceM: 1200,
      durationSeconds: 360,
      polylineGcj02: [
        { lng: 104.1, lat: 30.6 },
        { lng: 104.2, lat: 30.7 },
        { lng: 104.3, lat: 30.8 },
      ],
    });
  });

  it("does not expose the api key in requests or logs", async () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      Response.json({
        status: "1",
        route: { paths: [{ distance: "1", steps: [{ polyline: "104,30;104.1,30.1" }] }] },
      }),
    );

    const plan = createAmapCyclingRoutePlanner({
      apiKey: "amap-secret",
      fetch,
      logger: logger as any,
    });
    await plan({ start: place("start", 104, 30), end: place("end", 104.1, 30.1) });

    const [url] = fetch.mock.calls[0];
    expect(String(url)).not.toContain("amap-secret");
    expect(JSON.stringify(logger.info.mock.calls)).not.toContain("amap-secret");
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("amap-secret");
  });

  it("throws readable errors for missing config and upstream failures", async () => {
    await expect(
      createAmapCyclingRoutePlanner({ fetch: vi.fn<typeof globalThis.fetch>() })({
        start: place("start", 104, 30),
        end: place("end", 104.1, 30.1),
      }),
    ).rejects.toThrow(/AMAP_API_KEY/i);

    await expect(
      createAmapCyclingRoutePlanner({
        apiKey: "key",
        fetch: vi
          .fn<typeof globalThis.fetch>()
          .mockResolvedValue(new Response("bad gateway", { status: 503, statusText: "Unavailable" })),
      })({ start: place("start", 104, 30), end: place("end", 104.1, 30.1) }),
    ).rejects.toThrow(/cycling route.*503/i);

    await expect(
      createAmapCyclingRoutePlanner({
        apiKey: "key",
        fetch: vi.fn<typeof globalThis.fetch>().mockResolvedValue(
          Response.json({ status: "0", info: "INVALID_PARAMS" }),
        ),
      })({ start: place("start", 104, 30), end: place("end", 104.1, 30.1) }),
    ).rejects.toThrow(/INVALID_PARAMS/i);
  });
});
