import type { JsonLogger } from "../logging/jsonLogger";
import { parsePlaceCandidate, type PlaceCandidate } from "../domain/placeCandidate";

type AmapPlaceSearchDeps = {
  apiKey?: string;
  fetch?: typeof fetch;
  logger?: Pick<JsonLogger, "info" | "error">;
};

type AmapPoi = {
  id?: unknown;
  name?: unknown;
  address?: unknown;
  cityname?: unknown;
  adname?: unknown;
  location?: unknown;
};

type AmapPlaceSearchResponse = {
  status?: unknown;
  info?: unknown;
  pois?: unknown;
};

const AMAP_PLACE_SEARCH_URL = "https://restapi.amap.com/v3/place/text";

const requireApiKey = (apiKey?: string) => {
  if (!apiKey?.trim()) {
    throw new Error("Missing AMAP_API_KEY configuration for amap place search.");
  }

  return apiKey;
};

const parseLocation = (location: unknown) => {
  if (typeof location !== "string") {
    throw new Error("Amap place search returned a POI without a valid location.");
  }

  const [lngText, latText] = location.split(",");
  const lng = Number(lngText);
  const lat = Number(latText);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    throw new Error(`Amap place search returned an invalid POI location: ${location}`);
  }

  return { lng, lat };
};

const optionalString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : undefined;

const derivePoiId = (poi: AmapPoi, location: { lng: number; lat: number }) => {
  const name = optionalString(poi.name);
  return (
    optionalString(poi.id) ??
    `amap_${name ?? "unknown"}_${location.lng}_${location.lat}`
  );
};

const toPlaceCandidate = (poi: AmapPoi): PlaceCandidate => {
  const location = parseLocation(poi.location);

  return parsePlaceCandidate({
    id: derivePoiId(poi, location),
    name: optionalString(poi.name),
    address: optionalString(poi.address),
    city: optionalString(poi.cityname),
    district: optionalString(poi.adname),
    location: { gcj02: location },
    source: "amap",
  });
};

const readJson = async (response: Response): Promise<AmapPlaceSearchResponse> => {
  try {
    return (await response.json()) as AmapPlaceSearchResponse;
  } catch {
    throw new Error("Amap place search returned invalid JSON.");
  }
};

export const createAmapPlaceSearch =
  ({ apiKey, fetch: fetchImpl = globalThis.fetch, logger }: AmapPlaceSearchDeps) =>
  async (input: { query: string; city?: string; limit: number }): Promise<PlaceCandidate[]> => {
    const key = requireApiKey(apiKey);
    const body = new URLSearchParams({
      key,
      keywords: input.query,
      offset: String(input.limit),
      page: "1",
      extensions: "base",
    });

    if (input.city?.trim()) {
      body.set("city", input.city);
    }

    logger?.info("route.place.search.started", {
      query: input.query,
      city: input.city,
      limit: input.limit,
    });

    const response = await fetchImpl(AMAP_PLACE_SEARCH_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body,
    });

    if (!response.ok) {
      logger?.error("route.place.search.failed", { status: response.status });
      throw new Error(`Amap place search HTTP request failed with status ${response.status}.`);
    }

    const payload = await readJson(response);
    if (payload.status !== "1") {
      const info = optionalString(payload.info) ?? "unknown error";
      logger?.error("route.place.search.failed", { status: payload.status, info });
      throw new Error(`Amap place search failed: ${info}.`);
    }

    const pois = Array.isArray(payload.pois) ? (payload.pois as AmapPoi[]) : [];
    const candidates = pois.slice(0, input.limit).map(toPlaceCandidate);
    logger?.info("route.place.search.completed", { count: candidates.length });

    return candidates;
  };
