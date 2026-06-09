import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import { createRequestLogger } from "../../../src/server/logging/requestLogger";

describe("createRequestLogger", () => {
  it("logs request headers and body", () => {
    const logger = { debug: vi.fn(), info: vi.fn(), error: vi.fn() };
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
      json(payload: unknown): unknown;
    };
    const next = vi.fn();
    res.locals = {};
    res.statusCode = 200;
    res.json = vi.fn((payload: unknown) => payload);

    middleware(req as any, res as any, next);
    res.emit("finish");

    expect(next).toHaveBeenCalled();
    expect(res.locals.requestId).toEqual(expect.stringMatching(/^req_/));
    expect(logger.debug).toHaveBeenCalledWith(
      "api.request.debug",
      expect.objectContaining({
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

  it("logs failed response body with request headers and body", () => {
    const logger = { debug: vi.fn(), info: vi.fn(), error: vi.fn() };
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
      json(payload: unknown): unknown;
    };
    const next = vi.fn();
    res.locals = {};
    res.statusCode = 502;
    res.json = vi.fn((payload: unknown) => payload);

    middleware(req as any, res as any, next);
    res.json({ error: "Billing hard limit has been reached" });
    res.emit("finish");

    expect(logger.debug).toHaveBeenCalledWith(
      "api.response.debug",
      expect.objectContaining({
        status: 502,
        requestHeaders: req.headers,
        requestBody: req.body,
        responseBody: { error: "Billing hard limit has been reached" },
      }),
    );
  });
});
