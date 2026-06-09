import { generatedPostSchema, type GeneratedPost } from "../domain/generatedPost";
import { buildPostPrompt } from "../domain/promptBuilder";
import type { RouteInput } from "../domain/routeInput";
import type { JsonLogger } from "../logging/jsonLogger";
import { createOpenAIClient, type OpenAIProxyConfig } from "./openaiClient";

export type OpenaiPostGeneratorConfig = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  proxy?: OpenAIProxyConfig;
  logger: JsonLogger;
};

const DEFAULT_DUCKCODING_BASE_URL = "https://www.duckcoding.ai/v1";
const DEFAULT_TEXT_MODEL = "gpt-5.5";

export const createOpenaiPostGenerator = ({
  apiKey,
  baseUrl = DEFAULT_DUCKCODING_BASE_URL,
  model = DEFAULT_TEXT_MODEL,
  proxy = {},
  logger,
}: OpenaiPostGeneratorConfig) => {
  if (!apiKey) {
    throw new Error("DUCKCODING_TEXT_API_KEY is required");
  }

  const client = createOpenAIClient(apiKey, proxy, logger, {
    baseURL: baseUrl,
    provider: "duckcoding",
  });

  return async (route: RouteInput): Promise<GeneratedPost> => {
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: buildPostPrompt(route) }],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Chat completion returned no message content");
    }

    const parsed = JSON.parse(content);
    return generatedPostSchema.parse(parsed);
  };
};
