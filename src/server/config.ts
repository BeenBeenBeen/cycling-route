import "dotenv/config";
import { parsePort } from "../config/ports";

export type AppConfig = {
  port: number;
  openaiApiKey?: string;
  openaiTextModel?: string;
  openaiImageModel?: string;
  xiaohongshuPublishUrl: string;
};

export const loadConfig = (): AppConfig => ({
  port: parsePort(process.env.PORT),
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiTextModel: process.env.OPENAI_TEXT_MODEL,
  openaiImageModel: process.env.OPENAI_IMAGE_MODEL,
  xiaohongshuPublishUrl:
    process.env.XIAOHONGSHU_PUBLISH_URL ??
    "https://creator.xiaohongshu.com/publish/publish",
});
