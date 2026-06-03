import { publishDraftSchema, type PublishDraft } from "../domain/publishDraft";
import type { AssistPublishResult } from "../services/xiaohongshuPublisher";

export type AssistPublish = (
  draft: PublishDraft,
) => Promise<AssistPublishResult>;

export const createAssistPublishUseCase =
  ({ assistPublish }: { assistPublish: AssistPublish }) =>
  async (input: unknown): Promise<AssistPublishResult> => {
    const draft = publishDraftSchema.parse(input);
    return assistPublish(draft);
  };
