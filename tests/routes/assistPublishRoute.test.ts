import { describe, expect, it, vi } from "vitest";
import { createAssistPublishHandler } from "../../src/server/routes/assistPublishRoute";

const validBody = {
  title: "标题一",
  body: "小红书正文",
  hashtags: ["成都骑行", "路线攻略"],
  coverPath: "/tmp/cover.png",
};

describe("createAssistPublishHandler", () => {
  it("returns ok for valid input", async () => {
    const assistPublish = vi.fn().mockResolvedValue({ ok: true });
    const { req, res } = mockHttp(validBody);

    await createAssistPublishHandler(assistPublish)(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(assistPublish).toHaveBeenCalledWith(validBody);
  });

  it("returns 400 for invalid input", async () => {
    const assistPublish = vi.fn();
    const { req, res } = mockHttp({ ...validBody, coverPath: "" });

    await createAssistPublishHandler(assistPublish)(req, res);

    expect(res.statusCode).toBe(400);
    expect(assistPublish).not.toHaveBeenCalled();
  });

  it("returns 500 when publishing assist fails", async () => {
    const assistPublish = vi.fn().mockRejectedValue(new Error("browser failed"));
    const { req, res } = mockHttp(validBody);

    await createAssistPublishHandler(assistPublish)(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: "Failed to assist publishing",
      detail: "browser failed",
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
