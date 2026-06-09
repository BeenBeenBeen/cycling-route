import { ZodError } from "zod";
import {
  generateRouteInputSchema,
  type GenerateRouteInput,
  type GenerateRouteUseCase,
} from "../useCases/generateRouteUseCase";

export type GenerateRoute = GenerateRouteUseCase;

type HandlerRequest = {
  body: unknown;
};

type HandlerResponse = {
  status(code: number): HandlerResponse;
  json(payload: unknown): HandlerResponse;
};

export const createGenerateRouteHandler =
  (generateRouteUseCase: GenerateRoute) =>
  async (req: HandlerRequest, res: HandlerResponse) => {
    let input: GenerateRouteInput;
    try {
      input = generateRouteInputSchema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid route generation input",
          issues: error.issues,
        });
      }

      return res.status(400).json({ error: "Invalid route generation input" });
    }

    try {
      const route = await generateRouteUseCase(input);
      return res.json({ route });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(502).json({ error: "Failed to generate route" });
      }

      return res.status(502).json({
        error: "Failed to generate route",
        detail: error instanceof Error ? error.message : "Unknown upstream error",
      });
    }
  };
