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
  proxy: OpenAIProxyConfig;
  xiaohongshuPublishUrl: string;
};

const optionalEnv = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
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
  proxy: {
    httpProxy: optionalEnv(process.env.HTTP_PROXY ?? process.env.http_proxy),
    httpsProxy: optionalEnv(process.env.HTTPS_PROXY ?? process.env.https_proxy),
    allProxy: optionalEnv(process.env.ALL_PROXY ?? process.env.all_proxy),
  },
  xiaohongshuPublishUrl:
    optionalEnv(process.env.XIAOHONGSHU_PUBLISH_URL) ??
    "https://creator.xiaohongshu.com/publish/publish",
});
