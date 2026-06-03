import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { JsonLogger } from "../logging/jsonLogger";
import { createOpenAIClient, type OpenAIProxyConfig } from "./openaiClient";

export type OpenaiCoverBackgroundGeneratorConfig = {
  apiKey?: string;
  model?: string;
  proxy?: OpenAIProxyConfig;
  outputDir?: string;
  logger: JsonLogger;
};

const slugify = (value: string) =>
  value
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const imageRequestOptionsForModel = (model: string) => {
  if (model.startsWith("gpt-image")) {
    return {
      size: "1024x1536",
    } as const;
  }

  return {
    size: "1024x1792",
    response_format: "b64_json",
  } as const;
};

export const createOpenaiCoverBackgroundGenerator = ({
  apiKey,
  model,
  proxy = {},
  outputDir = path.join(process.cwd(), "data", "images"),
  logger,
}: OpenaiCoverBackgroundGeneratorConfig) => {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  if (!model) {
    throw new Error("OPENAI_IMAGE_MODEL is required");
  }

  const client = createOpenAIClient(apiKey, proxy, logger);

  return async (imagePrompt: string): Promise<string> => {
    await mkdir(outputDir, { recursive: true });

    const response = await client.images.generate({
      model,
      prompt: [
        imagePrompt,
        "",
        "Create a vertical cycling route poster background.",
        "Style: Strava-like sports data visual, outdoor cycling atmosphere, route/map texture.",
        "Do not generate final Chinese text, readable labels, numbers, logos, watermarks, or UI text.",
        "The local application will add all route facts and typography later.",
      ].join("\n"),
      ...imageRequestOptionsForModel(model),
    } as any);

    const image = response.data?.[0];
    if (!image?.b64_json) {
      throw new Error("Image generation returned no image data");
    }

    const filename = `background-${Date.now()}-${slugify(imagePrompt).slice(0, 48) || "cover"}.png`;
    const backgroundPath = path.join(outputDir, filename);
    await writeFile(backgroundPath, Buffer.from(image.b64_json, "base64"));

    return backgroundPath;
  };
};
