<script setup lang="ts">
import { computed, ref } from "vue";
import { NCard } from "naive-ui";
import type { ElevationPoint } from "../api/publishingApi";
import { calculateElevationGrades, formatGrade } from "../elevationGrade";

const props = defineProps<{
  points: ElevationPoint[];
}>();
const emit = defineEmits<{
  "hover-point": [point: ElevationPoint | null];
}>();

const chart = {
  width: 398,
  height: 76,
  left: 25,
  right: 397,
  top: 4,
  bottom: 54,
};

type ChartPoint = ElevationPoint & {
  ele: number;
  gradePercent: number;
  x: number;
  y: number;
};

const hoveredPoint = ref<ChartPoint | null>(null);

const validPoints = computed(() => calculateElevationGrades(props.points));

const elevationRange = computed(() => {
  if (validPoints.value.length === 0) {
    return null;
  }

  const elevations = validPoints.value.map((point) => point.ele);
  return {
    min: Math.min(...elevations),
    max: Math.max(...elevations),
  };
});

const maxDistanceM = computed(() =>
  Math.max(0, ...validPoints.value.map((point) => point.distanceM)),
);

const chartPoints = computed<ChartPoint[]>(() => {
  const range = elevationRange.value;
  if (!range) {
    return [];
  }

  const plotWidth = chart.right - chart.left;
  const plotHeight = chart.bottom - chart.top;
  const elevationSpan = range.max - range.min;

  return validPoints.value.map((point) => {
      const x = maxDistanceM.value === 0
        ? chart.left
        : chart.left + (point.distanceM / maxDistanceM.value) * plotWidth;
      const y = elevationSpan === 0
        ? chart.top + plotHeight / 2
        : chart.bottom - ((point.ele - range.min) / elevationSpan) * plotHeight;
      return { ...point, x, y };
    });
});

const linePoints = computed(() =>
  chartPoints.value.map((point) => `${Math.round(point.x)},${Math.round(point.y)}`).join(" "),
);

const areaPath = computed(() => {
  if (chartPoints.value.length === 0) {
    return "";
  }

  const points = chartPoints.value
    .map((point) => `${Math.round(point.x)} ${Math.round(point.y)}`)
    .join(" L ");
  const firstPoint = chartPoints.value[0];
  const lastPoint = chartPoints.value[chartPoints.value.length - 1];
  return `M ${points} L ${Math.round(lastPoint.x)} ${chart.bottom} L ${Math.round(firstPoint.x)} ${chart.bottom} Z`;
});

const contourTicks = computed(() => {
  const range = elevationRange.value;
  return Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    return {
      elevation: range ? range.max - (range.max - range.min) * ratio : null,
      y: chart.top + (chart.bottom - chart.top) * ratio,
    };
  });
});

const formatDistance = (distanceM: number) => {
  const distanceKm = distanceM / 1_000;
  return `${Number.isInteger(distanceKm) ? distanceKm : distanceKm.toFixed(1)} km`;
};

const onMouseMove = (event: MouseEvent) => {
  if (chartPoints.value.length === 0) {
    return;
  }

  const bounds = (event.currentTarget as SVGElement).getBoundingClientRect();
  if (bounds.width === 0) {
    return;
  }

  const mouseX = ((event.clientX - bounds.left) / bounds.width) * chart.width;
  const nearestPoint = chartPoints.value.reduce((nearest, point) =>
    Math.abs(point.x - mouseX) < Math.abs(nearest.x - mouseX) ? point : nearest,
  );
  hoveredPoint.value = nearestPoint;
  emit("hover-point", nearestPoint);
};

const onMouseLeave = () => {
  hoveredPoint.value = null;
  emit("hover-point", null);
};

const tooltipX = computed(() => {
  if (!hoveredPoint.value) {
    return 0;
  }

  return Math.min(Math.max(hoveredPoint.value.x - 30, 1), chart.width - 61);
});
</script>

