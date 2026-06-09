import { z } from "zod";
import { elevationProfileSchema } from "./elevationProfile";
import { coordinateSchema, placeCandidateSchema } from "./placeCandidate";
import { routeInputSchema } from "./routeInput";

const requiredText = z.string().trim().min(1);

export const plannedRouteSchema = z.object({
  routeId: requiredText,
  routeName: requiredText,
  start: placeCandidateSchema,
  end: placeCandidateSchema,
  waypoints: z.array(placeCandidateSchema),
  distanceKm: z.number().finite().positive(),
  estimatedDurationMin: z.number().finite().positive().optional(),
  polylineGcj02: z.array(coordinateSchema).min(1),
  polylineWgs84: z.array(coordinateSchema).min(1),
  elevation: elevationProfileSchema,
  routeFacts: routeInputSchema,
});

export type PlannedRoute = z.infer<typeof plannedRouteSchema>;

export const parsePlannedRoute = (input: unknown): PlannedRoute =>
  plannedRouteSchema.parse(input);
