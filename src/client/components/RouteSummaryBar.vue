<script setup lang="ts">
import { computed } from "vue";
import { NButton, NCard, NGi, NGrid, NStatistic, NTag } from "naive-ui";
import type { PlannedRoute } from "../api/publishingApi";
import { calculateMaxElevationGrade, formatGrade } from "../elevationGrade";
import { estimateCyclingCalories, formatRideDuration } from "../routeEffort";

const props = defineProps<{
  plannedRoute: PlannedRoute | null;
  gpxPath: string;
  gpxUrl: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  "send-to-publisher": [];
}>();

const maxGradeText = computed(() => {
  const maxGrade = calculateMaxElevationGrade(props.plannedRoute?.elevation.points ?? []);
  return maxGrade === null ? "--" : formatGrade(maxGrade);
});

const rideDurationText = computed(() =>
  formatRideDuration(props.plannedRoute?.estimatedDurationMin),
);
const calorieText = computed(() => {
  const calories = estimateCyclingCalories(props.plannedRoute?.estimatedDurationMin);
  return calories === null ? "--" : `约 ${calories} kcal`;
});
</script>

<template>
  <NCard size="small" data-testid="route-summary-bar">
    <NGrid cols="1 s:2" :x-gap="12" :y-gap="12" responsive="screen">
      <NGi data-testid="distance-metrics">
        <section class="distance-metrics">
          <NStatistic label="距离" :value="`${plannedRoute?.distanceKm ?? 0} km`" />
          <dl class="distance-metrics-detail">
            <div>
              <dt>预计骑行时间</dt>
              <dd>{{ rideDurationText }}</dd>
            </div>
            <div>
              <dt>预计消耗卡路里</dt>
              <dd>{{ calorieText }}</dd>
            </div>
          </dl>
        </section>
      </NGi>
      <NGi>
        <NStatistic
          label="累计爬升"
          :value="!plannedRoute
            ? '0 m'
            : plannedRoute.elevation.status === 'success'
              ? `${plannedRoute.elevation.elevationGainM ?? 0} m`
              : '--'"
        />
      </NGi>
      <NGi>
        <NStatistic
          label="最大坡度"
          :value="maxGradeText"
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
    <NButton
      class="route-summary-action"
      data-testid="send-to-publisher"
      type="primary"
      ghost
      block
      :disabled="!plannedRoute || loading"
      @click="emit('send-to-publisher')"
    >
      发送到小红书发布
    </NButton>
  </NCard>
</template>

<style scoped>
.route-summary-action {
  margin-top: 12px;
}

.distance-metrics-detail {
  display: grid;
  gap: 4px;
  margin: 8px 0 0;
  color: #64748b;
  font-size: 12px;
}

.distance-metrics-detail div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.distance-metrics-detail dt,
.distance-metrics-detail dd {
  margin: 0;
}

.distance-metrics-detail dd {
  color: #334155;
  font-weight: 600;
  text-align: right;
}
</style>
