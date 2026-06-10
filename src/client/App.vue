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
              <NLayoutContent class="workspace-content" data-testid="workspace-content">
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

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  max-width: 100%;
}

body {
  margin: 0;
  overflow: hidden;
  overflow-x: hidden;
}

.workspace {
  height: 100dvh;
}

.workspace > .n-layout-scroll-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.workspace-content {
  flex: 1;
  min-height: 0;
}

.workspace-content > .n-layout-scroll-container {
  height: 100%;
}

.topbar {
  flex: 0 0 auto;
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
  box-sizing: border-box;
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
}

.route-planner-map-stage {
  min-height: 0;
}

.route-planner-map-stage .route-map,
.route-planner-map-stage .map-empty {
  height: 100%;
  min-height: 0;
}

.route-planner-panel {
  display: grid;
  align-content: start;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow: auto;
  scrollbar-width: none;
}

.route-planner-panel::-webkit-scrollbar {
  display: none;
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
  min-width: 0;
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
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 12px;
  padding: 0;
}

.route-map-canvas-stage {
  position: relative;
  min-height: 0;
}

.route-map-canvas-stage > .map-shell {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 8px;
}

.route-map-overlay,
.elevation-profile-overlay {
  border: 1px solid #dbe7e1;
  border-radius: 8px;
  background: rgba(248, 251, 249, 0.95);
  box-shadow: 0 14px 34px rgba(15, 118, 110, 0.14);
  padding: 14px;
  pointer-events: auto;
}

.route-map-overlay {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 2;
  width: min(420px, calc(100% - 32px));
}

.elevation-profile-overlay {
  box-sizing: border-box;
  width: 100%;
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
  html,
  body,
  #app {
    height: auto;
    min-height: 100%;
  }

  body {
    overflow: auto;
  }

  .workspace {
    height: auto;
    min-height: 100dvh;
  }

  .workspace > .n-layout-scroll-container {
    display: block;
    overflow: visible;
  }

  .workspace-content > .n-layout-scroll-container {
    height: auto;
  }

  .topbar {
    display: grid;
    gap: 12px;
    padding: 14px 16px;
  }

  .app-nav {
    width: 100%;
    min-width: 0;
  }

  .app-nav .n-menu,
  .app-nav .v-overflow {
    width: 100%;
  }

  .app-nav .n-menu-item {
    flex: 1 1 50%;
  }

  .app-nav .n-menu-item-content-header {
    width: 100%;
    text-align: center;
  }

  .route-planner-view {
    grid-template-columns: 1fr;
    height: auto;
    padding: 12px;
  }

  .route-planner-map-stage {
    order: 2;
    min-height: 520px;
  }

  .route-planner-panel {
    display: contents;
  }

  .route-planner-form-section {
    order: 1;
  }

  .route-planner-summary-section {
    order: 3;
  }

  .route-planner-gpx-section {
    order: 4;
  }

  .layout {
    grid-template-columns: 1fr;
    padding: 12px;
  }

  .side-column {
    order: initial;
  }
}

@media (max-width: 640px) {
  .topbar {
    gap: 8px;
    padding: 10px 12px;
  }

  .topbar h1 {
    font-size: 18px;
    line-height: 1.3;
  }

  .topbar p {
    margin-top: 2px;
    font-size: 12px;
  }

  .app-nav .n-menu-item-content {
    padding: 0 10px !important;
  }

  .app-nav .n-menu-item-content-header {
    overflow: visible !important;
    text-overflow: clip !important;
  }

  .route-planner-view,
  .layout {
    gap: 8px;
    padding: 8px;
  }

  .main-column,
  .side-column {
    gap: 8px;
  }

  .route-planner-map-stage,
  .route-planner-map-stage .route-map,
  .route-planner-map-stage .map-empty {
    min-height: 0;
  }

  .route-map {
    gap: 8px;
    overflow: visible;
  }

  .route-map-canvas-stage {
    display: grid;
    gap: 8px;
  }

  .route-map-canvas-stage > .map-shell {
    height: 300px;
  }

  .route-map-overlay {
    position: static;
    width: 100%;
  }

  .route-map-overlay,
  .elevation-profile-overlay {
    padding: 10px;
    box-shadow: 0 8px 22px rgba(15, 118, 110, 0.12);
  }

  .map-state {
    left: 8px;
    bottom: 8px;
    max-width: calc(100% - 16px);
    padding: 8px 10px;
    font-size: 12px;
  }

  .route-planner-view .n-button,
  .publisher-view .n-button {
    min-height: 40px;
  }

  .route-planner-view .n-statistic-value__content {
    font-size: 18px;
  }

  .distance-metrics-detail div {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .cover-frame {
    max-height: 70vh;
  }

  .publisher-empty,
  .markdown-status {
    margin-top: 8px;
    padding: 8px;
  }

  .publisher-layout .n-card,
  .route-planner-view .n-card {
    min-width: 0;
  }
}
</style>
