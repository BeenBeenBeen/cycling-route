import { z } from "zod";
import { elevationPointSchema } from "./elevationProfile";

const requiredText = z.string().trim().min(1);

export const gpxRouteSchema = z.object({
  routeId: requiredText,
  name: requiredText,
  points: z.array(elevationPointSchema).min(1),
  gpxPath: requiredText,
  gpxUrl: requiredText.regex(/\.gpx(?:[?#].*)?$/),
  stravaCompatible: z.boolean(),
});

export type GpxRoute = z.infer<typeof gpxRouteSchema>;

export const parseGpxRoute = (input: unknown): GpxRoute => gpxRouteSchema.parse(input);
