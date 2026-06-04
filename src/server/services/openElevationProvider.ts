import type { ElevationPoint } from "../domain/elevationProfile";
import type { JsonLogger } from "../logging/jsonLogger";

type SampledPoint = {
  distanceM: number;
  lng: number;
  lat: number;
};

type OpenElevationProviderDeps = {
  baseUrl: string;
  batchSize: number;
  fetch?: typeof fetch;
  logger?: Pick<JsonLogger, "info" | "error">;
};

type OpenElevationResult = {
  elevation?: unknown;
};

type OpenElevationResponse = {
  results?: unknown;
};

const validateConfig = (baseUrl: string, batchSize: number) => {
  if (!baseUrl.trim()) {
    throw new Error("Open-Elevation baseUrl configuration is required.");
  }

  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new Error("Open-Elevation batchSize must be a positive integer.");
  }
};

const readJson = async (response: Response): Promise<OpenElevationResponse> => {
  try {
    return (await response.json()) as OpenElevationResponse;
  } catch {
    throw new Error("Open-Elevation returned invalid JSON.");
  }
};

const mapBatchResults = (
  points: SampledPoint[],
  results: OpenElevationResult[],
): ElevationPoint[] => {
  if (results.length !== points.length) {
    throw new Error("Open-Elevation returned a result count that does not match the request.");
  }

  return points.map((point, index) => {
    const elevation = results[index]?.elevation;
    if (typeof elevation !== "number" || !Number.isFinite(elevation)) {
      throw new Error("Open-Elevation returned an invalid elevation value.");
    }

    return { ...point, ele: elevation };
  });
};

export const createOpenElevationProvider =
  ({
    baseUrl,
    batchSize,
    fetch: fetchImpl = globalThis.fetch,
    logger,
  }: OpenElevationProviderDeps) =>
  async (points: SampledPoint[]): Promise<ElevationPoint[]> => {
    validateConfig(baseUrl, batchSize);
    const output: ElevationPoint[] = [];

    logger?.info("elevation.lookup.started", {
      pointCount: points.length,
      batchSize,
    });

    for (let start = 0; start < points.length; start += batchSize) {
      const batch = points.slice(start, start + batchSize);
      const response = await fetchImpl(baseUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locations: batch.map((point) => ({
            latitude: point.lat,
            longitude: point.lng,
          })),
        }),
      });

      if (!response.ok) {
        logger?.error("elevation.lookup.failed", { status: response.status });
        throw new Error(`Open-Elevation HTTP request failed with status ${response.status}.`);
      }

      const payload = await readJson(response);
      const results = Array.isArray(payload.results)
        ? (payload.results as OpenElevationResult[])
        : [];
      output.push(...mapBatchResults(batch, results));
    }

    logger?.info("elevation.lookup.completed", { pointCount: output.length });

    return output;
  };
