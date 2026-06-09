import { z } from "zod";
import { routeInputSchema } from "./routeInput";

export const coverPosterRequestSchema = z.object({
  route: routeInputSchema,
  imagePrompt: z.string().trim().min(1),
  coverTitle: z.string().trim().min(1),
  coverSubtitle: z.string().trim().min(1),
});

export type CoverPosterRequest = z.infer<typeof coverPosterRequestSchema>;
