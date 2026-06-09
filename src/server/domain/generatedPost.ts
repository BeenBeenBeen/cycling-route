import { z } from "zod";

export const generatedPostSchema = z.object({
  titleCandidates: z.array(z.string().trim().min(1)).length(3),
  body: z.string().trim().min(1),
  guide: z.string().trim().min(1),
  easterEgg: z.string().trim().min(1),
  hashtags: z.array(z.string().trim().min(1)).min(3),
  coverTitle: z.string().trim().min(1),
  coverSubtitle: z.string().trim().min(1),
  imagePrompt: z.string().trim().min(1),
});

export type GeneratedPost = z.infer<typeof generatedPostSchema>;
