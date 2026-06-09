import type { PlannedRoute, RouteInput } from "../api/publishingApi";

const storageKey = "cycling-route.routePublishDraft";

export type RoutePublishDraft = {
  plannedRoute: PlannedRoute;
  routeFacts: RouteInput;
  gpxPath?: string;
  gpxUrl?: string;
  updatedAt: string;
};

const isRoutePublishDraft = (value: unknown): value is RoutePublishDraft => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<RoutePublishDraft>;
  return Boolean(
    draft.plannedRoute &&
      draft.routeFacts &&
      typeof draft.updatedAt === "string",
  );
};

export const readRoutePublishDraft = (): RoutePublishDraft | null => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return isRoutePublishDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeRoutePublishDraft = (draft: RoutePublishDraft) => {
  localStorage.setItem(storageKey, JSON.stringify(draft));
};

export const clearRoutePublishDraft = () => {
  localStorage.removeItem(storageKey);
};
