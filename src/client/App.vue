<script setup lang="ts">
import { computed, ref } from "vue";
import {
  assistPublish,
  generateCover,
  generatePost,
  saveMarkdown,
  PublishingApiError,
  type GeneratedPost,
  type RouteInput,
} from "./api/publishingApi";
import CoverPreview from "./components/CoverPreview.vue";
import GeneratedPostEditor from "./components/GeneratedPostEditor.vue";
import RouteForm from "./components/RouteForm.vue";
import WorkflowActions from "./components/WorkflowActions.vue";

type LoadingAction = "" | "generatePost" | "generateCover" | "saveMarkdown" | "assistPublish";
type RouteFormHandle = {
  getRoute: () => RouteInput;
};

const routeForm = ref<RouteFormHandle | null>(null);
const route = ref<RouteInput | null>(null);
const generatedPost = ref<GeneratedPost | null>(null);
const selectedTitle = ref("");
const coverPath = ref("");
const markdownPath = ref("");
const loadingAction = ref<LoadingAction>("");
const errorMessage = ref("");
const errorDetail = ref("");
const publishStarted = ref(false);

const hasPost = computed(() => generatedPost.value !== null);
const hasCover = computed(() => coverPath.value !== "");

const setError = (error: unknown) => {
  if (error instanceof PublishingApiError) {
    errorMessage.value = error.message;
    errorDetail.value = error.detail ?? "";
    return;
  }

  errorMessage.value = error instanceof Error ? error.message : "请求失败";
  errorDetail.value = "";
};

const runAction = async (action: LoadingAction, work: () => Promise<void>) => {
  loadingAction.value = action;
  errorMessage.value = "";
  errorDetail.value = "";
  try {
    await work();
  } catch (error) {
    setError(error);
  } finally {
    loadingAction.value = "";
  }
};

const currentRoute = () => {
  const value = routeForm.value?.getRoute();
  if (!value) {
    throw new Error("路线表单不可用");
  }
  route.value = value;
  return value;
};

const onGeneratePost = () =>
  runAction("generatePost", async () => {
    const result = await generatePost(currentRoute());
    generatedPost.value = result.post;
    selectedTitle.value = result.post.titleCandidates[0] ?? "";
    coverPath.value = "";
    markdownPath.value = "";
    publishStarted.value = false;
  });

const onGenerateCover = () =>
  runAction("generateCover", async () => {
    if (!generatedPost.value) {
      throw new Error("缺少生成内容");
    }
    const baseRoute = route.value ?? currentRoute();
    const result = await generateCover({
      route: baseRoute,
      imagePrompt: generatedPost.value.imagePrompt,
      coverTitle: generatedPost.value.coverTitle,
      coverSubtitle: generatedPost.value.coverSubtitle,
    });
    coverPath.value = result.coverPath;
  });

const onSaveMarkdown = () =>
  runAction("saveMarkdown", async () => {
    if (!generatedPost.value) {
      throw new Error("缺少生成内容");
    }
    const result = await saveMarkdown({
      route: route.value ?? currentRoute(),
      post: generatedPost.value,
      selectedTitle: selectedTitle.value,
      coverPath: coverPath.value || undefined,
    });
    markdownPath.value = result.markdownPath;
  });

const onAssistPublish = () =>
  runAction("assistPublish", async () => {
    if (!generatedPost.value || !coverPath.value) {
      throw new Error("缺少发布内容");
    }
    await assistPublish({
      title: selectedTitle.value,
      body: generatedPost.value.body,
      hashtags: generatedPost.value.hashtags,
      coverPath: coverPath.value,
    });
    publishStarted.value = true;
  });
</script>

<template>
  <main class="workspace">
    <header class="topbar">
      <div>
        <h1>成都骑行路线发布工具</h1>
        <p>{{ loadingAction ? "请求进行中" : "就绪" }}</p>
      </div>
    </header>

    <section v-if="errorMessage" class="error-banner">
      <strong>{{ errorMessage }}</strong>
      <pre v-if="errorDetail">{{ errorDetail }}</pre>
    </section>

    <div class="layout">
      <section class="main-column">
        <RouteForm ref="routeForm" @submit-route="route = $event" />
        <GeneratedPostEditor
          v-model:post="generatedPost"
          v-model:selected-title="selectedTitle"
        />
      </section>
      <aside class="side-column">
        <CoverPreview
          :cover-path="coverPath"
          :loading="loadingAction === 'generateCover'"
          :error="loadingAction ? '' : errorDetail"
        />
        <WorkflowActions
          :loading-action="loadingAction"
          :has-post="hasPost"
          :has-cover="hasCover"
          :markdown-path="markdownPath"
          :publish-started="publishStarted"
          @generate-post="onGeneratePost"
          @generate-cover="onGenerateCover"
          @save-markdown="onSaveMarkdown"
          @assist-publish="onAssistPublish"
        />
      </aside>
    </div>
  </main>
</template>

<style>
:root {
  color: #1f2933;
  background: #f4f6f8;
  font-family: Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
}

body {
  margin: 0;
}

button,
input,
textarea {
  font: inherit;
}

button {
  min-height: 40px;
  border: 1px solid #d9480f;
  border-radius: 6px;
  background: #e8590c;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  border-color: #c9cfd6;
  background: #c9cfd6;
  cursor: not-allowed;
}

input,
textarea {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #c9cfd6;
  border-radius: 6px;
  background: #fff;
  color: #1f2933;
  padding: 9px 10px;
}

textarea {
  min-height: 96px;
  resize: vertical;
}

label {
  display: grid;
  gap: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.workspace {
  min-height: 100vh;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #d8dee6;
  background: #fff;
}

.topbar h1 {
  margin: 0;
  font-size: 22px;
}

.topbar p {
  margin: 4px 0 0;
  color: #697586;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px;
}

.main-column,
.side-column {
  display: grid;
  align-content: start;
  gap: 16px;
}

.form-section,
.editor-panel,
.cover-panel,
.actions-panel,
.error-banner {
  border: 1px solid #d8dee6;
  border-radius: 8px;
  background: #fff;
  padding: 16px;
}

.form-section + .form-section {
  margin-top: 12px;
}

.form-section h2,
.editor-panel h2,
.cover-panel h2,
.actions-panel h2 {
  margin: 0 0 12px;
  font-size: 16px;
}

.field-grid,
.editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field-grid.three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.wide {
  grid-column: 1 / -1;
}

.hidden-submit {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.empty-panel,
.cover-state {
  display: grid;
  place-items: center;
  min-height: 120px;
  color: #697586;
  background: #f4f6f8;
  border-radius: 6px;
}

.title-options {
  display: grid;
  grid-column: 1 / -1;
  gap: 8px;
  margin: 0;
  border: 1px solid #d8dee6;
  border-radius: 6px;
  padding: 12px;
}

.title-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.title-options input {
  width: auto;
}

.cover-frame {
  display: grid;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 8px;
  background: #eef2f6;
}

.cover-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.actions-panel {
  display: grid;
  gap: 10px;
}

.status-stack {
  display: grid;
  gap: 6px;
  color: #334155;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.path-text {
  color: #697586;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.error-banner {
  max-width: 1440px;
  margin: 16px auto 0;
  color: #9b1c1c;
  background: #fff5f5;
}

.error-banner pre {
  margin: 8px 0 0;
  white-space: pre-wrap;
}

.error-text {
  color: #9b1c1c;
  font-size: 13px;
}

@media (max-width: 960px) {
  .layout,
  .field-grid,
  .field-grid.three,
  .editor-grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    order: -1;
  }
}
</style>
