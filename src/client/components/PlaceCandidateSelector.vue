<script setup lang="ts">
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
  <section class="candidate-selector">
    <h2>候选地点</h2>
    <div class="candidate-columns">
      <div>
        <h3>起点</h3>
        <button
          v-for="candidate in startCandidates"
          :key="candidate.id"
          type="button"
          :data-testid="`start-candidate-${candidate.id}`"
          :class="{ selected: selectedStart?.id === candidate.id }"
          @click="emit('select-start', candidate)"
        >
          {{ labelFor(candidate) }}
        </button>
      </div>
      <div>
        <h3>终点</h3>
        <button
          v-for="candidate in endCandidates"
          :key="candidate.id"
          type="button"
          :data-testid="`end-candidate-${candidate.id}`"
          :class="{ selected: selectedEnd?.id === candidate.id }"
          @click="emit('select-end', candidate)"
        >
          {{ labelFor(candidate) }}
        </button>
      </div>
    </div>
  </section>
</template>
