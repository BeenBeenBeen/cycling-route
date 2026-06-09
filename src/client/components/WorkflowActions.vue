<script setup lang="ts">
import { NButton, NCard, NSpace, NText } from "naive-ui";

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
  <NCard title="流程操作" size="small">
    <NSpace vertical>
      <NButton v-if="showRouteActions" data-testid="generate-route" type="primary" block :disabled="!canGenerateRoute || !!loadingAction" @click="emit('generateRoute')">
        {{ loadingAction === "generateRoute" ? busyLabel.generateRoute : "生成骑行路线" }}
      </NButton>
      <NButton v-if="showRouteActions" data-testid="generate-gpx" block :disabled="!hasRoute || !!loadingAction" @click="emit('generateGpx')">
        {{ loadingAction === "generateGpx" ? busyLabel.generateGpx : "生成 GPX 路书" }}
      </NButton>
      <NButton v-if="showRouteActions" data-testid="send-to-publisher" type="primary" ghost block :disabled="!canSendToPublisher || !!loadingAction" @click="emit('sendToPublisher')">
        发送到小红书发布
      </NButton>
      <NButton v-if="showPublishActions" data-testid="generate-post" type="primary" block :disabled="!!loadingAction" @click="emit('generatePost')">
        {{ loadingAction === "generatePost" ? busyLabel.generatePost : "AI 生成" }}
      </NButton>
      <NButton v-if="showPublishActions" data-testid="generate-cover" block :disabled="!hasPost || !!loadingAction" @click="emit('generateCover')">
        {{ loadingAction === "generateCover" ? busyLabel.generateCover : "生成封面海报" }}
      </NButton>
      <NButton v-if="showPublishActions" data-testid="save-markdown" block :disabled="!hasPost || !!loadingAction" @click="emit('saveMarkdown')">
        {{ loadingAction === "saveMarkdown" ? busyLabel.saveMarkdown : "保存 Markdown" }}
      </NButton>
      <NButton v-if="showPublishActions" data-testid="assist-publish" block :disabled="!hasPost || !hasCover || !!loadingAction" @click="emit('assistPublish')">
        {{ loadingAction === "assistPublish" ? busyLabel.assistPublish : "辅助发布" }}
      </NButton>
      <NText v-if="markdownPath" depth="3">Markdown：{{ markdownPath }}</NText>
      <NText v-if="publishStarted" type="success">发布辅助已启动</NText>
    </NSpace>
  </NCard>
</template>
