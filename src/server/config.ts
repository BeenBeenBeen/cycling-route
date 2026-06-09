import "dotenv/config";
import { parsePort } from "../config/ports";
import { parseLogLevel, type LogLevel } from "./logging/jsonLogger";
import type { OpenAIProxyConfig } from "./services/openaiClient";

export type AppConfig = {
  port: number;
  logLevel: LogLevel;
  duckcodingTextApiKey?: string;
  duckcodingImageApiKey?: string;
  duckcodingBaseUrl?: string;
  duckcodingTextModel?: string;
  duckcodingImageModel?: string;
  duckcodingImageSize?: string;
  amapApiKey?: string;
  amapJsApiKey?: string;
  openElevationBaseUrl: string;
  elevationSampleIntervalM: number;
  elevationBatchSize: number;
  elevationGainNoiseThresholdM: number;
  proxy: OpenAIProxyConfig;
  xiaohongshuPublishUrl: string;
};

const defaultOpenElevationBaseUrl =
  "https://api.open-elevation.com/api/v1/lookup";

const optionalEnv = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const parsePositiveIntegerEnv = (
  name: string,
  value: string | undefined,
  defaultValue: number,
) => {
  const normalized = optionalEnv(value);
  if (normalized === undefined) {
    return defaultValue;
  }

  if (!/^\d+$/.test(normalized)) {
    throw new Error(`Invalid ${name}: must be a positive integer`);
  }

  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name}: must be a positive integer`);
  }

  return parsed;
};

const parseNonNegativeIntegerEnv = (
  name: string,
  value: string | undefined,
  defaultValue: number,
) => {
  const normalized = optionalEnv(value);
  if (normalized === undefined) {
    return defaultValue;
  }

  if (!/^\d+$/.test(normalized)) {
    throw new Error(
      `Invalid ${name}: must be zero or a positive integer`,
    );
  }

  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(
      `Invalid ${name}: must be zero or a positive integer`,
    );
  }

  return parsed;
};

export const loadConfig = (): AppConfig => ({
  port: parsePort(process.env.PORT),
  logLevel: parseLogLevel(process.env.LOG_LEVEL),
  duckcodingTextApiKey: optionalEnv(process.env.DUCKCODING_TEXT_API_KEY),
  duckcodingImageApiKey: optionalEnv(process.env.DUCKCODING_IMAGE_API_KEY),
  duckcodingBaseUrl: optionalEnv(process.env.DUCKCODING_BASE_URL),
  duckcodingTextModel: optionalEnv(process.env.DUCKCODING_TEXT_MODEL),
  duckcodingImageModel: optionalEnv(process.env.DUCKCODING_IMAGE_MODEL),
  duckcodingImageSize: optionalEnv(process.env.DUCKCODING_IMAGE_SIZE),
  amapApiKey: optionalEnv(process.env.AMAP_API_KEY),
  amapJsApiKey: optionalEnv(process.env.AMAP_JS_API_KEY),
  openElevationBaseUrl:
    optionalEnv(process.env.OPEN_ELEVATION_BASE_URL) ??
    defaultOpenElevationBaseUrl,
  elevationSampleIntervalM: parsePositiveIntegerEnv(
    "ELEVATION_SAMPLE_INTERVAL_M",
    process.env.ELEVATION_SAMPLE_INTERVAL_M,
    100,
  ),
  elevationBatchSize: parsePositiveIntegerEnv(
    "ELEVATION_BATCH_SIZE",
    process.env.ELEVATION_BATCH_SIZE,
    100,
  ),
  elevationGainNoiseThresholdM: parseNonNegativeIntegerEnv(
    "ELEVATION_GAIN_NOISE_THRESHOLD_M",
    process.env.ELEVATION_GAIN_NOISE_THRESHOLD_M,
    3,
  ),
  proxy: {
    httpProxy: optionalEnv(process.env.HTTP_PROXY ?? process.env.http_proxy),
    httpsProxy: optionalEnv(process.env.HTTPS_PROXY ?? process.env.https_proxy),
    allProxy: optionalEnv(process.env.ALL_PROXY ?? process.env.all_proxy),
  },
  xiaohongshuPublishUrl:
    optionalEnv(process.env.XIAOHONGSHU_PUBLISH_URL) ??
    "https://creator.xiaohongshu.com/publish/publish",
});
