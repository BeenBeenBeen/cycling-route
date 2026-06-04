import type { AppDependencies } from "./app";
import type { AppConfig } from "./config";
import { createJsonLogger, type JsonLogger } from "./logging/jsonLogger";
import { createOpenaiCoverBackgroundGenerator } from "./services/openaiCoverBackgroundGenerator";
import { createOpenaiPostGenerator } from "./services/openaiPostGenerator";
import { createAmapCyclingRoutePlanner } from "./services/amapCyclingRoutePlanner";
import { createAmapPlaceSearch } from "./services/amapPlaceSearch";
import { composeCoverPoster } from "./services/coverPosterComposer";
import { saveMarkdownPost } from "./services/markdownPostStore";
import { createOpenElevationProvider } from "./services/openElevationProvider";
import { writeGpxRoute } from "./services/gpxRouteWriter";
import { createXiaohongshuPublisher } from "./services/xiaohongshuPublisher";
import { createAssistPublishUseCase } from "./useCases/assistPublishUseCase";
import { createGenerateCoverUseCase } from "./useCases/generateCoverUseCase";
import { createGeneratePostUseCase } from "./useCases/generatePostUseCase";
import { createGenerateRouteUseCase } from "./useCases/generateRouteUseCase";
import { createGenerateGpxUseCase } from "./useCases/generateGpxUseCase";
import { createSaveMarkdownUseCase } from "./useCases/saveMarkdownUseCase";
import { createSearchPlacesUseCase } from "./useCases/searchPlacesUseCase";

export const createProductionDependencies = (
  config: AppConfig,
  options: { logger?: JsonLogger } = {},
): Required<Pick<AppDependencies, "logger">> & AppDependencies => {
  const logger = options.logger ?? createJsonLogger({ level: config.logLevel });
  logger.info("server.config.loaded", {
    port: config.port,
    logLevel: config.logLevel,
    hasDuckcodingTextApiKey: Boolean(config.duckcodingTextApiKey),
    hasDuckcodingImageApiKey: Boolean(config.duckcodingImageApiKey),
    duckcodingBaseUrl: config.duckcodingBaseUrl,
    duckcodingTextModel: config.duckcodingTextModel,
    duckcodingImageModel: config.duckcodingImageModel,
    duckcodingImageSize: config.duckcodingImageSize,
    hasAmapApiKey: Boolean(config.amapApiKey),
    hasAmapJsApiKey: Boolean(config.amapJsApiKey),
    openElevationBaseUrl: config.openElevationBaseUrl,
    elevationSampleIntervalM: config.elevationSampleIntervalM,
    elevationBatchSize: config.elevationBatchSize,
    elevationGainNoiseThresholdM: config.elevationGainNoiseThresholdM,
    hasHttpProxy: Boolean(config.proxy.httpProxy),
    hasHttpsProxy: Boolean(config.proxy.httpsProxy),
    hasAllProxy: Boolean(config.proxy.allProxy),
  });

  return {
    logger,
    generatePost: async (input) =>
      await createGeneratePostUseCase({
        generatePost: createOpenaiPostGenerator({
          apiKey: config.duckcodingTextApiKey,
          baseUrl: config.duckcodingBaseUrl,
          model: config.duckcodingTextModel,
          proxy: config.proxy,
          logger,
        }),
      })(input),
    generateCover: async (input) =>
      await createGenerateCoverUseCase({
        generateBackground: createOpenaiCoverBackgroundGenerator({
          apiKey: config.duckcodingImageApiKey,
          baseUrl: config.duckcodingBaseUrl,
          model: config.duckcodingImageModel,
          size: config.duckcodingImageSize,
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
    searchPlaces: createSearchPlacesUseCase({
      searchPlaces: createAmapPlaceSearch({
        apiKey: config.amapApiKey,
        logger,
      }),
    }),
    generateRoute: createGenerateRouteUseCase({
      planCyclingRoute: createAmapCyclingRoutePlanner({
        apiKey: config.amapApiKey,
        logger,
      }),
      lookupElevation: createOpenElevationProvider({
        baseUrl: config.openElevationBaseUrl,
        batchSize: config.elevationBatchSize,
        logger,
      }),
      sampleIntervalM: config.elevationSampleIntervalM,
      elevationBatchSize: config.elevationBatchSize,
      gainNoiseThresholdM: config.elevationGainNoiseThresholdM,
    }),
    generateGpx: createGenerateGpxUseCase({
      writeGpx: async (input) =>
        await writeGpxRoute({
          ...input,
          outputDir: "data/routes",
        }),
    }),
  };
};
