<script setup lang="ts">
import {
  NCard,
  NEmpty,
  NFormItem,
  NGi,
  NGrid,
  NInput,
  NRadio,
  NRadioGroup,
} from "naive-ui";
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
  <NCard title="生成内容" size="small">
    <NEmpty v-if="!post" description="等待生成" />
    <NGrid v-else :cols="2" :x-gap="12" :y-gap="12" responsive="screen">
      <NGi :span="2">
        <NFormItem label="标题候选">
          <NRadioGroup
            :value="selectedTitle"
            name="selectedTitle"
            @update:value="(title) => emit('update:selectedTitle', String(title))"
          >
            <NRadio v-for="title in post.titleCandidates" :key="title" :value="title">
              {{ title }}
            </NRadio>
          </NRadioGroup>
        </NFormItem>
      </NGi>

      <NGi>
        <NFormItem label="正文">
          <NInput :value="post.body" type="textarea" :autosize="{ minRows: 5 }" @update:value="(value) => updateField(post, 'body', value)" />
        </NFormItem>
      </NGi>
      <NGi>
        <NFormItem label="攻略">
          <NInput :value="post.guide" type="textarea" :autosize="{ minRows: 5 }" @update:value="(value) => updateField(post, 'guide', value)" />
        </NFormItem>
      </NGi>
      <NGi>
        <NFormItem label="彩蛋">
          <NInput :value="post.easterEgg" type="textarea" :autosize="{ minRows: 4 }" @update:value="(value) => updateField(post, 'easterEgg', value)" />
        </NFormItem>
      </NGi>
      <NGi>
        <NFormItem label="话题标签">
          <NInput :value="post.hashtags.join('\n')" type="textarea" :autosize="{ minRows: 4 }" @update:value="(value) => updateLines(post, 'hashtags', value)" />
        </NFormItem>
      </NGi>
      <NGi>
        <NFormItem label="封面主标题">
          <NInput :value="post.coverTitle" @update:value="(value) => updateField(post, 'coverTitle', value)" />
        </NFormItem>
      </NGi>
      <NGi>
        <NFormItem label="封面副标题">
          <NInput :value="post.coverSubtitle" @update:value="(value) => updateField(post, 'coverSubtitle', value)" />
        </NFormItem>
      </NGi>
      <NGi :span="2">
        <NFormItem label="图片提示词">
          <NInput :value="post.imagePrompt" type="textarea" :autosize="{ minRows: 4 }" @update:value="(value) => updateField(post, 'imagePrompt', value)" />
        </NFormItem>
      </NGi>
    </NGrid>
  </NCard>
</template>
