import { z } from "zod";

const requiredText = z.string().trim().min(1);
const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

export const coordinateSchema = z.object({
  lng: z.number().finite().min(-180).max(180),
  lat: z.number().finite().min(-90).max(90),
});

export const placeCandidateSchema = z.object({
  id: requiredText,
  name: requiredText,
  address: optionalText,
  city: optionalText,
  district: optionalText,
  location: z.object({
    gcj02: coordinateSchema,
  }),
  source: z.literal("amap"),
});

export type Coordinate = z.infer<typeof coordinateSchema>;
export type PlaceCandidate = z.infer<typeof placeCandidateSchema>;

export const parsePlaceCandidate = (input: unknown): PlaceCandidate =>
  placeCandidateSchema.parse(input);
