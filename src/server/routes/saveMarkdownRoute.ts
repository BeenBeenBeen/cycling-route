import { ZodError } from "zod";
import {
  saveMarkdownRequestSchema,
  type SaveMarkdown,
} from "../useCases/saveMarkdownUseCase";

export type { SaveMarkdown };

type HandlerRequest = {
  body: unknown;
};

type HandlerResponse = {
  status(code: number): HandlerResponse;
  json(payload: unknown): HandlerResponse;
};

const errorDetail = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const createSaveMarkdownHandler =
  (saveMarkdown: SaveMarkdown) =>
  async (req: HandlerRequest, res: HandlerResponse) => {
    try {
      const input = saveMarkdownRequestSchema.parse(req.body);
      const result = await saveMarkdown(input);
      return res.json({ markdownPath: result.markdownPath });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid markdown input",
          issues: error.issues,
        });
      }

      return res.status(500).json({
        error: "Failed to save markdown",
        detail: errorDetail(error),
      });
    }
  };
