<script setup lang="ts">
import { reactive, watch } from "vue";
import { NButton, NCard, NForm, NFormItem, NGrid, NGi } from "naive-ui";
import type { PlaceCandidate } from "../api/publishingApi";
import PlaceCandidateInput from "./PlaceCandidateInput.vue";

const props = defineProps<{
  initialStartQuery: string;
  initialEndQuery: string;
  startCandidates: PlaceCandidate[];
  endCandidates: PlaceCandidate[];
  selectedStart: PlaceCandidate | null;
  selectedEnd: PlaceCandidate | null;
  loading: boolean;
  canGenerateRoute: boolean;
}>();

const emit = defineEmits<{
  "update:start-query": [query: string];
  "update:end-query": [query: string];
  search: [payload: { startQuery: string; endQuery: string }];
  "select-start": [candidate: PlaceCandidate | null];
  "select-end": [candidate: PlaceCandidate | null];
  "generate-route": [];
}>();

const form = reactive({
  startQuery: props.initialStartQuery,
  endQuery: props.initialEndQuery,
});

watch(
  () => props.initialStartQuery,
  (query) => {
    form.startQuery = query;
  },
);

watch(
  () => props.initialEndQuery,
  (query) => {
    form.endQuery = query;
  },
);

let lastSearchKey = "";

const onSearch = () => {
  const startQuery = form.startQuery.trim();
  const endQuery = form.endQuery.trim();
  if (!startQuery || !endQuery) {
    return;
  }

  const searchKey = `${startQuery}\n${endQuery}`;
  if (searchKey === lastSearchKey) {
    return;
  }

  lastSearchKey = searchKey;
  emit("search", { startQuery, endQuery });
};

const updateStartQuery = (query: string) => {
  form.startQuery = query;
  emit("update:start-query", query);
  if (props.selectedStart && query !== props.selectedStart.name) {
    emit("select-start", null);
  }
};

const updateEndQuery = (query: string) => {
  form.endQuery = query;
  emit("update:end-query", query);
  if (props.selectedEnd && query !== props.selectedEnd.name) {
    emit("select-end", null);
  }
};
</script>

<template>
  <NCard title="路线规划" size="small">
    <NForm class="route-planner-form" :model="form" label-placement="top">
      <NGrid data-testid="route-planner-fields" :cols="1" :y-gap="8" responsive="screen">
        <NGi>
          <NFormItem label="起点" path="startQuery">
            <PlaceCandidateInput
              :query="form.startQuery"
              :candidates="startCandidates"
              :selected-candidate="selectedStart"
              placeholder="输入起点"
              test-id-prefix="start"
              :loading="loading"
              @update:query="updateStartQuery"
              @blur="onSearch"
              @select="emit('select-start', $event)"
            />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="终点" path="endQuery">
            <PlaceCandidateInput
              :query="form.endQuery"
              :candidates="endCandidates"
              :selected-candidate="selectedEnd"
              placeholder="输入终点"
              test-id-prefix="end"
              :loading="loading"
              @update:query="updateEndQuery"
              @blur="onSearch"
              @select="emit('select-end', $event)"
            />
          </NFormItem>
        </NGi>
      </NGrid>
      <NButton
        data-testid="generate-route"
        type="primary"
        block
        :loading="loading"
        :disabled="!canGenerateRoute || loading"
        @click="emit('generate-route')"
      >
        {{ loading ? "生成路线中" : "生成骑行路线" }}
      </NButton>
    </NForm>
  </NCard>
</template>

<style scoped>
.route-planner-form {
  display: grid;
  gap: 12px;
}
</style>
