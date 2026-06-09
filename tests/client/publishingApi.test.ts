import { describe, expect, it, vi } from "vitest";
import {
  generateGpx,
  generateCover,
  generatePost,
  generateRoute,
  PublishingApiError,
  saveMarkdown,
  searchPlaces,
} from "../../src/client/api/publishingApi";

const route = {
  routeName: "成都到青城山周末骑行",
  startPoint: "犀浦",
  endPoint: "青城山",
  distanceKm: 82,
  elevationGainM: 620,
  difficulty: "进阶",
  roadType: "绿道、公路、乡道",
  highlights: ["绿道舒服"],
  warnings: ["返程注意车流"],
  supplyPoints: ["都江堰城区"],
};

const place = {
  id: "B001",
  name: "犀浦",
  location: { gcj02: { lng: 104.012, lat: 30.758 } },
  source: "amap" as const,
};

const plannedRoute = {
  routeId: "route_1",
  routeName: "犀浦到青城山",
  start: place,
  end: { ...place, id: "B002", name: "青城山" },
  waypoints: [],
  distanceKm: 12.35,
  polylineGcj02: [place.location.gcj02],
  polylineWgs84: [{ lng: 104.01, lat: 30.756 }],
  elevation: {
    status: "success" as const,
    sampleIntervalM: 100,
    batchSize: 50,
    gainNoiseThresholdM: 5,
    points: [{ distanceM: 0, lng: 104.01, lat: 30.756, ele: 500 }],
    elevationGainM: 0,
  },
  routeFacts: route,
};

describe("publishingApi", () => {
  it("returns JSON for successful responses", async () => {
    const response = { post: { body: "正文" } };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(response),
      }),
    );

    await expect(generatePost(route as any)).resolves.toEqual(response);
    expect(fetch).toHaveBeenCalledWith(
      "/api/generate-post",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(route),
      }),
    );
  });

  it("throws an error with detail for failed responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({
          error: "Failed to generate cover background",
          detail: "Billing hard limit has been reached",
        }),
      }),
    );

    await expect(generatePost(route as any)).rejects.toMatchObject({
      name: "PublishingApiError",
      message: "Failed to generate cover background",
      detail: "Billing hard limit has been reached",
    });
    await expect(generatePost(route as any)).rejects.toBeInstanceOf(
      PublishingApiError,
    );
  });

  it("returns cover path and URL for cover generation", async () => {
    const response = {
      coverPath: "/tmp/cover.png",
      coverUrl: "/media/images/cover.png",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(response),
      }),
    );

    await expect(
      generateCover({
        route: route as any,
        imagePrompt: "poster",
        coverTitle: "成都到青城山",
        coverSubtitle: "82km / 620m",
      }),
    ).resolves.toEqual(response);
  });

  it("posts optional GPX path when saving markdown", async () => {
    const response = { markdownPath: "data/posts/test.md" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(response),
      }),
    );

    const payload = {
      route: route as any,
      post: {
        titleCandidates: ["一", "二", "三"],
        body: "正文",
        guide: "攻略",
        easterEgg: "彩蛋",
        hashtags: ["成都骑行", "路线攻略", "周末骑行"],
        coverTitle: "封面",
        coverSubtitle: "副标题",
        imagePrompt: "poster",
      },
      selectedTitle: "一",
      gpxPath: "data/routes/test.gpx",
    };

    await expect(saveMarkdown(payload)).resolves.toEqual(response);
    expect(fetch).toHaveBeenCalledWith(
      "/api/save-markdown",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("searches places through the V2 API", async () => {
    const response = { startCandidates: [place], endCandidates: [place] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(response),
      }),
    );

    const payload = { startQuery: "犀浦", endQuery: "青城山", city: "成都" };

    await expect(searchPlaces(payload)).resolves.toEqual(response);
    expect(fetch).toHaveBeenCalledWith(
      "/api/search-places",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("generates a planned route through the V2 API", async () => {
    const response = { route: plannedRoute };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(response),
      }),
    );

    const payload = { start: place, end: { ...place, id: "B002", name: "青城山" } };

    await expect(generateRoute(payload)).resolves.toEqual(response);
    expect(fetch).toHaveBeenCalledWith(
      "/api/generate-route",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("generates GPX through the V2 API", async () => {
    const response = {
      gpxPath: "data/routes/route-1.gpx",
      gpxUrl: "/media/routes/route-1.gpx",
      stravaCompatible: true,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(response),
      }),
    );

    const payload = { route: plannedRoute, name: "犀浦到青城山" };

    await expect(generateGpx(payload)).resolves.toEqual(response);
    expect(fetch).toHaveBeenCalledWith(
      "/api/generate-gpx",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });
});
