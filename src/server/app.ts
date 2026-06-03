import express from "express";
import { createJsonLogger, type JsonLogger, type LogLevel } from "./logging/jsonLogger";
import { createRequestLogger } from "./logging/requestLogger";
import {
  createGenerateCoverHandler,
  type GenerateCover,
} from "./routes/generateCoverRoute";
import {
  createGeneratePostHandler,
  type GeneratePost,
} from "./routes/generatePostRoute";

export type AppDependencies = {
  generateCover?: GenerateCover;
  generatePost?: GeneratePost;
  logger?: JsonLogger;
  logLevel?: LogLevel;
};

export const createApp = (dependencies: AppDependencies = {}) => {
  const app = express();
  const logger =
    dependencies.logger ?? createJsonLogger({ level: dependencies.logLevel ?? "info" });
  app.use(express.json({ limit: "10mb" }));
  app.use(createRequestLogger(logger));
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  if (dependencies.generatePost) {
    app.post("/api/generate-post", createGeneratePostHandler(dependencies.generatePost));
  }

  if (dependencies.generateCover) {
    app.post("/api/generate-cover", createGenerateCoverHandler(dependencies.generateCover));
  }

  return app;
};
