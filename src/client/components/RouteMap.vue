<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { NCard, NGi, NGrid, NStatistic, NText } from "naive-ui";
import { configureAmapSecurity } from "../amapSecurityConfig";
import { loadAmap, type AmapMap, type AmapNamespace, type AmapOverlay } from "../amapLoader";
import type { PlannedRoute } from "../api/publishingApi";

const props = defineProps<{
  plannedRoute: PlannedRoute | null;
}>();

const chengduCenter = [104.0668, 30.5728] as const;
const amapJsApiConfigured = Boolean(import.meta.env.VITE_AMAP_JS_API_KEY);
configureAmapSecurity(import.meta.env.VITE_AMAP_SECURITY_JS_CODE);

const mapContainer = ref<HTMLElement | null>(null);
const mapLoadError = ref("");
const mapReady = ref(false);
let amap: AmapNamespace | null = null;
let map: AmapMap | null = null;
let routeOverlays: AmapOverlay[] = [];

const centerText = computed(() => `${chengduCenter[0]},${chengduCenter[1]}`);

const clearRouteOverlays = () => {
  routeOverlays.forEach((overlay) => overlay.setMap?.(null));
  routeOverlays = [];
};

const drawRoute = () => {
  if (!amap || !map) {
    return;
  }

  clearRouteOverlays();
  const route = props.plannedRoute;
  if (!route) {
    return;
  }

  const path = route.polylineGcj02.map((point) => [point.lng, point.lat]);
  const routeLine = new amap.Polyline({
    path,
    strokeColor: "#fc4c02",
    strokeWeight: 5,
    strokeOpacity: 0.95,
    lineJoin: "round",
    lineCap: "round",
    showDir: true,
  });
  const startMarker = new amap.Marker({
    position: [route.start.location.gcj02.lng, route.start.location.gcj02.lat],
    title: `起点：${route.start.name}`,
  });
  const endMarker = new amap.Marker({
    position: [route.end.location.gcj02.lng, route.end.location.gcj02.lat],
    title: `终点：${route.end.name}`,
  });

  routeOverlays = [routeLine, startMarker, endMarker];
  routeOverlays.forEach((overlay) => overlay.setMap?.(map));
  map.setFitView?.(routeOverlays, false, [48, 48, 48, 48]);
};

const initMap = async () => {
  if (!amapJsApiConfigured || !mapContainer.value || map) {
    return;
  }

  try {
    amap = await loadAmap(import.meta.env.VITE_AMAP_JS_API_KEY ?? "");
    map = new amap.Map(mapContainer.value, {
      center: [...chengduCenter],
      zoom: 11,
      viewMode: "2D",
      mapStyle: "amap://styles/normal",
    });
    if (amap.Scale) {
      map.addControl?.(new amap.Scale());
    }
    if (amap.ToolBar) {
      map.addControl?.(new amap.ToolBar());
    }
    mapReady.value = true;
    drawRoute();
  } catch (error) {
    mapLoadError.value = error instanceof Error ? error.message : "地图加载失败";
  }
};

onMounted(async () => {
  await nextTick();
  await initMap();
});

onBeforeUnmount(() => {
  clearRouteOverlays();
  map?.destroy?.();
  map = null;
});

watch(
  () => props.plannedRoute,
  () => drawRoute(),
  { deep: true },
);
</script>

<template>
  <section class="route-map">
    <div
      ref="mapContainer"
      class="map-shell"
      data-testid="route-map-canvas"
      :data-amap-configured="String(amapJsApiConfigured)"
      :data-default-center="centerText"
    >
      <div v-if="!amapJsApiConfigured" class="map-state">
        缺少高德 JS Key，默认地点为成都市
      </div>
      <div v-else-if="mapLoadError" class="map-state">
        {{ mapLoadError }}
      </div>
      <div v-else-if="!mapReady" class="map-state map-state-loading">
        二维地图加载中，默认地点为成都市
      </div>
    </div>
    <NCard v-if="plannedRoute" class="route-map-overlay" :title="plannedRoute.routeName" size="small">
      <NGrid :cols="3" :x-gap="8">
        <NGi>
          <NStatistic label="里程" :value="`${plannedRoute.distanceKm} km`" />
        </NGi>
        <NGi>
          <NStatistic label="累计爬升" :value="`${plannedRoute.elevation.elevationGainM ?? 0} m`" />
        </NGi>
        <NGi v-if="plannedRoute.estimatedDurationMin">
          <NStatistic label="预计耗时" :value="`${plannedRoute.estimatedDurationMin} 分钟`" />
        </NGi>
      </NGrid>
    </NCard>
    <NCard v-else class="route-map-overlay route-map-overlay-empty" title="成都市" size="small">
      <NText depth="3">默认地图中心，生成路线后将在地图上绘制骑行路线。</NText>
    </NCard>
  </section>
</template>
