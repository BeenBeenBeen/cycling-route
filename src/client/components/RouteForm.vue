<script setup lang="ts">
import { reactive, watch } from "vue";
import { NCard, NForm, NFormItem, NGi, NGrid, NInput, NInputNumber } from "naive-ui";
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
  distanceKm: null as number | null,
  elevationGainM: null as number | null,
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
  form.distanceKm = route.distanceKm;
  form.elevationGainM = route.elevationGainM;
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
  <NForm class="route-form" :model="form" label-placement="top" @submit.prevent="onSubmit">
    <NCard title="基础路线" size="small">
      <NGrid cols="1 s:2 m:3" :x-gap="12" responsive="screen">
        <NGi>
          <NFormItem label="路线名称" path="routeName">
            <NInput v-model:value="form.routeName" :input-props="{ name: 'routeName' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="起点" path="startPoint">
            <NInput v-model:value="form.startPoint" :input-props="{ name: 'startPoint' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="终点或折返点" path="endPoint">
            <NInput v-model:value="form.endPoint" :input-props="{ name: 'endPoint' }" />
          </NFormItem>
        </NGi>
      </NGrid>
    </NCard>

    <NCard title="数据指标" size="small">
      <NGrid cols="1 s:2 m:4" :x-gap="12" responsive="screen">
        <NGi>
          <NFormItem label="总里程 km" path="distanceKm">
            <NInputNumber v-model:value="form.distanceKm" :min="0.1" :step="0.1" :input-props="{ name: 'distanceKm' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="累计爬升 m" path="elevationGainM">
            <NInputNumber v-model:value="form.elevationGainM" :min="0" :step="1" :input-props="{ name: 'elevationGainM' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="难度" path="difficulty">
            <NInput v-model:value="form.difficulty" :input-props="{ name: 'difficulty' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="路况类型" path="roadType">
            <NInput v-model:value="form.roadType" :input-props="{ name: 'roadType' }" />
          </NFormItem>
        </NGi>
      </NGrid>
    </NCard>

    <NCard title="必填内容" size="small">
      <NGrid cols="1 s:2 m:3" :x-gap="12" responsive="screen">
        <NGi>
          <NFormItem label="路线亮点" path="highlights">
            <NInput v-model:value="form.highlights" type="textarea" :autosize="{ minRows: 3 }" :input-props="{ name: 'highlights' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="风险提醒" path="warnings">
            <NInput v-model:value="form.warnings" type="textarea" :autosize="{ minRows: 3 }" :input-props="{ name: 'warnings' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="补给点" path="supplyPoints">
            <NInput v-model:value="form.supplyPoints" type="textarea" :autosize="{ minRows: 3 }" :input-props="{ name: 'supplyPoints' }" />
          </NFormItem>
        </NGi>
      </NGrid>
    </NCard>

    <NCard title="推荐信息" size="small">
      <NGrid cols="1 s:2 m:3" :x-gap="12" responsive="screen">
        <NGi>
          <NFormItem label="推荐季节" path="bestSeason">
            <NInput v-model:value="form.bestSeason" :input-props="{ name: 'bestSeason' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="推荐出发时间" path="bestStartTime">
            <NInput v-model:value="form.bestStartTime" :input-props="{ name: 'bestStartTime' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="适合人群" path="targetRiders">
            <NInput v-model:value="form.targetRiders" :input-props="{ name: 'targetRiders' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="交通建议" path="transportation">
            <NInput v-model:value="form.transportation" :input-props="{ name: 'transportation' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="预计耗时" path="estimatedDuration">
            <NInput v-model:value="form.estimatedDuration" :input-props="{ name: 'estimatedDuration' }" />
          </NFormItem>
        </NGi>
      </NGrid>
    </NCard>

    <NCard title="补充内容" size="small">
      <NGrid cols="1 s:2" :x-gap="12" responsive="screen">
        <NGi>
          <NFormItem label="拍照点" path="photoSpots">
            <NInput v-model:value="form.photoSpots" type="textarea" :autosize="{ minRows: 3 }" :input-props="{ name: 'photoSpots' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="美食推荐" path="foodRecommendations">
            <NInput v-model:value="form.foodRecommendations" type="textarea" :autosize="{ minRows: 3 }" :input-props="{ name: 'foodRecommendations' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="用户指定话题标签" path="userHashtags">
            <NInput v-model:value="form.userHashtags" type="textarea" :autosize="{ minRows: 3 }" :input-props="{ name: 'userHashtags' }" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="其他补充说明" path="extraNotes">
            <NInput v-model:value="form.extraNotes" type="textarea" :autosize="{ minRows: 3 }" :input-props="{ name: 'extraNotes' }" />
          </NFormItem>
        </NGi>
      </NGrid>
    </NCard>
  </NForm>
</template>
