<script setup lang="ts">
defineProps<{
  coverPath: string;
  loading: boolean;
  error?: string;
}>();
</script>

<template>
  <section class="cover-panel">
    <h2>封面预览</h2>
    <div class="cover-frame">
      <div v-if="loading" class="cover-state">生成中</div>
      <img v-else-if="coverPath" :src="coverPath" alt="封面海报" />
      <div v-else class="cover-state">尚未生成封面</div>
    </div>
    <p v-if="coverPath" class="path-text">{{ coverPath }}</p>
    <p v-if="error" class="error-text">{{ error }}</p>
  </section>
</template>
