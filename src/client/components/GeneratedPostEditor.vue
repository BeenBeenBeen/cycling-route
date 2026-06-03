<script setup lang="ts">
import type { GeneratedPost } from "../api/publishingApi";

defineProps<{
  post: GeneratedPost | null;
  selectedTitle: string;
}>();

const emit = defineEmits<{
  "update:post": [post: GeneratedPost];
  "update:selectedTitle": [title: string];
}>();

const updateField = <K extends keyof GeneratedPost>(
  post: GeneratedPost,
  field: K,
  value: GeneratedPost[K],
) => {
  emit("update:post", { ...post, [field]: value });
};

const updateLines = (
  post: GeneratedPost,
  field: "hashtags" | "titleCandidates",
  value: string,
) => {
  updateField(
    post,
    field,
    value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
};
</script>

<template>
  <section class="editor-panel">
    <h2>生成内容</h2>
    <div v-if="!post" class="empty-panel">等待生成</div>
    <div v-else class="editor-grid">
      <fieldset class="title-options">
        <legend>标题候选</legend>
        <label v-for="title in post.titleCandidates" :key="title">
          <input
            type="radio"
            name="selectedTitle"
            :checked="selectedTitle === title"
            @change="emit('update:selectedTitle', title)"
          />
          {{ title }}
        </label>
      </fieldset>

      <label>
        正文
        <textarea :value="post.body" @input="updateField(post, 'body', ($event.target as HTMLTextAreaElement).value)" />
      </label>
      <label>
        攻略
        <textarea :value="post.guide" @input="updateField(post, 'guide', ($event.target as HTMLTextAreaElement).value)" />
      </label>
      <label>
        彩蛋
        <textarea :value="post.easterEgg" @input="updateField(post, 'easterEgg', ($event.target as HTMLTextAreaElement).value)" />
      </label>
      <label>
        话题标签
        <textarea :value="post.hashtags.join('\n')" @input="updateLines(post, 'hashtags', ($event.target as HTMLTextAreaElement).value)" />
      </label>
      <label>
        封面主标题
        <input :value="post.coverTitle" @input="updateField(post, 'coverTitle', ($event.target as HTMLInputElement).value)" />
      </label>
      <label>
        封面副标题
        <input :value="post.coverSubtitle" @input="updateField(post, 'coverSubtitle', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="wide">
        图片提示词
        <textarea :value="post.imagePrompt" @input="updateField(post, 'imagePrompt', ($event.target as HTMLTextAreaElement).value)" />
      </label>
    </div>
  </section>
</template>
