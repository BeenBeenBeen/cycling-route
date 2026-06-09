import { ZodError } from "zod";
import type { GenerateGpxUseCase } from "../useCases/generateGpxUseCase";

export type GenerateGpx = GenerateGpxUseCase;

type HandlerRequest = {
  body: unknown;
};

type HandlerResponse = {
  status(code: number): HandlerResponse;
  json(payload: unknown): HandlerResponse;
};

const formatErrorDetail = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const createGenerateGpxHandler =
  (generateGpx: GenerateGpx) =>
  async (req: HandlerRequest, res: HandlerResponse) => {
    try {
      const result = await generateGpx(req.body);
      return res.json({
        gpxPath: result.gpxPath,
        gpxUrl: result.gpxUrl,
        stravaCompatible: result.stravaCompatible,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid GPX generation input",
          issues: error.issues,
        });
      }

      return res.status(500).json({
        error: "Failed to generate GPX",
        detail: formatErrorDetail(error),
      });
    }
  };
