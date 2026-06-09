<script setup lang="ts">
import { NButton, NCard, NGi, NGrid, NStatistic, NTag } from "naive-ui";
import type { PlannedRoute } from "../api/publishingApi";

defineProps<{
  plannedRoute: PlannedRoute | null;
  gpxPath: string;
  gpxUrl: string;
}>();
</script>

<template>
  <NCard size="small" data-testid="route-summary-bar">
    <NGrid :cols="2" :x-gap="12" :y-gap="12">
      <NGi>
        <NStatistic label="距离" :value="`${plannedRoute?.distanceKm ?? 0} km`" />
      </NGi>
      <NGi>
        <NStatistic label="累计爬升" :value="`${plannedRoute?.elevation.elevationGainM ?? 0} m`" />
      </NGi>
      <NGi>
        <NStatistic
          label="预计耗时"
          :value="plannedRoute?.estimatedDurationMin ? `${plannedRoute.estimatedDurationMin} 分钟` : '--'"
        />
      </NGi>
      <NGi>
        <NStatistic label="GPX">
          <template #default>
            <NButton v-if="gpxUrl" tag="a" :href="gpxUrl" download text type="primary">
              {{ gpxPath || "下载 GPX" }}
            </NButton>
            <NTag v-else size="small">未生成</NTag>
          </template>
        </NStatistic>
      </NGi>
    </NGrid>
  </NCard>
</template>
