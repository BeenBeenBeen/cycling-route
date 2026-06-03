import { createApp } from "./app";
import type { AppConfig } from "./config";
import { createJsonLogger } from "./logging/jsonLogger";
import { createOpenaiCoverBackgroundGenerator } from "./services/openaiCoverBackgroundGenerator";
import { createOpenaiPostGenerator } from "./services/openaiPostGenerator";
import { composeCoverPoster } from "./services/coverPosterComposer";
import { createGenerateCoverUseCase } from "./useCases/generateCoverUseCase";
import { createGeneratePostUseCase } from "./useCases/generatePostUseCase";

export const createProductionApp = (config: AppConfig) => {
  const logger = createJsonLogger({ level: config.logLevel });
  const generatePost = createGeneratePostUseCase({
    generatePost: createOpenaiPostGenerator({
      apiKey: config.openaiApiKey,
      model: config.openaiTextModel,
      proxy: config.proxy,
      logger,
    }),
  });
  const generateCover = createGenerateCoverUseCase({
    generateBackground: createOpenaiCoverBackgroundGenerator({
      apiKey: config.openaiApiKey,
      model: config.openaiImageModel,
      proxy: config.proxy,
      logger,
    }),
    composeCover: composeCoverPoster,
  });

  return createApp({
    generateCover,
    generatePost,
    logger,
  });
};
