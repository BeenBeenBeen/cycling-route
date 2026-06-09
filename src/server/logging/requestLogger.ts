import type { NextFunction, Request, Response } from "express";
import type { JsonLogger } from "./jsonLogger";

export const createRequestLogger =
  (logger: JsonLogger) => (req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const path = req.originalUrl.split("?")[0];
    const originalJson = res.json.bind(res);
    let responseBody: unknown;
    res.locals.requestId = requestId;

    res.json = ((payload: unknown) => {
      responseBody = payload;
      return originalJson(payload);
    }) as Response["json"];

    logger.info("api.request.started", {
      requestId,
      method: req.method,
      path,
    });

    logger.debug("api.request.debug", {
      requestId,
      method: req.method,
      path,
      requestHeaders: req.headers,
      requestBody: req.body,
    });

    res.on("finish", () => {
      logger.info("api.request.completed", {
        requestId,
        method: req.method,
        path,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
      });

      if (res.statusCode >= 400) {
        logger.debug("api.response.debug", {
          requestId,
          method: req.method,
          path,
          status: res.statusCode,
          durationMs: Date.now() - startedAt,
          requestHeaders: req.headers,
          requestBody: req.body,
          responseBody,
        });
      }
    });

    next();
  };
