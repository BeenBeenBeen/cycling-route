<script setup lang="ts">
import { ref, watch } from "vue";
import { NButton, NInput, NSpin } from "naive-ui";
import type { PlaceCandidate } from "../api/publishingApi";

const props = defineProps<{
  query: string;
  candidates: PlaceCandidate[];
  selectedCandidate: PlaceCandidate | null;
  placeholder: string;
  testIdPrefix: "start" | "end";
  loading: boolean;
}>();

const emit = defineEmits<{
  "update:query": [query: string];
  blur: [];
  select: [candidate: PlaceCandidate];
}>();

const dropdownOpen = ref(false);

const labelFor = (candidate: PlaceCandidate) =>
  [candidate.name, candidate.district, candidate.address].filter(Boolean).join(" · ");

const onFocus = () => {
  dropdownOpen.value = props.candidates.length > 0;
};

const onBlur = () => {
  emit("blur");
};

const onSelect = (candidate: PlaceCandidate) => {
  emit("update:query", candidate.name);
  emit("select", candidate);
  dropdownOpen.value = false;
};

watch(
  () => props.candidates,
  (candidates) => {
    dropdownOpen.value = candidates.length > 0;
  },
  { immediate: true },
);
</script>

<template>
  <div class="place-candidate-input">
    <NInput
      :value="query"
      :input-props="{ 'data-testid': `${testIdPrefix}-query` }"
      :placeholder="placeholder"
      @update:value="emit('update:query', $event)"
      @focus="onFocus"
      @blur="onBlur"
    >
      <template #suffix>
        <NSpin
          v-if="loading"
          :data-testid="`${testIdPrefix}-query-loading`"
          :size="16"
          aria-label="请求处理中"
        />
      </template>
    </NInput>
    <div
      v-if="dropdownOpen && candidates.length"
      class="place-candidate-dropdown place-candidate-dropdown--flow"
      :data-testid="`${testIdPrefix}-candidate-dropdown`"
    >
      <NButton
        v-for="candidate in candidates"
        :key="candidate.id"
        class="place-candidate-option"
        :data-testid="`${testIdPrefix}-candidate-${candidate.id}`"
        :type="selectedCandidate?.id === candidate.id ? 'primary' : 'default'"
        block
        @mousedown.prevent
        @click="onSelect(candidate)"
      >
        <span class="place-candidate-label">{{ labelFor(candidate) }}</span>
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.place-candidate-input {
  width: 100%;
}

.place-candidate-dropdown {
  display: grid;
  gap: 4px;
  width: 100%;
  max-height: 240px;
  overflow: auto;
  box-sizing: border-box;
  margin-top: 4px;
  padding: 6px;
  border: 1px solid #dbe7e1;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
}

.place-candidate-option {
  height: auto;
  min-height: 36px;
  white-space: normal;
}

.place-candidate-option :deep(.n-button__content) {
  min-width: 0;
  width: 100%;
  white-space: normal;
}

.place-candidate-label {
  display: block;
  width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  text-align: left;
  white-space: normal;
}
</style>
