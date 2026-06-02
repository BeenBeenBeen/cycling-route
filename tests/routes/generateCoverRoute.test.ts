import { describe, expect, it, vi } from "vitest";
import { createGenerateCoverHandler } from "../../src/server/routes/generateCoverRoute";

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

const validBody = {
  route,
  imagePrompt: "Strava-like cycling poster background, no text",
  coverTitle: "成都到青城山",
  coverSubtitle: "82km / 620m",
};

describe("createGenerateCoverHandler", () => {
  it("returns a cover path for valid input", async () => {
    const generateCover = vi.fn().mockResolvedValue({ coverPath: "/tmp/cover.png" });
    const { req, res } = mockHttp(validBody);

    await createGenerateCoverHandler(generateCover)(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ coverPath: "/tmp/cover.png" });
    expect(generateCover).toHaveBeenCalledWith(validBody);
  });

  it("returns 400 for invalid input", async () => {
    const generateCover = vi.fn();
    const { req, res } = mockHttp({ ...validBody, route: { ...route, distanceKm: 0 } });

    await createGenerateCoverHandler(generateCover)(req, res);

    expect(res.statusCode).toBe(400);
    expect(generateCover).not.toHaveBeenCalled();
  });

  it("returns 502 when background generation fails", async () => {
    const generateCover = vi
      .fn()
      .mockRejectedValue(new Error("Failed to generate cover background: OpenAI failed"));
    const { req, res } = mockHttp(validBody);

    await createGenerateCoverHandler(generateCover)(req, res);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({
      error: "Failed to generate cover background",
      detail: "Failed to generate cover background: OpenAI failed",
    });
  });

  it("returns 500 when local composition fails", async () => {
    const generateCover = vi
      .fn()
      .mockRejectedValue(new Error("Failed to compose cover poster: Sharp failed"));
    const { req, res } = mockHttp(validBody);

    await createGenerateCoverHandler(generateCover)(req, res);

    expect(res.statusCode).toBe(500);
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
