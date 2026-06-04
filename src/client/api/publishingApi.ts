export type RouteInput = {
  routeName: string;
  startPoint: string;
  endPoint: string;
  distanceKm: number;
  elevationGainM: number;
  difficulty: string;
  roadType: string;
  highlights: string[];
  warnings: string[];
  supplyPoints: string[];
  bestSeason?: string;
  bestStartTime?: string;
  targetRiders?: string;
  transportation?: string;
  estimatedDuration?: string;
  photoSpots?: string[];
  foodRecommendations?: string[];
  userHashtags?: string[];
  extraNotes?: string;
};

export type GeneratedPost = {
  titleCandidates: string[];
  body: string;
  guide: string;
  easterEgg: string;
  hashtags: string[];
  coverTitle: string;
  coverSubtitle: string;
  imagePrompt: string;
};

export type Coordinate = {
  lng: number;
  lat: number;
};

export type PlaceCandidate = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  district?: string;
  location: { gcj02: Coordinate };
  source: "amap";
};

export type ElevationPoint = Coordinate & {
  distanceM: number;
  ele?: number;
};

export type PlannedRoute = {
  routeId: string;
  routeName: string;
  start: PlaceCandidate;
  end: PlaceCandidate;
  waypoints: PlaceCandidate[];
  distanceKm: number;
  estimatedDurationMin?: number;
  polylineGcj02: Coordinate[];
  polylineWgs84: Coordinate[];
  elevation: {
    status: "success" | "partial" | "failed";
    sampleIntervalM: number;
    batchSize: number;
    gainNoiseThresholdM: number;
    points: ElevationPoint[];
    elevationGainM?: number;
    error?: string;
  };
  routeFacts: RouteInput;
};

export type SearchPlacesPayload = {
  startQuery: string;
  endQuery: string;
  city?: string;
  limit?: number;
};

export type GenerateRoutePayload = {
  start: PlaceCandidate;
  end: PlaceCandidate;
  waypoints?: PlaceCandidate[];
  sampleIntervalM?: number;
  elevationBatchSize?: number;
};

export type GenerateGpxPayload = {
  route: PlannedRoute;
  name?: string;
  allowMissingElevation?: boolean;
};

export type GenerateGpxResponse = {
  gpxPath: string;
  gpxUrl: string;
  stravaCompatible: boolean;
};

export type GenerateCoverPayload = {
  route: RouteInput;
  imagePrompt: string;
  coverTitle: string;
  coverSubtitle: string;
};

export type GenerateCoverResponse = {
  coverPath: string;
  coverUrl: string;
};

export type SaveMarkdownPayload = {
  route: RouteInput;
  post: GeneratedPost;
  selectedTitle: string;
  coverPath?: string;
  gpxPath?: string;
};

export type AssistPublishPayload = {
  title: string;
  body: string;
  hashtags: string[];
  coverPath: string;
};

type ApiErrorPayload = {
  error?: string;
  detail?: string;
  issues?: unknown;
};

export class PublishingApiError extends Error {
  detail?: string;
  issues?: unknown;

  constructor(message: string, detail?: string, issues?: unknown) {
    super(message);
    this.name = "PublishingApiError";
    this.detail = detail;
    this.issues = issues;
  }
}

const requestJson = async <T>(url: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = payload as ApiErrorPayload;
    throw new PublishingApiError(
      error.error ?? "请求失败",
      error.detail,
      error.issues,
    );
  }

  return payload as T;
};

export const generatePost = (route: RouteInput) =>
  requestJson<{ post: GeneratedPost }>("/api/generate-post", route);

export const generateCover = (payload: GenerateCoverPayload) =>
  requestJson<GenerateCoverResponse>("/api/generate-cover", payload);

export const searchPlaces = (payload: SearchPlacesPayload) =>
  requestJson<{
    startCandidates: PlaceCandidate[];
    endCandidates: PlaceCandidate[];
  }>("/api/search-places", payload);

export const generateRoute = (payload: GenerateRoutePayload) =>
  requestJson<{ route: PlannedRoute }>("/api/generate-route", payload);

export const generateGpx = (payload: GenerateGpxPayload) =>
  requestJson<GenerateGpxResponse>("/api/generate-gpx", payload);

export const saveMarkdown = (payload: SaveMarkdownPayload) =>
  requestJson<{ markdownPath: string }>("/api/save-markdown", payload);

export const assistPublish = (payload: AssistPublishPayload) =>
  requestJson<{ ok: true }>("/api/assist-publish", payload);
