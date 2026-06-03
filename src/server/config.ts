import "dotenv/config";
import { parsePort } from "../config/ports";
import { parseLogLevel, type LogLevel } from "./logging/jsonLogger";
import type { OpenAIProxyConfig } from "./services/openaiClient";

export type AppConfig = {
  port: number;
  logLevel: LogLevel;
  openaiApiKey?: string;
  openaiTextModel?: string;
  openaiImageModel?: string;
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
  openaiApiKey: optionalEnv(process.env.OPENAI_API_KEY),
  openaiTextModel: optionalEnv(process.env.OPENAI_TEXT_MODEL),
  openaiImageModel: optionalEnv(process.env.OPENAI_IMAGE_MODEL),
  proxy: {
    httpProxy: optionalEnv(process.env.HTTP_PROXY ?? process.env.http_proxy),
    httpsProxy: optionalEnv(process.env.HTTPS_PROXY ?? process.env.https_proxy),
    allProxy: optionalEnv(process.env.ALL_PROXY ?? process.env.all_proxy),
  },
  xiaohongshuPublishUrl:
    optionalEnv(process.env.XIAOHONGSHU_PUBLISH_URL) ??
    "https://creator.xiaohongshu.com/publish/publish",
});
