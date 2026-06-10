import type { PlaceCandidate, PlannedRoute } from "../api/publishingApi";

const storageKey = "cycling-route.routePlannerSession";

export type RoutePlannerSession = {
  startQuery: string;
  endQuery: string;
  startCandidates: PlaceCandidate[];
  endCandidates: PlaceCandidate[];
  selectedStart: PlaceCandidate | null;
  selectedEnd: PlaceCandidate | null;
  plannedRoute: PlannedRoute | null;
  gpxPath: string;
  gpxUrl: string;
  updatedAt: string;
};

const isRoutePlannerSession = (value: unknown): value is RoutePlannerSession => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<RoutePlannerSession>;
  return typeof session.updatedAt === "string";
};

export const readRoutePlannerSession = (): RoutePlannerSession | null => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return isRoutePlannerSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeRoutePlannerSession = (session: RoutePlannerSession) => {
  localStorage.setItem(storageKey, JSON.stringify(session));
};

export const clearRoutePlannerSession = () => {
  localStorage.removeItem(storageKey);
};
