import { generatedPostSchema, type GeneratedPost } from "../domain/generatedPost";
import { buildPostPrompt } from "../domain/promptBuilder";
import type { RouteInput } from "../domain/routeInput";
import type { JsonLogger } from "../logging/jsonLogger";
import { createOpenAIClient } from "./openaiClient";

export type OpenaiPostGeneratorConfig = {
  apiKey?: string;
  model?: string;
  logger: JsonLogger;
};

export const createOpenaiPostGenerator = ({
  apiKey,
  model,
  logger,
}: OpenaiPostGeneratorConfig) => {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  if (!model) {
    throw new Error("OPENAI_TEXT_MODEL is required");
  }

  const client = createOpenAIClient(
    apiKey,
    {
      httpProxy: process.env.HTTP_PROXY ?? process.env.http_proxy,
      httpsProxy: process.env.HTTPS_PROXY ?? process.env.https_proxy,
      allProxy: process.env.ALL_PROXY ?? process.env.all_proxy,
    },
    logger,
  );

  return async (route: RouteInput): Promise<GeneratedPost> => {
    const response = await client.responses.create({
      model,
      input: buildPostPrompt(route),
      text: {
        format: {
          type: "json_object",
        },
      },
    });

    const parsed = JSON.parse(response.output_text);
    return generatedPostSchema.parse(parsed);
  };
};
