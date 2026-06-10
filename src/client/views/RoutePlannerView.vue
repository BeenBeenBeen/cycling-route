<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useNotification } from "naive-ui";
import { useRouter } from "vue-router";
import {
  generateGpx,
  generateRoute,
  PublishingApiError,
  type PlaceCandidate,
  type PlannedRoute,
  searchPlaces,
} from "../api/publishingApi";
import GpxDownloadPanel from "../components/GpxDownloadPanel.vue";
import RouteMap from "../components/RouteMap.vue";
import RoutePlannerForm from "../components/RoutePlannerForm.vue";
import RouteSummaryBar from "../components/RouteSummaryBar.vue";
import {
  clearRoutePublishDraft,
  writeRoutePublishDraft,
} from "../stores/routePublishDraftStore";
import {
  readRoutePlannerSession,
  writeRoutePlannerSession,
} from "../stores/routePlannerSessionStore";

type LoadingAction = "" | "searchPlaces" | "generateRoute" | "generateGpx";

const router = useRouter();
const notification = useNotification();
const session = readRoutePlannerSession();
const startQuery = ref(session?.startQuery ?? "");
const endQuery = ref(session?.endQuery ?? "");
const startCandidates = ref<PlaceCandidate[]>([]);
const endCandidates = ref<PlaceCandidate[]>([]);
const selectedStart = ref<PlaceCandidate | null>(session?.selectedStart ?? null);
const selectedEnd = ref<PlaceCandidate | null>(session?.selectedEnd ?? null);
const plannedRoute = ref<PlannedRoute | null>(session?.plannedRoute ?? null);
const gpxPath = ref(session?.gpxPath ?? "");
const gpxUrl = ref(session?.gpxUrl ?? "");
const loadingAction = ref<LoadingAction>("");

const canGenerateRoute = computed(
  () => selectedStart.value !== null && selectedEnd.value !== null,
);

const setError = (error: unknown) => {
  if (error instanceof PublishingApiError) {
    notification.error({
      title: error.message,
      content: error.detail,
      duration: 8000,
    });
    return;
  }

  notification.error({
    title: error instanceof Error ? error.message : "请求失败",
    duration: 8000,
  });
};

const runAction = async (action: LoadingAction, work: () => Promise<void>) => {
  loadingAction.value = action;
  try {
    await work();
  } catch (error) {
    setError(error);
  } finally {
    loadingAction.value = "";
  }
};

watch(
  [startQuery, endQuery, startCandidates, endCandidates, selectedStart, selectedEnd, plannedRoute, gpxPath, gpxUrl],
  () => {
    writeRoutePlannerSession({
      startQuery: startQuery.value,
      endQuery: endQuery.value,
      startCandidates: startCandidates.value,
      endCandidates: endCandidates.value,
      selectedStart: selectedStart.value,
      selectedEnd: selectedEnd.value,
      plannedRoute: plannedRoute.value,
      gpxPath: gpxPath.value,
      gpxUrl: gpxUrl.value,
      updatedAt: new Date().toISOString(),
    });
  },
  { deep: true, immediate: true },
);

watch(
  [plannedRoute, gpxPath, gpxUrl],
  () => {
    if (!plannedRoute.value) {
      clearRoutePublishDraft();
      return;
    }

    writeRoutePublishDraft({
      plannedRoute: plannedRoute.value,
      routeFacts: plannedRoute.value.routeFacts,
      gpxPath: gpxPath.value || undefined,
      gpxUrl: gpxUrl.value || undefined,
      updatedAt: new Date().toISOString(),
    });
  },
  { deep: true, immediate: true },
);

const onSearchPlaces = (payload: { startQuery: string; endQuery: string }) =>
  runAction("searchPlaces", async () => {
    const result = await searchPlaces(payload);
    startCandidates.value = result.startCandidates;
    endCandidates.value = result.endCandidates;
    selectedStart.value = null;
    selectedEnd.value = null;
    plannedRoute.value = null;
    gpxPath.value = "";
    gpxUrl.value = "";
  });

const onGenerateRoute = () =>
  runAction("generateRoute", async () => {
    if (!selectedStart.value || !selectedEnd.value) {
      throw new Error("请先确认起点和终点");
    }

    const result = await generateRoute({
      start: selectedStart.value,
      end: selectedEnd.value,
    });
    plannedRoute.value = result.route;
    if (result.route.elevation.status === "failed") {
      notification.error({
        title: "累计爬升获取失败",
        content: result.route.elevation.error ?? "海拔服务暂时不可用",
        duration: 8000,
      });
    }
    gpxPath.value = "";
    gpxUrl.value = "";
  });

const onGenerateGpx = () =>
  runAction("generateGpx", async () => {
    if (!plannedRoute.value) {
      throw new Error("请先生成骑行路线");
    }

    const result = await generateGpx({ route: plannedRoute.value });
    gpxPath.value = result.gpxPath;
    gpxUrl.value = result.gpxUrl;
  });

const onSendToPublisher = async () => {
  if (!plannedRoute.value) {
    setError(new Error("请先生成骑行路线"));
    return;
  }

  writeRoutePublishDraft({
    plannedRoute: plannedRoute.value,
    routeFacts: plannedRoute.value.routeFacts,
    gpxPath: gpxPath.value || undefined,
    gpxUrl: gpxUrl.value || undefined,
    updatedAt: new Date().toISOString(),
  });
  await router.push("/publisher");
};
</script>

<template>
  <section class="route-planner-view">
    <section class="route-planner-map-stage" data-testid="route-planner-map-stage">
      <RouteMap :planned-route="plannedRoute" @error="setError" />
    </section>

    <aside class="route-planner-panel" data-testid="route-planner-panel">
      <RoutePlannerForm
        class="route-planner-form-section"
        :initial-start-query="startQuery"
        :initial-end-query="endQuery"
        :start-candidates="startCandidates"
        :end-candidates="endCandidates"
        :selected-start="selectedStart"
        :selected-end="selectedEnd"
        :loading="loadingAction === 'searchPlaces' || loadingAction === 'generateRoute'"
        :can-generate-route="canGenerateRoute"
        @update:start-query="startQuery = $event"
        @update:end-query="endQuery = $event"
        @search="onSearchPlaces"
        @select-start="selectedStart = $event"
        @select-end="selectedEnd = $event"
        @generate-route="onGenerateRoute"
      />

      <RouteSummaryBar
        class="route-planner-summary-section"
        :planned-route="plannedRoute"
        :gpx-path="gpxPath"
        :gpx-url="gpxUrl"
        :loading="loadingAction !== ''"
        @send-to-publisher="onSendToPublisher"
      />

      <GpxDownloadPanel
        class="route-planner-gpx-section"
        :gpx-path="gpxPath"
        :gpx-url="gpxUrl"
        :loading="loadingAction === 'generateGpx'"
        :can-generate="plannedRoute !== null"
        @generate="onGenerateGpx"
      />
    </aside>
  </section>
</template>
