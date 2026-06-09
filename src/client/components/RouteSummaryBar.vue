<script setup lang="ts">
import type { PlannedRoute } from "../api/publishingApi";

defineProps<{
  plannedRoute: PlannedRoute | null;
  gpxPath: string;
  gpxUrl: string;
}>();
</script>

<template>
  <section class="route-summary-bar" data-testid="route-summary-bar">
    <div>
      <span>距离</span>
      <strong>{{ plannedRoute?.distanceKm ?? 0 }} km</strong>
    </div>
    <div>
      <span>累计爬升</span>
      <strong>{{ plannedRoute?.elevation.elevationGainM ?? 0 }} m</strong>
    </div>
    <div>
      <span>预计耗时</span>
      <strong>{{ plannedRoute?.estimatedDurationMin ? `${plannedRoute.estimatedDurationMin} 分钟` : "--" }}</strong>
    </div>
    <div>
      <span>GPX</span>
      <a v-if="gpxUrl" :href="gpxUrl" download>{{ gpxPath || "下载 GPX" }}</a>
      <strong v-else>未生成</strong>
    </div>
  </section>
</template>
