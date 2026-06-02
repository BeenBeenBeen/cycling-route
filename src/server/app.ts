import express from "express";
import { createJsonLogger } from "./logging/jsonLogger";
import { createRequestLogger } from "./logging/requestLogger";

export const createApp = () => {
  const app = express();
  const logger = createJsonLogger();
  app.use(express.json({ limit: "10mb" }));
  app.use(createRequestLogger(logger));
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });
  return app;
};
