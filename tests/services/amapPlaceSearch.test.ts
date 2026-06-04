import { describe, expect, it, vi } from "vitest";
import { createAmapPlaceSearch } from "../../src/server/services/amapPlaceSearch";

describe("createAmapPlaceSearch", () => {
  it("converts amap POI results to place candidates", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      Response.json({
        status: "1",
        pois: [
          {
            id: "B001",
            name: "成都东站",
            address: "邛崃山路333号",
            cityname: "成都市",
            adname: "成华区",
            location: "104.141,30.63",
          },
        ],
      }),
    );

    const search = createAmapPlaceSearch({ apiKey: "amap-secret", fetch });
    const results = await search({ query: "成都东站", city: "成都", limit: 3 });

    expect(results).toEqual([
      {
        id: "B001",
        name: "成都东站",
        address: "邛崃山路333号",
        city: "成都市",
        district: "成华区",
        location: { gcj02: { lng: 104.141, lat: 30.63 } },
        source: "amap",
      },
    ]);
  });

  it("does not expose the api key in requests or logs", async () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      Response.json({ status: "1", pois: [] }),
    );

    const search = createAmapPlaceSearch({ apiKey: "amap-secret", fetch, logger: logger as any });
    await search({ query: "天府广场", limit: 1 });

    const [url] = fetch.mock.calls[0];
    expect(String(url)).not.toContain("amap-secret");
    expect(JSON.stringify(logger.info.mock.calls)).not.toContain("amap-secret");
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("amap-secret");
  });

  it("throws readable errors for missing config and upstream failures", async () => {
    await expect(
      createAmapPlaceSearch({ fetch: vi.fn<typeof globalThis.fetch>() })({
        query: "成都东站",
        limit: 1,
      }),
    ).rejects.toThrow(/AMAP_API_KEY/i);

    await expect(
      createAmapPlaceSearch({
        apiKey: "key",
        fetch: vi
          .fn<typeof globalThis.fetch>()
          .mockResolvedValue(new Response("bad gateway", { status: 502, statusText: "Bad Gateway" })),
      })({ query: "成都东站", limit: 1 }),
    ).rejects.toThrow(/place search.*502/i);

    await expect(
      createAmapPlaceSearch({
        apiKey: "key",
        fetch: vi.fn<typeof globalThis.fetch>().mockResolvedValue(
          Response.json({ status: "0", info: "INVALID_USER_KEY", pois: [] }),
        ),
      })({ query: "成都东站", limit: 1 }),
    ).rejects.toThrow(/INVALID_USER_KEY/i);
  });
});
