import type { AppDependencies } from "./app";
import type { AppConfig } from "./config";
import { createJsonLogger } from "./logging/jsonLogger";
import { createOpenaiCoverBackgroundGenerator } from "./services/openaiCoverBackgroundGenerator";
import { createOpenaiPostGenerator } from "./services/openaiPostGenerator";
import { composeCoverPoster } from "./services/coverPosterComposer";
import { saveMarkdownPost } from "./services/markdownPostStore";
import { createXiaohongshuPublisher } from "./services/xiaohongshuPublisher";
import { createAssistPublishUseCase } from "./useCases/assistPublishUseCase";
import { createGenerateCoverUseCase } from "./useCases/generateCoverUseCase";
import { createGeneratePostUseCase } from "./useCases/generatePostUseCase";
import { createSaveMarkdownUseCase } from "./useCases/saveMarkdownUseCase";

export const createProductionDependencies = (
  config: AppConfig,
): Required<Pick<AppDependencies, "logger">> & AppDependencies => {
  const logger = createJsonLogger({ level: config.logLevel });

  return {
    logger,
    generatePost: async (input) =>
      await createGeneratePostUseCase({
        generatePost: createOpenaiPostGenerator({
          apiKey: config.openaiApiKey,
          model: config.openaiTextModel,
          proxy: config.proxy,
          logger,
        }),
      })(input),
    generateCover: async (input) =>
      await createGenerateCoverUseCase({
        generateBackground: createOpenaiCoverBackgroundGenerator({
          apiKey: config.openaiApiKey,
          model: config.openaiImageModel,
          proxy: config.proxy,
          logger,
        }),
        composeCover: composeCoverPoster,
      })(input),
    saveMarkdown: createSaveMarkdownUseCase({
      saveMarkdown: saveMarkdownPost,
    }),
    assistPublish: createAssistPublishUseCase({
      assistPublish: createXiaohongshuPublisher({
        publishUrl: config.xiaohongshuPublishUrl,
      }),
    }),
  };
};
