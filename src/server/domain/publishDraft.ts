import { z } from "zod";

export const publishDraftSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  hashtags: z.array(z.string().trim().min(1)).min(1),
  coverPath: z.string().trim().min(1),
});

export type PublishDraft = z.infer<typeof publishDraftSchema>;
