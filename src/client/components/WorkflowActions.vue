<script setup lang="ts">
defineProps<{
  loadingAction: string;
  hasPost: boolean;
  hasCover: boolean;
  markdownPath: string;
  publishStarted: boolean;
}>();

const emit = defineEmits<{
  generatePost: [];
  generateCover: [];
  saveMarkdown: [];
  assistPublish: [];
}>();

const busyLabel: Record<string, string> = {
  generatePost: "生成中",
  generateCover: "生成封面中",
  saveMarkdown: "保存中",
  assistPublish: "启动中",
};
</script>

<template>
  <section class="actions-panel">
    <h2>流程操作</h2>
    <button :disabled="!!loadingAction" @click="emit('generatePost')">
      {{ loadingAction === "generatePost" ? busyLabel.generatePost : "AI 生成" }}
    </button>
    <button :disabled="!hasPost || !!loadingAction" @click="emit('generateCover')">
      {{ loadingAction === "generateCover" ? busyLabel.generateCover : "生成封面海报" }}
    </button>
    <button :disabled="!hasPost || !!loadingAction" @click="emit('saveMarkdown')">
      {{ loadingAction === "saveMarkdown" ? busyLabel.saveMarkdown : "保存 Markdown" }}
    </button>
    <button :disabled="!hasPost || !hasCover || !!loadingAction" @click="emit('assistPublish')">
      {{ loadingAction === "assistPublish" ? busyLabel.assistPublish : "辅助发布" }}
    </button>
    <div class="status-stack">
      <p v-if="markdownPath">Markdown：{{ markdownPath }}</p>
      <p v-if="publishStarted">发布辅助已启动</p>
    </div>
  </section>
</template>
