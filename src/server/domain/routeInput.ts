import { z } from "zod";

const requiredText = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).optional();
const requiredTextList = z
  .array(z.string())
  .transform((items) => items.map((item) => item.trim()).filter(Boolean))
  .pipe(z.array(z.string().min(1)).min(1));
const optionalTextList = z
  .array(z.string())
  .transform((items) => items.map((item) => item.trim()).filter(Boolean))
  .optional();

export const routeInputSchema = z.object({
  routeName: requiredText,
  startPoint: requiredText,
  endPoint: requiredText,
  distanceKm: z.number().finite().positive(),
  elevationGainM: z.number().finite().min(0),
  difficulty: requiredText,
  roadType: requiredText,
  highlights: requiredTextList,
  warnings: requiredTextList,
  supplyPoints: requiredTextList,
  bestSeason: optionalText,
  bestStartTime: optionalText,
  targetRiders: optionalText,
  transportation: optionalText,
  estimatedDuration: optionalText,
  photoSpots: optionalTextList,
  foodRecommendations: optionalTextList,
  userHashtags: optionalTextList,
  extraNotes: optionalText,
});

export type RouteInput = z.infer<typeof routeInputSchema>;

export const parseRouteInput = (input: unknown): RouteInput =>
  routeInputSchema.parse(input);
