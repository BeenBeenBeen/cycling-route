import { describe, expect, it, vi } from "vitest";
import {
  generateCover,
  generatePost,
  PublishingApiError,
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
});
