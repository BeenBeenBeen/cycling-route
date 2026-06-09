<script setup lang="ts">
defineProps<{
  gpxPath: string;
  gpxUrl: string;
  loading: boolean;
}>();
</script>

<template>
  <section class="gpx-panel">
    <h2>GPX 路书</h2>
    <a
      data-testid="download-gpx"
      :href="gpxUrl || undefined"
      :aria-disabled="!gpxUrl || loading ? 'true' : 'false'"
      :class="{ disabled: !gpxUrl || loading }"
      download
    >
      {{ loading ? "生成中" : "下载 GPX" }}
    </a>
    <p v-if="gpxPath">路径：{{ gpxPath }}</p>
    <p v-else>尚未生成 GPX</p>
  </section>
</template>
