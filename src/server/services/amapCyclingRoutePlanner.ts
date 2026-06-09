import type { PlaceCandidate, Coordinate } from "../domain/placeCandidate";
import type { JsonLogger } from "../logging/jsonLogger";

type AmapCyclingRoutePlannerDeps = {
  apiKey?: string;
  fetch?: typeof fetch;
  logger?: Pick<JsonLogger, "info" | "error">;
};

type PlannedCyclingRoute = {
  distanceM: number;
  durationSeconds?: number;
  polylineGcj02: Coordinate[];
};

type AmapRouteStep = {
  polyline?: unknown;
};

type AmapRoutePath = {
  distance?: unknown;
  duration?: unknown;
  steps?: unknown;
};

type AmapCyclingRouteResponse = {
  status?: unknown;
  info?: unknown;
  errcode?: unknown;
  errmsg?: unknown;
  errdetail?: unknown;
  data?: {
    paths?: unknown;
  };
  route?: {
    paths?: unknown;
  };
};

const AMAP_CYCLING_ROUTE_URL = "https://restapi.amap.com/v4/direction/bicycling";

const requireApiKey = (apiKey?: string) => {
  if (!apiKey?.trim()) {
    throw new Error("Missing AMAP_API_KEY configuration for amap cycling route planning.");
  }

  return apiKey;
};

const formatCoordinate = (point: Coordinate) => `${point.lng},${point.lat}`;

const parseNumber = (value: unknown, field: string) => {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Amap cycling route returned invalid ${field}.`);
  }

  return numberValue;
};

const parsePolylinePoint = (point: string): Coordinate => {
  const [lngText, latText] = point.split(",");
  const lng = Number(lngText);
  const lat = Number(latText);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    throw new Error(`Amap cycling route returned an invalid polyline point: ${point}`);
  }

  return { lng, lat };
};

const sameCoordinate = (left: Coordinate, right: Coordinate) =>
  left.lng === right.lng && left.lat === right.lat;

const parseMergedPolyline = (steps: AmapRouteStep[]): Coordinate[] => {
  const points: Coordinate[] = [];

  for (const step of steps) {
    if (typeof step.polyline !== "string" || !step.polyline.trim()) {
      continue;
    }

    const stepPoints = step.polyline.split(";").filter(Boolean).map(parsePolylinePoint);

    for (const point of stepPoints) {
      const last = points.at(-1);
      if (last && sameCoordinate(last, point)) {
        continue;
      }

      points.push(point);
    }
  }

  if (points.length === 0) {
    throw new Error("Amap cycling route returned no polyline points.");
  }

  return points;
};

const readJson = async (response: Response): Promise<AmapCyclingRouteResponse> => {
  try {
    return (await response.json()) as AmapCyclingRouteResponse;
  } catch {
    throw new Error("Amap cycling route returned invalid JSON.");
  }
};

const isSuccessfulResponse = (payload: AmapCyclingRouteResponse) =>
  payload.status === "1" || payload.errcode === 0;

const readErrorMessage = (payload: AmapCyclingRouteResponse) => {
  const message =
    typeof payload.info === "string" && payload.info.trim()
      ? payload.info
      : typeof payload.errmsg === "string" && payload.errmsg.trim()
        ? payload.errmsg
        : typeof payload.errdetail === "string" && payload.errdetail.trim()
          ? payload.errdetail
          : "unknown error";

  return message;
};

const readPaths = (payload: AmapCyclingRouteResponse) => {
  const paths = payload.data?.paths ?? payload.route?.paths;
  return Array.isArray(paths) ? (paths as AmapRoutePath[]) : [];
};

export const createAmapCyclingRoutePlanner =
  ({ apiKey, fetch: fetchImpl = globalThis.fetch, logger }: AmapCyclingRoutePlannerDeps) =>
  async (input: { start: PlaceCandidate; end: PlaceCandidate }): Promise<PlannedCyclingRoute> => {
    const key = requireApiKey(apiKey);
    const body = new URLSearchParams({
      key,
      origin: formatCoordinate(input.start.location.gcj02),
      destination: formatCoordinate(input.end.location.gcj02),
    });

    logger?.info("route.plan.started", {
      startId: input.start.id,
      endId: input.end.id,
    });

    const response = await fetchImpl(AMAP_CYCLING_ROUTE_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body,
    });

    if (!response.ok) {
      logger?.error("route.plan.failed", { status: response.status });
      throw new Error(`Amap cycling route HTTP request failed with status ${response.status}.`);
    }

    const payload = await readJson(response);
    if (!isSuccessfulResponse(payload)) {
      const info = readErrorMessage(payload);
      logger?.error("route.plan.failed", {
        status: payload.status,
        errcode: payload.errcode,
        info,
      });
      throw new Error(`Amap cycling route planning failed: ${info}.`);
    }

    const paths = readPaths(payload);
    const path = paths[0];
    if (!path) {
      throw new Error("Amap cycling route returned no paths.");
    }

    const steps = Array.isArray(path.steps) ? (path.steps as AmapRouteStep[]) : [];
    const distanceM = parseNumber(path.distance, "distance");
    const durationSeconds =
      path.duration === undefined ? undefined : parseNumber(path.duration, "duration");
    const result = {
      distanceM,
      durationSeconds,
      polylineGcj02: parseMergedPolyline(steps),
    };

    logger?.info("route.plan.completed", {
      distanceM: result.distanceM,
      pointCount: result.polylineGcj02.length,
    });

    return result;
  };
