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
              :data-testid="`start-candidate-${candidate.id}`"
              :type="selectedStart?.id === candidate.id ? 'primary' : 'default'"
              block
              @click="emit('select-start', candidate)"
            >
              {{ labelFor(candidate) }}
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
              :data-testid="`end-candidate-${candidate.id}`"
              :type="selectedEnd?.id === candidate.id ? 'primary' : 'default'"
              block
              @click="emit('select-end', candidate)"
            >
              {{ labelFor(candidate) }}
            </NButton>
          </NListItem>
        </NList>
        <NEmpty v-else description="暂无终点候选" size="small" />
      </NGi>
    </NGrid>
  </NCard>
</template>
