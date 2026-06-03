import express from "express";
import { createJsonLogger, type JsonLogger, type LogLevel } from "./logging/jsonLogger";
import { createRequestLogger } from "./logging/requestLogger";
import {
  createGenerateCoverHandler,
  type GenerateCover,
} from "./routes/generateCoverRoute";
import {
  createAssistPublishHandler,
  type AssistPublish,
} from "./routes/assistPublishRoute";
import {
  createGeneratePostHandler,
  type GeneratePost,
} from "./routes/generatePostRoute";
import {
  createSaveMarkdownHandler,
  type SaveMarkdown,
} from "./routes/saveMarkdownRoute";

export type AppDependencies = {
  generateCover?: GenerateCover;
  generatePost?: GeneratePost;
  assistPublish?: AssistPublish;
  saveMarkdown?: SaveMarkdown;
  logger?: JsonLogger;
  logLevel?: LogLevel;
};

export const createApp = (dependencies: AppDependencies = {}) => {
  const app = express();
  const logger =
    dependencies.logger ?? createJsonLogger({ level: dependencies.logLevel ?? "info" });
  app.use(express.json({ limit: "10mb" }));
  app.use("/media/images", express.static("data/images"));
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

  if (dependencies.saveMarkdown) {
    app.post("/api/save-markdown", createSaveMarkdownHandler(dependencies.saveMarkdown));
  }

  if (dependencies.assistPublish) {
    app.post("/api/assist-publish", createAssistPublishHandler(dependencies.assistPublish));
  }

  return app;
};
