<script setup lang="ts">
import { reactive } from "vue";
import { NButton, NCard, NForm, NFormItem, NGrid, NGi, NInput } from "naive-ui";

const emit = defineEmits<{
  search: [payload: { startQuery: string; endQuery: string }];
}>();

const form = reactive({
  startQuery: "",
  endQuery: "",
});

const onSearch = () => {
  const startQuery = form.startQuery.trim();
  const endQuery = form.endQuery.trim();
  if (!startQuery || !endQuery) {
    return;
  }

  emit("search", { startQuery, endQuery });
};
</script>

<template>
  <NCard title="路线规划" size="small">
    <NForm :model="form" label-placement="top" @submit.prevent="onSearch">
      <NGrid :cols="2" :x-gap="12" responsive="screen">
        <NGi>
          <NFormItem label="起点" path="startQuery">
            <NInput
              v-model:value="form.startQuery"
              :input-props="{ 'data-testid': 'start-query' }"
              placeholder="输入起点"
            />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="终点" path="endQuery">
            <NInput
              v-model:value="form.endQuery"
              :input-props="{ 'data-testid': 'end-query' }"
              placeholder="输入终点"
            />
          </NFormItem>
        </NGi>
      </NGrid>
      <NButton data-testid="search-places" type="primary" attr-type="submit" block>
        查询候选地点
      </NButton>
    </NForm>
  </NCard>
</template>