<template>
  <NCard
    class="elevation-profile-overlay"
    title="海拔剖面"
    size="small"
    data-testid="elevation-profile-chart"
  >
    <svg
      class="elevation-profile-svg"
      :viewBox="`0 0 ${chart.width} ${chart.height}`"
      role="img"
      aria-label="路线海拔剖面折线图"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
    >
      <path
        v-if="elevationRange"
        class="elevation-profile-area"
        data-testid="elevation-profile-area"
        :d="areaPath"
      />
      <g v-for="tick in contourTicks" :key="tick.y">
        <line
          class="chart-grid-line"
          data-testid="elevation-contour-line"
          :x1="chart.left"
          :x2="chart.right"
          :y1="tick.y"
          :y2="tick.y"
        />
        <text
          v-if="tick.elevation !== null"
          class="chart-label chart-elevation-label"
          x="22"
          :y="tick.y + 3"
        >
          {{ Math.round(tick.elevation) }} m
        </text>
      </g>
      <line class="chart-axis-line" :x1="chart.left" :x2="chart.right" :y1="chart.bottom" :y2="chart.bottom" />
      <polyline
        v-if="elevationRange"
        class="elevation-profile-line"
        data-testid="elevation-profile-line"
        :points="linePoints"
      />
      <g v-if="hoveredPoint" data-testid="elevation-profile-tooltip">
        <line
          class="chart-hover-line"
          :x1="hoveredPoint.x"
          :x2="hoveredPoint.x"
          :y1="chart.top"
          :y2="chart.bottom"
        />
        <circle class="chart-hover-point" :cx="hoveredPoint.x" :cy="hoveredPoint.y" r="3" />
        <rect class="chart-tooltip-bg" :x="tooltipX" y="0" width="60" height="33" rx="3" />
        <text class="chart-tooltip-text" :x="tooltipX + 4" y="8">
          距离：{{ formatDistance(hoveredPoint.distanceM) }}
        </text>
        <text class="chart-tooltip-text" :x="tooltipX + 4" y="18">
          海拔：{{ Math.round(hoveredPoint.ele) }} m
        </text>
        <text class="chart-tooltip-text" :x="tooltipX + 4" y="28">
          坡度：{{ formatGrade(hoveredPoint.gradePercent) }}
        </text>
      </g>
      <text v-if="elevationRange" class="chart-label" :x="chart.left" y="69">0 km</text>
      <text v-if="elevationRange" class="chart-label chart-label-end" :x="chart.right" y="69">
        {{ formatDistance(maxDistanceM) }}
      </text>
      <text v-else class="chart-empty-label" :x="chart.width / 2" y="34">
        暂无海拔数据
      </text>
    </svg>
  </NCard>
</template>

<style scoped>
.elevation-profile-svg {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  min-width: 0;
  overflow: hidden;
  touch-action: pan-y;
}

.chart-grid-line {
  stroke: #dbe7e1;
  stroke-dasharray: 4 4;
  vector-effect: non-scaling-stroke;
}

.chart-axis-line {
  stroke: #94a3b8;
  vector-effect: non-scaling-stroke;
}

.elevation-profile-area {
  fill: #e5e7eb;
  fill-opacity: 0.72;
}

.elevation-profile-line {
  fill: none;
  stroke: #fc4c02;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}

.chart-label {
  fill: #64748b;
  font-size: 5px;
}

.chart-label-end {
  text-anchor: end;
}

.chart-elevation-label {
  text-anchor: end;
}

.chart-hover-line {
  stroke: #0f766e;
  stroke-dasharray: 2 2;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.chart-hover-point {
  fill: #ffffff;
  stroke: #fc4c02;
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}

.chart-tooltip-bg {
  fill: rgba(15, 23, 42, 0.88);
}

.chart-tooltip-text {
  fill: #ffffff;
  font-size: 4.5px;
}

.chart-empty-label {
  fill: #94a3b8;
  font-size: 5px;
  text-anchor: middle;
}

@media (max-width: 960px) {
  .chart-label,
  .chart-empty-label {
    font-size: 8px;
  }

  .chart-tooltip-text {
    font-size: 7px;
  }
}
</style>
