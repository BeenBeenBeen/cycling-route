import express from "express";
import { createJsonLogger } from "./logging/jsonLogger";
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
};

export const createApp = (dependencies: AppDependencies = {}) => {
  const app = express();
  const logger = createJsonLogger();
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
