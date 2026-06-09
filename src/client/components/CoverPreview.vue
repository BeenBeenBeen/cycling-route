<script setup lang="ts">
import { NAlert, NCard, NEmpty, NImage, NSpin, NText } from "naive-ui";

defineProps<{
  coverPath: string;
  loading: boolean;
  error?: string;
}>();
</script>

<template>
  <NCard title="封面预览" size="small">
    <div class="cover-frame">
      <NSpin v-if="loading" description="生成中" />
      <NImage v-else-if="coverPath" :src="coverPath" alt="封面海报" object-fit="cover" />
      <NEmpty v-else description="尚未生成封面" />
    </div>
    <NText v-if="coverPath" depth="3">{{ coverPath }}</NText>
    <NAlert v-if="error" type="error" :show-icon="false">
      {{ error }}
    </NAlert>
  </NCard>
</template>
