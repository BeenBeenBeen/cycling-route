import { z } from "zod";
import {
  parsePlannedRoute,
  type PlannedRoute,
} from "../domain/plannedRoute";
import {
  placeCandidateSchema,
  type Coordinate,
  type PlaceCandidate,
} from "../domain/placeCandidate";
import type { ElevationPoint } from "../domain/elevationProfile";
import { calculateElevationGainM } from "../services/elevationGainCalculator";
import { convertPolylineGcj02ToWgs84 } from "../services/coordinateConverter";
import { sampleRouteEveryMeters, type RouteSample } from "../services/routeSampler";

export type PlanCyclingRoute = (input: {
  start: PlaceCandidate;
  end: PlaceCandidate;
}) => Promise<{
  distanceM: number;
  durationSeconds?: number;
  polylineGcj02: Coordinate[];
}>;

export type LookupElevation = (
  points: RouteSample[],
  options?: { batchSize?: number },
) => Promise<ElevationPoint[]>;

type GenerateRouteUseCaseDeps = {
  planCyclingRoute: PlanCyclingRoute;
  lookupElevation: LookupElevation;
  sampleIntervalM: number;
  elevationBatchSize: number;
  gainNoiseThresholdM: number;
};

export const generateRouteInputSchema = z
  .object({
    start: placeCandidateSchema,
    end: placeCandidateSchema,
    waypoints: z.array(placeCandidateSchema).optional(),
    sampleIntervalM: z.number().finite().positive().optional(),
    elevationBatchSize: z.number().finite().int().positive().optional(),
  })
  .superRefine((input, context) => {
    if (input.waypoints && input.waypoints.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["waypoints"],
        message: "Waypoints are not supported in V2.0 route generation.",
      });
    }
  });

export type GenerateRouteInput = z.input<typeof generateRouteInputSchema>;
export type GenerateRouteUseCase = (
  input: GenerateRouteInput,
) => Promise<PlannedRoute>;

const roundDistanceKm = (distanceM: number): number =>
  Math.round((distanceM / 1000) * 100) / 100;

const formatDuration = (durationSeconds?: number): string | undefined => {
  if (durationSeconds === undefined) {
    return undefined;
  }

  const totalMinutes = Math.max(1, Math.round(durationSeconds / 60));
  if (totalMinutes < 60) {
    return `约 ${totalMinutes} 分钟`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    return `约 ${hours} 小时`;
  }

  return `约 ${hours} 小时 ${minutes} 分钟`;
};

const formatUnknownError = (error: unknown): string =>
  error instanceof Error ? error.message : "Unknown elevation lookup error";

export const createGenerateRouteUseCase =
  ({
    planCyclingRoute,
    lookupElevation,
    sampleIntervalM,
    elevationBatchSize,
    gainNoiseThresholdM,
  }: GenerateRouteUseCaseDeps): GenerateRouteUseCase =>
  async (input) => {
    const request = generateRouteInputSchema.parse(input);
    const intervalM = request.sampleIntervalM ?? sampleIntervalM;
    const batchSize = request.elevationBatchSize ?? elevationBatchSize;
    const planned = await planCyclingRoute({
      start: request.start,
      end: request.end,
    });
    const polylineWgs84 = convertPolylineGcj02ToWgs84(planned.polylineGcj02);
    const samples = sampleRouteEveryMeters(polylineWgs84, intervalM);

    let elevationPoints: ElevationPoint[];
    let elevationGainM = 0;
    let elevationStatus: "success" | "failed" = "success";
    let elevationError: string | undefined;

    try {
      elevationPoints = await lookupElevation(samples, { batchSize });
      elevationGainM = calculateElevationGainM(elevationPoints, gainNoiseThresholdM);
    } catch (error) {
      elevationStatus = "failed";
      elevationError = formatUnknownError(error);
      elevationPoints = samples.map((sample) => ({ ...sample }));
    }

    const routeName = `${request.start.name}到${request.end.name}`;
    const distanceKm = roundDistanceKm(planned.distanceM);
    const estimatedDuration = formatDuration(planned.durationSeconds);
    const routeFacts = {
      routeName,
      startPoint: request.start.name,
      endPoint: request.end.name,
      distanceKm,
      elevationGainM,
      difficulty: "待确认",
      roadType: "待确认",
      highlights: ["待补充"],
      warnings: ["待补充"],
      supplyPoints: ["待补充"],
      ...(estimatedDuration ? { estimatedDuration } : {}),
    };

    const route = {
      routeId: `route_${Date.now()}`,
      routeName,
      start: request.start,
      end: request.end,
      waypoints: [],
      distanceKm,
      ...(planned.durationSeconds !== undefined
        ? { estimatedDurationMin: Math.max(1, Math.round(planned.durationSeconds / 60)) }
        : {}),
      polylineGcj02: planned.polylineGcj02,
      polylineWgs84,
      elevation: {
        status: elevationStatus,
        sampleIntervalM: intervalM,
        batchSize,
        gainNoiseThresholdM,
        points: elevationPoints,
        ...(elevationStatus === "success" ? { elevationGainM } : {}),
        ...(elevationError ? { error: elevationError } : {}),
      },
      routeFacts,
    };

    return parsePlannedRoute(route);
  };
