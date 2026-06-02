import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import { createRequestLogger } from "../../../src/server/logging/requestLogger";

describe("createRequestLogger", () => {
  it("logs request headers and body", () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const middleware = createRequestLogger(logger as any);
    const req = {
      method: "POST",
      originalUrl: "/api/generate-post",
      headers: {
        authorization: "Bearer abc",
        "content-type": "application/json",
      },
      body: { routeName: "成都到青城山" },
    };
    const res = new EventEmitter() as EventEmitter & {
      locals: Record<string, unknown>;
      statusCode: number;
    };
    const next = vi.fn();
    res.locals = {};
    res.statusCode = 200;

    middleware(req as any, res as any, next);
    res.emit("finish");

    expect(next).toHaveBeenCalled();
    expect(res.locals.requestId).toEqual(expect.stringMatching(/^req_/));
    expect(logger.info).toHaveBeenCalledWith(
      "api.request.started",
      expect.objectContaining({
        method: "POST",
        path: "/api/generate-post",
        requestBody: { routeName: "成都到青城山" },
      }),
    );
    expect(logger.info).toHaveBeenCalledWith(
      "api.request.completed",
      expect.objectContaining({
        status: 200,
      }),
    );
  });
});
