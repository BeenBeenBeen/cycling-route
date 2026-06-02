import type { NextFunction, Request, Response } from "express";
import type { JsonLogger } from "./jsonLogger";

export const createRequestLogger =
  (logger: JsonLogger) => (req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    res.locals.requestId = requestId;

    logger.info("api.request.started", {
      requestId,
      method: req.method,
      path: req.originalUrl.split("?")[0],
      requestHeaders: req.headers,
      requestBody: req.body,
    });

    res.on("finish", () => {
      logger.info("api.request.completed", {
        requestId,
        method: req.method,
        path: req.originalUrl.split("?")[0],
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });

    next();
  };
