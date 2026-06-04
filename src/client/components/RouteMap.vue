<script setup lang="ts">
import type { PlannedRoute } from "../api/publishingApi";

defineProps<{
  plannedRoute: PlannedRoute | null;
}>();
</script>

<template>
  <section class="route-map">
    <h2>路线地图</h2>
    <div v-if="!plannedRoute" class="map-empty">尚未生成路线</div>
    <div v-else>
      <div class="map-shell" data-testid="route-map-canvas">
        <strong>{{ plannedRoute.routeName }}</strong>
      </div>
      <dl class="route-facts">
        <div>
          <dt>里程</dt>
          <dd>{{ plannedRoute.distanceKm }} km</dd>
        </div>
        <div>
          <dt>累计爬升</dt>
          <dd>{{ plannedRoute.elevation.elevationGainM ?? 0 }} m</dd>
        </div>
        <div v-if="plannedRoute.estimatedDurationMin">
          <dt>预计耗时</dt>
          <dd>{{ plannedRoute.estimatedDurationMin }} 分钟</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
