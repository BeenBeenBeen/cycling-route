import { z } from "zod";
import { coordinateSchema } from "./placeCandidate";

export const elevationStatusSchema = z.enum(["success", "partial", "failed"]);

export const elevationPointSchema = coordinateSchema.extend({
  distanceM: z.number().finite().min(0),
  ele: z.number().finite().optional(),
});

export const elevationProfileSchema = z.object({
  status: elevationStatusSchema,
  sampleIntervalM: z.number().finite().positive(),
  batchSize: z.number().finite().int().positive(),
  gainNoiseThresholdM: z.number().finite().min(0),
  points: z.array(elevationPointSchema),
  elevationGainM: z.number().finite().min(0).optional(),
  error: z.string().trim().min(1).optional(),
});

export type ElevationStatus = z.infer<typeof elevationStatusSchema>;
export type ElevationPoint = z.infer<typeof elevationPointSchema>;
export type ElevationProfile = z.infer<typeof elevationProfileSchema>;

export const parseElevationProfile = (input: unknown): ElevationProfile =>
  elevationProfileSchema.parse(input);
