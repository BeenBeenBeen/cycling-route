<script setup lang="ts">
import { computed, ref } from "vue";
import {
  assistPublish,
  generateCover,
  generatePost,
  PublishingApiError,
  saveMarkdown,
  type GeneratedPost,
  type RouteInput,
} from "../api/publishingApi";
import CoverPreview from "../components/CoverPreview.vue";
import GeneratedPostEditor from "../components/GeneratedPostEditor.vue";
import GpxDownloadPanel from "../components/GpxDownloadPanel.vue";
import RouteForm from "../components/RouteForm.vue";
import WorkflowActions from "../components/WorkflowActions.vue";
import { readRoutePublishDraft } from "../stores/routePublishDraftStore";

type LoadingAction =
  | ""
  | "generatePost"
  | "generateCover"
  | "saveMarkdown"
  | "assistPublish";
type RouteFormHandle = {
  getRoute: () => RouteInput;
};

const draft = readRoutePublishDraft();
const routeForm = ref<RouteFormHandle | null>(null);
const route = ref<RouteInput | null>(draft?.routeFacts ?? null);
const gpxPath = ref(draft?.gpxPath ?? "");
const gpxUrl = ref(draft?.gpxUrl ?? "");
const generatedPost = ref<GeneratedPost | null>(null);
const selectedTitle = ref("");
const coverPath = ref("");
const coverUrl = ref("");
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
    coverUrl.value = "";
    markdownPath.value = "";
    publishStarted.value = false;
  });

const onGenerateCover = () =>
  runAction("generateCover", async () => {
    if (!generatedPost.value) {
      throw new Error("缺少生成内容");
    }

    const result = await generateCover({
      route: currentRoute(),
      imagePrompt: generatedPost.value.imagePrompt,
      coverTitle: generatedPost.value.coverTitle,
      coverSubtitle: generatedPost.value.coverSubtitle,
    });
    coverPath.value = result.coverPath;
    coverUrl.value = result.coverUrl;
  });

const onSaveMarkdown = () =>
  runAction("saveMarkdown", async () => {
    if (!generatedPost.value) {
      throw new Error("缺少生成内容");
    }

    const result = await saveMarkdown({
      route: currentRoute(),
      post: generatedPost.value,
      selectedTitle: selectedTitle.value,
      coverPath: coverPath.value || undefined,
      gpxPath: gpxPath.value || undefined,
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
  <section class="publisher-view" data-testid="publisher-view">
    <section v-if="errorMessage" class="error-banner">
      <strong>{{ errorMessage }}</strong>
      <pre v-if="errorDetail">{{ errorDetail }}</pre>
    </section>

    <section v-if="!route" class="empty-panel publisher-empty">
      尚未接收路线规划结果，可手工填写路线信息后生成发布内容
    </section>

    <div class="layout publisher-layout">
      <section class="main-column">
        <RouteForm
          ref="routeForm"
          :initial-route="route"
          @submit-route="route = $event"
        />
        <GeneratedPostEditor
          v-model:post="generatedPost"
          v-model:selected-title="selectedTitle"
        />
      </section>
      <aside class="side-column">
        <GpxDownloadPanel
          :gpx-path="gpxPath"
          :gpx-url="gpxUrl"
          :loading="false"
        />
        <CoverPreview
          :cover-path="coverUrl"
          :loading="loadingAction === 'generateCover'"
          :error="loadingAction ? '' : errorDetail"
        />
        <WorkflowActions
          :loading-action="loadingAction"
          :has-post="hasPost"
          :has-cover="hasCover"
          :can-generate-route="false"
          :has-route="false"
          markdown-path=""
          :publish-started="publishStarted"
          :show-route-actions="false"
          @generate-post="onGeneratePost"
          @generate-cover="onGenerateCover"
          @save-markdown="onSaveMarkdown"
          @assist-publish="onAssistPublish"
        />
        <section v-if="markdownPath" class="status-stack markdown-status">
          Markdown：{{ markdownPath }}
        </section>
      </aside>
    </div>
  </section>
</template>
