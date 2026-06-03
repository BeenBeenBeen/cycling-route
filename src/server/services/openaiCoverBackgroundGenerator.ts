import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetch as undiciFetch, ProxyAgent } from "undici";
import type { JsonLogger } from "../logging/jsonLogger";
import {
  createOpenAIClient,
  resolveProxyUrl,
  type OpenAIProxyConfig,
} from "./openaiClient";

export type OpenaiCoverBackgroundGeneratorConfig = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  size?: string;
  proxy?: OpenAIProxyConfig;
  outputDir?: string;
  logger: JsonLogger;
};

const DEFAULT_DUCKCODING_BASE_URL = "https://www.duckcoding.ai/v1";
const DEFAULT_IMAGE_MODEL = "gpt-image-1";
const DEFAULT_IMAGE_SIZE = "1024x1536";

const slugify = (value: string) =>
  value
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const imageBufferFromResponse = async (image: {
  b64_json?: string | null;
  url?: string | null;
}, proxy: OpenAIProxyConfig) => {
  if (image.b64_json) {
    return Buffer.from(image.b64_json, "base64");
  }

  if (image.url) {
    const proxyUrl = resolveProxyUrl(proxy);
    const response = await undiciFetch(
      image.url,
      proxyUrl
        ? {
            dispatcher: new ProxyAgent(proxyUrl),
          }
        : undefined,
    );
    if (!response.ok) {
      throw new Error(`Failed to download generated image: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  throw new Error("Image generation returned no image data");
};

const buildImagePrompt = (imagePrompt: string) =>
  [
    imagePrompt,
    "",
    "Create a vertical cycling route poster background.",
    "Style: premium editorial poster background with large areas of rich visual texture.",
    "Use layered light, atmospheric gradients, tactile material grain, cinematic depth, and bold negative space.",
    "Keep the composition abstract and non-geographic; do not include maps, route lines, contour lines, or location textures.",
    "Mood: outdoor cycling energy, clean sports aesthetic, refined and spacious.",
    "Do not generate final Chinese text, readable labels, numbers, logos, watermarks, or UI text.",
    "The local application will add all route facts and typography later.",
  ].join("\n");

export const createOpenaiCoverBackgroundGenerator = ({
  apiKey,
  baseUrl = DEFAULT_DUCKCODING_BASE_URL,
  model = DEFAULT_IMAGE_MODEL,
  size = DEFAULT_IMAGE_SIZE,
  proxy = {},
  outputDir = path.join(process.cwd(), "data", "images"),
  logger,
}: OpenaiCoverBackgroundGeneratorConfig) => {
  if (!apiKey) {
    throw new Error("DUCKCODING_IMAGE_API_KEY is required");
  }

  const client = createOpenAIClient(apiKey, proxy, logger, {
    baseURL: baseUrl,
    provider: "duckcoding",
  });

  return async (imagePrompt: string): Promise<string> => {
    await mkdir(outputDir, { recursive: true });

    const response = await client.images.generate({
      model,
      prompt: buildImagePrompt(imagePrompt),
      size,
      n: 1,
    } as any);

    const image = response.data?.[0];
    if (!image) {
      throw new Error("Image generation returned no image data");
    }

    const imageBuffer = await imageBufferFromResponse(image, proxy);
    const filename = `background-${Date.now()}-${slugify(imagePrompt).slice(0, 48) || "cover"}.png`;
    const backgroundPath = path.join(outputDir, filename);
    await writeFile(backgroundPath, imageBuffer);

    return backgroundPath;
  };
};
