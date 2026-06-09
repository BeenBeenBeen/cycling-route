<script setup lang="ts">
import { NButton, NCard, NEmpty, NGi, NGrid, NList, NListItem, NTag } from "naive-ui";
import type { PlaceCandidate } from "../api/publishingApi";

defineProps<{
  startCandidates: PlaceCandidate[];
  endCandidates: PlaceCandidate[];
  selectedStart: PlaceCandidate | null;
  selectedEnd: PlaceCandidate | null;
}>();

const emit = defineEmits<{
  "select-start": [candidate: PlaceCandidate];
  "select-end": [candidate: PlaceCandidate];
}>();

const labelFor = (candidate: PlaceCandidate) =>
  [candidate.name, candidate.district, candidate.address].filter(Boolean).join(" · ");
</script>

<template>
  <NCard title="候选地点" size="small">
    <NGrid :cols="2" :x-gap="12" responsive="screen">
      <NGi>
        <NTag type="info" size="small">起点</NTag>
        <NList v-if="startCandidates.length" class="candidate-list" bordered>
          <NListItem v-for="candidate in startCandidates" :key="candidate.id">
            <NButton
              class="candidate-button"
              :data-testid="`start-candidate-${candidate.id}`"
              :type="selectedStart?.id === candidate.id ? 'primary' : 'default'"
              block
              @click="emit('select-start', candidate)"
            >
              <span class="candidate-label">{{ labelFor(candidate) }}</span>
            </NButton>
          </NListItem>
        </NList>
        <NEmpty v-else description="暂无起点候选" size="small" />
      </NGi>
      <NGi>
        <NTag type="success" size="small">终点</NTag>
        <NList v-if="endCandidates.length" class="candidate-list" bordered>
          <NListItem v-for="candidate in endCandidates" :key="candidate.id">
            <NButton
              class="candidate-button"
              :data-testid="`end-candidate-${candidate.id}`"
              :type="selectedEnd?.id === candidate.id ? 'primary' : 'default'"
              block
              @click="emit('select-end', candidate)"
            >
              <span class="candidate-label">{{ labelFor(candidate) }}</span>
            </NButton>
          </NListItem>
        </NList>
        <NEmpty v-else description="暂无终点候选" size="small" />
      </NGi>
    </NGrid>
  </NCard>
</template>

<style scoped>
.candidate-list {
  min-width: 0;
}

.candidate-button {
  min-width: 0;
  height: auto;
  min-height: 38px;
  white-space: normal;
}

.candidate-button :deep(.n-button__content) {
  min-width: 0;
  width: 100%;
  white-space: normal;
}

.candidate-label {
  display: block;
  width: 100%;
  min-width: 0;
  font-size: clamp(11px, 1.9vw, 14px);
  line-height: 1.35;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
  text-align: left;
}
</style>
