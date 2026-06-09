<script setup lang="ts">
import { computed, h } from "vue";
import { NMenu, type MenuOption } from "naive-ui";
import { useRoute } from "vue-router";
import { RouterLink } from "vue-router";

const route = useRoute();

const activeKey = computed(() => route.path);

const navOptions: MenuOption[] = [
  {
    key: "/route-planner",
    label: () =>
      h(
        RouterLink,
        {
          "data-testid": "nav-route-planner",
          to: "/route-planner",
          activeClass: "active",
        },
        { default: () => "路线规划" },
      ),
  },
  {
    key: "/publisher",
    label: () =>
      h(
        RouterLink,
        {
          "data-testid": "nav-publisher",
          to: "/publisher",
          activeClass: "active",
        },
        { default: () => "小红书发布" },
      ),
  },
];
</script>

<template>
  <nav class="app-nav" aria-label="主导航">
    <NMenu
      mode="horizontal"
      :value="activeKey"
      :options="navOptions"
      responsive
    />
  </nav>
</template>
