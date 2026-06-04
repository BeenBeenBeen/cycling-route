<script setup lang="ts">
const emit = defineEmits<{
  search: [payload: { startQuery: string; endQuery: string }];
}>();

const form = {
  startQuery: "",
  endQuery: "",
};

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
  <section class="route-planner">
    <h2>路线规划</h2>
    <div class="field-grid">
      <label>
        起点
        <input data-testid="start-query" v-model="form.startQuery" />
      </label>
      <label>
        终点
        <input data-testid="end-query" v-model="form.endQuery" />
      </label>
    </div>
    <button data-testid="search-places" type="button" @click="onSearch">
      查询候选地点
    </button>
  </section>
</template>
