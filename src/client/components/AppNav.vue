<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <nav class="app-nav" aria-label="主导航">
    <RouterLink data-testid="nav-route-planner" to="/route-planner" active-class="active">路线规划</RouterLink>
    <RouterLink data-testid="nav-publisher" to="/publisher" active-class="active">小红书发布</RouterLink>
  </nav>
</template>
