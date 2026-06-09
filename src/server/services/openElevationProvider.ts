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

type OpenElevationLookupOptions = {
  batchSize?: number;
};

type OpenElevationResult = {
  elevation?: unknown;
};

type OpenElevationResponse = {
  results?: unknown;
};

type ErrorWithCode = Error & {
  code?: unknown;
  cause?: unknown;
};

const MAX_ERROR_BODY_LENGTH = 2_000;

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

const readErrorBody = async (response: Response): Promise<string | undefined> => {
  try {
    const body = (await response.text()).trim();
    if (!body) {
      return undefined;
    }

    return body.length > MAX_ERROR_BODY_LENGTH
      ? `${body.slice(0, MAX_ERROR_BODY_LENGTH)}...`
      : body;
  } catch {
    return undefined;
  }
};

const serializeError = (error: unknown): Record<string, unknown> => {
  if (!(error instanceof Error)) {
    return { name: "Error", message: String(error) };
  }

  const value = error as ErrorWithCode;
  const serialized: Record<string, unknown> = {
    name: error.name,
    message: error.message,
  };

  if (typeof value.code === "string") {
    serialized.code = value.code;
  }

  if (value.cause !== undefined) {
    serialized.cause = serializeError(value.cause);
  }

  return serialized;
};

const formatErrorCause = (error: unknown): string | undefined => {
  const cause = error instanceof Error ? (error as ErrorWithCode).cause : undefined;
  if (!(cause instanceof Error)) {
    return undefined;
  }

  const code = (cause as ErrorWithCode).code;
  return `${cause.message}${typeof code === "string" ? ` (${code})` : ""}`;
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
  async (
    points: SampledPoint[],
    options: OpenElevationLookupOptions = {},
  ): Promise<ElevationPoint[]> => {
    const effectiveBatchSize = options.batchSize ?? batchSize;
    validateConfig(baseUrl, effectiveBatchSize);
    const output: ElevationPoint[] = [];

    logger?.info("elevation.lookup.started", {
      pointCount: points.length,
      batchSize: effectiveBatchSize,
    });

    const batchCount = Math.ceil(points.length / effectiveBatchSize);
    for (let start = 0; start < points.length; start += effectiveBatchSize) {
      const batch = points.slice(start, start + effectiveBatchSize);
      const batchIndex = Math.floor(start / effectiveBatchSize) + 1;
      let response: Response;
      try {
        response = await fetchImpl(baseUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            locations: batch.map((point) => ({
              latitude: point.lat,
              longitude: point.lng,
            })),
          }),
        });
      } catch (error) {
        const context = {
          batchIndex,
          batchCount,
          batchPointCount: batch.length,
          completedPointCount: output.length,
        };
        logger?.error("elevation.lookup.failed", {
          error: serializeError(error),
          ...context,
        });
        const cause = formatErrorCause(error);
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Open-Elevation request failed: ${message}${cause ? `; cause: ${cause}` : ""} (batch ${batchIndex}/${batchCount}).`,
          { cause: error },
        );
      }

      if (!response.ok) {
        const responseBody = await readErrorBody(response);
        const context = {
          status: response.status,
          statusText: response.statusText,
          ...(responseBody ? { responseBody } : {}),
          batchIndex,
          batchCount,
          batchPointCount: batch.length,
          completedPointCount: output.length,
        };
        logger?.error("elevation.lookup.failed", context);
        const statusLabel = [response.status, response.statusText].filter(Boolean).join(" ");
        throw new Error(
          `Open-Elevation HTTP request failed with status ${statusLabel}${responseBody ? `: ${responseBody}` : ""} (batch ${batchIndex}/${batchCount}).`,
        );
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
