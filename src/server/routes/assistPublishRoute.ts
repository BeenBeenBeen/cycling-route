import { ZodError } from "zod";
import { publishDraftSchema } from "../domain/publishDraft";
import type { AssistPublish } from "../useCases/assistPublishUseCase";

type HandlerRequest = {
  body: unknown;
};

type HandlerResponse = {
  status(code: number): HandlerResponse;
  json(payload: unknown): HandlerResponse;
};

const errorDetail = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const createAssistPublishHandler =
  (assistPublish: AssistPublish) =>
  async (req: HandlerRequest, res: HandlerResponse) => {
    try {
      const draft = publishDraftSchema.parse(req.body);
      const result = await assistPublish(draft);
      return res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid publish input",
          issues: error.issues,
        });
      }

      return res.status(500).json({
        error: "Failed to assist publishing",
        detail: errorDetail(error),
      });
    }
  };
