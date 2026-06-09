<script setup lang="ts">
import {
  NConfigProvider,
  NDialogProvider,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NLoadingBarProvider,
  NMessageProvider,
  NNotificationProvider,
} from "naive-ui";
import { RouterView } from "vue-router";
import AppNav from "./components/AppNav.vue";
import { naiveThemeOverrides } from "./naiveTheme";
</script>

<template>
  <NConfigProvider :theme-overrides="naiveThemeOverrides">
    <NLoadingBarProvider>
      <NDialogProvider>
        <NNotificationProvider placement="top-right">
          <NMessageProvider>
            <NLayout class="workspace">
              <NLayoutHeader bordered class="topbar">
                <div>
                  <h1>成都骑行路线发布工具</h1>
                  <p>路线规划与小红书发布工作台</p>
                </div>
                <AppNav />
              </NLayoutHeader>
              <NLayoutContent>
                <RouterView />
              </NLayoutContent>
            </NLayout>
          </NMessageProvider>
        </NNotificationProvider>
      </NDialogProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>

<style>
:root {
  color: #14213d;
  background: #f3f7f5;
  font-family: Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
}

body {
  margin: 0;
}

.workspace {
  min-height: 100vh;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  background: linear-gradient(90deg, #ffffff 0%, #f3faf7 100%);
}

.topbar h1 {
  margin: 0;
  font-size: 22px;
}

.topbar p {
  margin: 4px 0 0;
  color: #64748b;
}

.app-nav {
  min-width: 240px;
}

.route-planner-view {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 16px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
}

.route-planner-map-stage {
  min-height: calc(100vh - 112px);
}

.route-planner-map-stage .route-map,
.route-planner-map-stage .map-shell,
.route-planner-map-stage .map-empty {
  height: 100%;
  min-height: calc(100vh - 112px);
}

.route-planner-panel {
  display: grid;
  align-content: start;
  gap: 12px;
  max-height: calc(100vh - 112px);
  overflow: auto;
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

.route-map,
.error-banner {
  border-radius: 8px;
  overflow: hidden;
}

.cover-frame {
  display: grid;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 8px;
  background: #e8f2ee;
}

.cover-frame .n-image,
.cover-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.route-form,
.candidate-list,
.publisher-layout .n-card,
.route-planner-panel > .n-card {
  display: grid;
  gap: 12px;
}

.map-shell,
.map-empty {
  position: relative;
  min-height: 180px;
  border: 1px solid #dbe7e1;
  border-radius: 6px;
  background: #e8f2ee;
  overflow: hidden;
}

.map-state {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 1;
  max-width: min(360px, calc(100% - 32px));
  border: 1px solid #dbe7e1;
  border-radius: 6px;
  background: rgba(248, 251, 249, 0.94);
  color: #334155;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 700;
}

.route-map {
  position: relative;
  padding: 0;
}

.route-map > .map-shell {
  border: 0;
  border-radius: 8px;
}

.route-map-overlay {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 2;
  width: min(420px, calc(100% - 32px));
  border: 1px solid #dbe7e1;
  border-radius: 8px;
  background: rgba(248, 251, 249, 0.95);
  box-shadow: 0 14px 34px rgba(15, 118, 110, 0.14);
  padding: 14px;
}

.publisher-empty,
.markdown-status {
  max-width: 1440px;
  margin: 16px auto 0;
  padding: 16px;
}

.status-stack {
  display: grid;
  gap: 6px;
  color: #334155;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.path-text {
  color: #64748b;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.error-banner {
  max-width: 1440px;
  margin: 16px auto 0;
  color: #991b1b;
  background: #fff7ed;
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
  .topbar {
    display: grid;
    gap: 12px;
  }

  .route-planner-view {
    grid-template-columns: 1fr;
  }

  .route-planner-map-stage,
  .route-planner-map-stage .route-map,
  .route-planner-map-stage .map-shell,
  .route-planner-map-stage .map-empty {
    min-height: 360px;
  }

  .route-planner-panel {
    max-height: none;
    overflow: visible;
  }

  .layout {
    grid-template-columns: 1fr;
  }

  .side-column {
    order: -1;
  }
}
</style>
