import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { createGeneratePostHandler } from "../../src/server/routes/generatePostRoute";

const validRoute = {
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

const generatedPost = {
  titleCandidates: ["a", "b", "c"],
  body: "正文",
  guide: "攻略",
  easterEgg: "彩蛋",
  hashtags: ["成都骑行", "路线攻略", "周末骑行"],
  coverTitle: "成都到青城山",
  coverSubtitle: "82km / 620m",
  imagePrompt: "no text cycling poster background",
};

describe("createGeneratePostHandler", () => {
  it("returns generated post", async () => {
    const generatePost = vi.fn().mockResolvedValue(generatedPost);
    const { req, res } = mockHttp(validRoute);

    await createGeneratePostHandler(generatePost)(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ post: generatedPost });
    expect(generatePost).toHaveBeenCalledWith(validRoute);
  });

  it("returns 400 for invalid route input", async () => {
    const generatePost = vi.fn();
    const { req, res } = mockHttp({ ...validRoute, distanceKm: 0 });

    await createGeneratePostHandler(generatePost)(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Invalid route input",
      issues: expect.any(Array),
    });
    expect(generatePost).not.toHaveBeenCalled();
  });

  it("returns 502 when generation fails", async () => {
    const generatePost = vi
      .fn()
      .mockRejectedValue(new Error("Billing hard limit has been reached"));
    const { req, res } = mockHttp(validRoute);

    await createGeneratePostHandler(generatePost)(req, res);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: "Billing hard limit has been reached" });
  });

  it("returns 502 when generated content validation fails", async () => {
    const generatePost = vi.fn().mockRejectedValue(new ZodError([]));
    const { req, res } = mockHttp(validRoute);

    await createGeneratePostHandler(generatePost)(req, res);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: "Failed to generate post" });
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
