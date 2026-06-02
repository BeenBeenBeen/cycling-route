import { ZodError } from "zod";
import type { GeneratedPost } from "../domain/generatedPost";
import { parseRouteInput, type RouteInput } from "../domain/routeInput";

export type GeneratePost = (route: RouteInput) => Promise<GeneratedPost>;

type HandlerRequest = {
  body: unknown;
};

type HandlerResponse = {
  status(code: number): HandlerResponse;
  json(payload: unknown): HandlerResponse;
};

export const createGeneratePostHandler =
  (generatePost: GeneratePost) =>
  async (req: HandlerRequest, res: HandlerResponse) => {
    try {
      const route = parseRouteInput(req.body);
      const post = await generatePost(route);
      return res.json({ post });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid route input",
          issues: error.issues,
        });
      }

      const message = error instanceof Error ? error.message : "Failed to generate post";
      return res.status(502).json({ error: message });
    }
  };
