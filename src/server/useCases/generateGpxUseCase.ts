import { z } from "zod";
import { plannedRouteSchema, type PlannedRoute } from "../domain/plannedRoute";
import type { WriteGpxRouteResult } from "../services/gpxRouteWriter";

export type WriteGpx = (input: {
  routeId: string;
  name: string;
  points: PlannedRoute["elevation"]["points"];
  allowMissingElevation?: boolean;
}) => Promise<WriteGpxRouteResult>;

type GenerateGpxUseCaseDeps = {
  writeGpx: WriteGpx;
};

export const generateGpxInputSchema = z
  .object({
    route: plannedRouteSchema,
    name: z.string().trim().min(1).optional(),
    allowMissingElevation: z.boolean().optional(),
  })
  .superRefine((input, context) => {
    const hasMissingElevation = input.route.elevation.points.some(
      (point) => point.ele === undefined,
    );
    if (hasMissingElevation && input.allowMissingElevation !== true) {
      context.addIssue({
        code: "custom",
        path: ["route", "elevation", "points"],
        message: "Elevation is required for Strava-compatible GPX generation.",
      });
    }
  });

export type GenerateGpxInput = z.input<typeof generateGpxInputSchema>;
export type GenerateGpxUseCase = (
  input: unknown,
) => Promise<WriteGpxRouteResult>;

export const createGenerateGpxUseCase =
  ({ writeGpx }: GenerateGpxUseCaseDeps): GenerateGpxUseCase =>
  async (input) => {
    const request = generateGpxInputSchema.parse(input);

    return await writeGpx({
      routeId: request.route.routeId,
      name: request.name ?? request.route.routeName,
      points: request.route.elevation.points,
      allowMissingElevation: request.allowMissingElevation,
    });
  };
