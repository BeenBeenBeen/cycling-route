import { z } from "zod";
import { generatedPostSchema } from "../domain/generatedPost";
import { parseRouteInput, routeInputSchema } from "../domain/routeInput";
import type {
  SaveMarkdownPostInput,
  SaveMarkdownPostResult,
} from "../services/markdownPostStore";

export const saveMarkdownRequestSchema = z.object({
  route: routeInputSchema,
  post: generatedPostSchema,
  selectedTitle: z.string().trim().min(1),
  coverPath: z.string().trim().min(1).optional(),
  gpxPath: z.string().trim().min(1).optional(),
});

export type SaveMarkdownRequest = z.infer<typeof saveMarkdownRequestSchema>;
export type SaveMarkdown = (
  input: SaveMarkdownRequest,
) => Promise<SaveMarkdownPostResult>;

export const createSaveMarkdownUseCase =
  ({ saveMarkdown }: { saveMarkdown: (input: SaveMarkdownPostInput) => Promise<SaveMarkdownPostResult> }) =>
  async (input: unknown): Promise<SaveMarkdownPostResult> => {
    const request = saveMarkdownRequestSchema.parse(input);
    return saveMarkdown({
      ...request,
      route: parseRouteInput(request.route),
    });
  };
