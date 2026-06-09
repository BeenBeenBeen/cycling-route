<script setup lang="ts">
import { NButton, NCard, NText } from "naive-ui";

defineProps<{
  gpxPath: string;
  gpxUrl: string;
  loading: boolean;
}>();
</script>

<template>
  <NCard title="GPX 路书" size="small">
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
      {{ loading ? "生成中" : "下载 GPX" }}
    </NButton>
    <NText v-if="gpxPath" depth="3">路径：{{ gpxPath }}</NText>
    <NText v-else depth="3">尚未生成 GPX</NText>
  </NCard>
</template>
