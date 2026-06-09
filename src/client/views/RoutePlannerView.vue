<script setup lang="ts">
import { computed, ref } from "vue";
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
import PlaceCandidateSelector from "../components/PlaceCandidateSelector.vue";
import RouteMap from "../components/RouteMap.vue";
import RoutePlannerForm from "../components/RoutePlannerForm.vue";
import RouteSummaryBar from "../components/RouteSummaryBar.vue";
import WorkflowActions from "../components/WorkflowActions.vue";
import { writeRoutePublishDraft } from "../stores/routePublishDraftStore";

type LoadingAction = "" | "searchPlaces" | "generateRoute" | "generateGpx";

const router = useRouter();
const startCandidates = ref<PlaceCandidate[]>([]);
const endCandidates = ref<PlaceCandidate[]>([]);
const selectedStart = ref<PlaceCandidate | null>(null);
const selectedEnd = ref<PlaceCandidate | null>(null);
const plannedRoute = ref<PlannedRoute | null>(null);
const gpxPath = ref("");
const gpxUrl = ref("");
const loadingAction = ref<LoadingAction>("");
const errorMessage = ref("");
const errorDetail = ref("");

const canGenerateRoute = computed(
  () => selectedStart.value !== null && selectedEnd.value !== null,
);

const setError = (error: unknown) => {
  if (error instanceof PublishingApiError) {
    errorMessage.value = error.message;
    errorDetail.value = error.detail ?? "";
    return;
  }

  errorMessage.value = error instanceof Error ? error.message : "请求失败";
  errorDetail.value = "";
};

const runAction = async (action: LoadingAction, work: () => Promise<void>) => {
  loadingAction.value = action;
  errorMessage.value = "";
  errorDetail.value = "";
  try {
    await work();
  } catch (error) {
    setError(error);
  } finally {
    loadingAction.value = "";
  }
};

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
    <section v-if="errorMessage" class="error-banner">
      <strong>{{ errorMessage }}</strong>
      <pre v-if="errorDetail">{{ errorDetail }}</pre>
    </section>

    <section class="route-planner-map-stage" data-testid="route-planner-map-stage">
      <RouteMap :planned-route="plannedRoute" />
    </section>

    <aside class="route-planner-panel" data-testid="route-planner-panel">
      <RoutePlannerForm @search="onSearchPlaces" />
      <PlaceCandidateSelector
        :start-candidates="startCandidates"
        :end-candidates="endCandidates"
        :selected-start="selectedStart"
        :selected-end="selectedEnd"
        @select-start="selectedStart = $event"
        @select-end="selectedEnd = $event"
      />

      <RouteSummaryBar
        :planned-route="plannedRoute"
        :gpx-path="gpxPath"
        :gpx-url="gpxUrl"
      />

      <GpxDownloadPanel
        :gpx-path="gpxPath"
        :gpx-url="gpxUrl"
        :loading="loadingAction === 'generateGpx'"
      />

      <div class="route-planner-actions">
        <WorkflowActions
          :loading-action="loadingAction"
          :has-post="false"
          :has-cover="false"
          :can-generate-route="canGenerateRoute"
          :has-route="plannedRoute !== null"
          :can-send-to-publisher="plannedRoute !== null"
          markdown-path=""
          :publish-started="false"
          :show-publish-actions="false"
          @generate-route="onGenerateRoute"
          @generate-gpx="onGenerateGpx"
          @send-to-publisher="onSendToPublisher"
        />
      </div>
    </aside>
  </section>
</template>
