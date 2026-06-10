<script setup lang="ts">
import { NButton, NCard, NSpace, NText } from "naive-ui";

defineProps<{
  gpxPath: string;
  gpxUrl: string;
  loading: boolean;
  canGenerate: boolean;
}>();

const emit = defineEmits<{
  generate: [];
}>();
</script>

<template>
  <NCard title="GPX 路书" size="small">
    <NSpace vertical>
      <NButton
        data-testid="generate-gpx"
        block
        :loading="loading"
        :disabled="!canGenerate || loading"
        @click="emit('generate')"
      >
        {{ loading ? "生成 GPX 中" : "生成 GPX 路书" }}
      </NButton>
      <NButton
        data-testid="download-gpx"
        tag="a"
        :href="gpxUrl || undefined"
        :aria-disabled="!gpxUrl || loading ? 'true' : 'false'"
        :disabled="!gpxUrl || loading"
        type="primary"
        block
        download
      >
        下载 GPX
      </NButton>
      <NText v-if="gpxPath" depth="3">路径：{{ gpxPath }}</NText>
      <NText v-else depth="3">尚未生成 GPX</NText>
    </NSpace>
  </NCard>
</template>
