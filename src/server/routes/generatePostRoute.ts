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
    let route: RouteInput;
    try {
      route = parseRouteInput(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid route input",
          issues: error.issues,
        });
      }
      return res.status(400).json({ error: "Invalid route input" });
    }

    try {
      const post = await generatePost(route);
      return res.json({ post });
    } catch (error) {
      const message =
        error instanceof ZodError
          ? "Failed to generate post"
          : error instanceof Error
            ? error.message
            : "Failed to generate post";
      return res.status(502).json({ error: message });
    }
  };
