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

export type GenerateCoverPayload = {
  route: RouteInput;
  imagePrompt: string;
  coverTitle: string;
  coverSubtitle: string;
};

export type SaveMarkdownPayload = {
  route: RouteInput;
  post: GeneratedPost;
  selectedTitle: string;
  coverPath?: string;
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
  requestJson<{ coverPath: string }>("/api/generate-cover", payload);

export const saveMarkdown = (payload: SaveMarkdownPayload) =>
  requestJson<{ markdownPath: string }>("/api/save-markdown", payload);

export const assistPublish = (payload: AssistPublishPayload) =>
  requestJson<{ ok: true }>("/api/assist-publish", payload);
