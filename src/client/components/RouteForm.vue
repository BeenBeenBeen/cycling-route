<script setup lang="ts">
import { reactive, watch } from "vue";
import type { RouteInput } from "../api/publishingApi";

const props = defineProps<{
  initialRoute?: RouteInput | null;
}>();

const emit = defineEmits<{
  "submit-route": [route: RouteInput];
}>();

const form = reactive({
  routeName: "",
  startPoint: "",
  endPoint: "",
  distanceKm: "",
  elevationGainM: "",
  difficulty: "",
  roadType: "",
  highlights: "",
  warnings: "",
  supplyPoints: "",
  bestSeason: "",
  bestStartTime: "",
  targetRiders: "",
  transportation: "",
  estimatedDuration: "",
  photoSpots: "",
  foodRecommendations: "",
  userHashtags: "",
  extraNotes: "",
});

const lines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const optionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const optionalLines = (value: string) => {
  const items = lines(value);
  return items.length === 0 ? undefined : items;
};

const applyRoute = (route: RouteInput) => {
  form.routeName = route.routeName;
  form.startPoint = route.startPoint;
  form.endPoint = route.endPoint;
  form.distanceKm = String(route.distanceKm);
  form.elevationGainM = String(route.elevationGainM);
  form.difficulty = route.difficulty;
  form.roadType = route.roadType;
  form.highlights = route.highlights.join("\n");
  form.warnings = route.warnings.join("\n");
  form.supplyPoints = route.supplyPoints.join("\n");
  form.bestSeason = route.bestSeason ?? "";
  form.bestStartTime = route.bestStartTime ?? "";
  form.targetRiders = route.targetRiders ?? "";
  form.transportation = route.transportation ?? "";
  form.estimatedDuration = route.estimatedDuration ?? "";
  form.photoSpots = route.photoSpots?.join("\n") ?? "";
  form.foodRecommendations = route.foodRecommendations?.join("\n") ?? "";
  form.userHashtags = route.userHashtags?.join("\n") ?? "";
  form.extraNotes = route.extraNotes ?? "";
};

watch(
  () => props.initialRoute,
  (nextRoute) => {
    if (nextRoute) {
      applyRoute(nextRoute);
    }
  },
  { immediate: true },
);

const buildRoute = (): RouteInput => ({
    routeName: form.routeName.trim(),
    startPoint: form.startPoint.trim(),
    endPoint: form.endPoint.trim(),
    distanceKm: Number(form.distanceKm),
    elevationGainM: Number(form.elevationGainM),
    difficulty: form.difficulty.trim(),
    roadType: form.roadType.trim(),
    highlights: lines(form.highlights),
    warnings: lines(form.warnings),
    supplyPoints: lines(form.supplyPoints),
    bestSeason: optionalText(form.bestSeason),
    bestStartTime: optionalText(form.bestStartTime),
    targetRiders: optionalText(form.targetRiders),
    transportation: optionalText(form.transportation),
    estimatedDuration: optionalText(form.estimatedDuration),
    photoSpots: optionalLines(form.photoSpots),
    foodRecommendations: optionalLines(form.foodRecommendations),
    userHashtags: optionalLines(form.userHashtags),
    extraNotes: optionalText(form.extraNotes),
  });

const onSubmit = () => {
  emit("submit-route", buildRoute());
};

defineExpose({ getRoute: buildRoute });
</script>

<template>
  <form class="route-form" @submit.prevent="onSubmit">
    <section class="form-section">
      <h2>基础路线</h2>
      <div class="field-grid">
        <label>
          路线名称
          <input name="routeName" v-model="form.routeName" required />
        </label>
        <label>
          起点
          <input name="startPoint" v-model="form.startPoint" required />
        </label>
        <label>
          终点或折返点
          <input name="endPoint" v-model="form.endPoint" required />
        </label>
      </div>
    </section>

    <section class="form-section">
      <h2>数据指标</h2>
      <div class="field-grid">
        <label>
          总里程 km
          <input name="distanceKm" v-model="form.distanceKm" type="number" min="0.1" step="0.1" required />
        </label>
        <label>
          累计爬升 m
          <input name="elevationGainM" v-model="form.elevationGainM" type="number" min="0" step="1" required />
        </label>
        <label>
          难度
          <input name="difficulty" v-model="form.difficulty" required />
        </label>
        <label>
          路况类型
          <input name="roadType" v-model="form.roadType" required />
        </label>
      </div>
    </section>

    <section class="form-section">
      <h2>必填内容</h2>
      <div class="field-grid three">
        <label>
          路线亮点
          <textarea name="highlights" v-model="form.highlights" required />
        </label>
        <label>
          风险提醒
          <textarea name="warnings" v-model="form.warnings" required />
        </label>
        <label>
          补给点
          <textarea name="supplyPoints" v-model="form.supplyPoints" required />
        </label>
      </div>
    </section>

    <section class="form-section">
      <h2>推荐信息</h2>
      <div class="field-grid">
        <label>
          推荐季节
          <input name="bestSeason" v-model="form.bestSeason" />
        </label>
        <label>
          推荐出发时间
          <input name="bestStartTime" v-model="form.bestStartTime" />
        </label>
        <label>
          适合人群
          <input name="targetRiders" v-model="form.targetRiders" />
        </label>
        <label>
          交通建议
          <input name="transportation" v-model="form.transportation" />
        </label>
        <label>
          预计耗时
          <input name="estimatedDuration" v-model="form.estimatedDuration" />
        </label>
      </div>
    </section>

    <section class="form-section">
      <h2>补充内容</h2>
      <div class="field-grid">
        <label>
          拍照点
          <textarea name="photoSpots" v-model="form.photoSpots" />
        </label>
        <label>
          美食推荐
          <textarea name="foodRecommendations" v-model="form.foodRecommendations" />
        </label>
        <label>
          用户指定话题标签
          <textarea name="userHashtags" v-model="form.userHashtags" />
        </label>
        <label>
          其他补充说明
          <textarea name="extraNotes" v-model="form.extraNotes" />
        </label>
      </div>
    </section>

    <button class="hidden-submit" type="submit">提交路线</button>
  </form>
</template>
