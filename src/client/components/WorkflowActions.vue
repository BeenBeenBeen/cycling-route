<script setup lang="ts">
withDefaults(defineProps<{
  loadingAction: string;
  hasPost: boolean;
  hasCover: boolean;
  canGenerateRoute: boolean;
  hasRoute: boolean;
  canSendToPublisher?: boolean;
  markdownPath: string;
  publishStarted: boolean;
  showRouteActions?: boolean;
  showPublishActions?: boolean;
}>(), {
  canSendToPublisher: false,
  showRouteActions: true,
  showPublishActions: true,
});

const emit = defineEmits<{
  generateRoute: [];
  generateGpx: [];
  sendToPublisher: [];
  generatePost: [];
  generateCover: [];
  saveMarkdown: [];
  assistPublish: [];
}>();

const busyLabel: Record<string, string> = {
  generateRoute: "生成路线中",
  generateGpx: "生成 GPX 中",
  generatePost: "生成中",
  generateCover: "生成封面中",
  saveMarkdown: "保存中",
  assistPublish: "启动中",
};
</script>

<template>
  <section class="actions-panel">
    <h2>流程操作</h2>
    <button v-if="showRouteActions" data-testid="generate-route" :disabled="!canGenerateRoute || !!loadingAction" @click="emit('generateRoute')">
      {{ loadingAction === "generateRoute" ? busyLabel.generateRoute : "生成骑行路线" }}
    </button>
    <button v-if="showRouteActions" data-testid="generate-gpx" :disabled="!hasRoute || !!loadingAction" @click="emit('generateGpx')">
      {{ loadingAction === "generateGpx" ? busyLabel.generateGpx : "生成 GPX 路书" }}
    </button>
    <button v-if="showRouteActions" data-testid="send-to-publisher" :disabled="!canSendToPublisher || !!loadingAction" @click="emit('sendToPublisher')">
      发送到小红书发布
    </button>
    <button v-if="showPublishActions" data-testid="generate-post" :disabled="!!loadingAction" @click="emit('generatePost')">
      {{ loadingAction === "generatePost" ? busyLabel.generatePost : "AI 生成" }}
    </button>
    <button v-if="showPublishActions" data-testid="generate-cover" :disabled="!hasPost || !!loadingAction" @click="emit('generateCover')">
      {{ loadingAction === "generateCover" ? busyLabel.generateCover : "生成封面海报" }}
    </button>
    <button v-if="showPublishActions" data-testid="save-markdown" :disabled="!hasPost || !!loadingAction" @click="emit('saveMarkdown')">
      {{ loadingAction === "saveMarkdown" ? busyLabel.saveMarkdown : "保存 Markdown" }}
    </button>
    <button v-if="showPublishActions" data-testid="assist-publish" :disabled="!hasPost || !hasCover || !!loadingAction" @click="emit('assistPublish')">
      {{ loadingAction === "assistPublish" ? busyLabel.assistPublish : "辅助发布" }}
    </button>
    <div class="status-stack">
      <p v-if="markdownPath">Markdown：{{ markdownPath }}</p>
      <p v-if="publishStarted">发布辅助已启动</p>
    </div>
  </section>
</template>
