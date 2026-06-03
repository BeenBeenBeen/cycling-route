import { ZodError } from "zod";
import { coverPosterRequestSchema } from "../domain/coverPoster";
import type { ComposeCoverPosterResult } from "../services/coverPosterComposer";

export type GenerateCover = (input: unknown) => Promise<ComposeCoverPosterResult>;

type HandlerRequest = {
  body: unknown;
};

type HandlerResponse = {
  status(code: number): HandlerResponse;
  json(payload: unknown): HandlerResponse;
};

const formatErrorDetail = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

export const createGenerateCoverHandler =
  (generateCover: GenerateCover) =>
  async (req: HandlerRequest, res: HandlerResponse) => {
    try {
      const input = coverPosterRequestSchema.parse(req.body);
      const result = await generateCover(input);
      return res.json({
        coverPath: result.coverPath,
        coverUrl: result.coverUrl,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid cover input",
          issues: error.issues,
        });
      }

      const detail = formatErrorDetail(error);
      if (detail.startsWith("Failed to generate cover background")) {
        return res.status(502).json({
          error: "Failed to generate cover background",
          detail,
        });
      }

      return res.status(500).json({
        error: "Failed to compose cover poster",
        detail,
      });
    }
  };
