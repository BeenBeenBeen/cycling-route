import { ZodError } from "zod";
import {
  searchPlacesInputSchema,
  type SearchPlacesInput,
  type SearchPlacesResult,
} from "../useCases/searchPlacesUseCase";

export type SearchPlaces = (
  input: SearchPlacesInput,
) => Promise<SearchPlacesResult>;

type HandlerRequest = {
  body: unknown;
};

type HandlerResponse = {
  status(code: number): HandlerResponse;
  json(payload: unknown): HandlerResponse;
};

export const createSearchPlacesHandler =
  (searchPlacesUseCase: SearchPlaces) =>
  async (req: HandlerRequest, res: HandlerResponse) => {
    let input: SearchPlacesInput;
    try {
      input = searchPlacesInputSchema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid place search input",
          issues: error.issues,
        });
      }
      return res.status(400).json({ error: "Invalid place search input" });
    }

    try {
      const result = await searchPlacesUseCase(input);
      return res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(502).json({ error: "Failed to search places" });
      }

      return res.status(502).json({
        error: "Failed to search places",
        detail: error instanceof Error ? error.message : "Unknown upstream error",
      });
    }
  };
