<script setup lang="ts">
import {
  NConfigProvider,
  NDialogProvider,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NLoadingBarProvider,
  NMessageProvider,
} from "naive-ui";
import { RouterView } from "vue-router";
import AppNav from "./components/AppNav.vue";
import { naiveThemeOverrides } from "./naiveTheme";
</script>

<template>
  <NConfigProvider :theme-overrides="naiveThemeOverrides">
    <NLoadingBarProvider>
      <NDialogProvider>
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
      </NDialogProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
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

.workspace {
  min-height: 100vh;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
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

.form-section,
.editor-panel,
.cover-panel,
.actions-panel,
.route-planner,
.candidate-selector,
.route-map,
.gpx-panel,
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
.actions-panel h2,
.route-planner h2,
.candidate-selector h2,
.route-map h2,
.gpx-panel h2 {
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

.candidate-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.candidate-columns > div {
  display: grid;
  align-content: start;
  gap: 8px;
}

.candidate-columns h3 {
  margin: 0;
  font-size: 14px;
}

.candidate-columns button.selected {
  border-color: #2f9e44;
  background: #2f9e44;
}

.map-shell,
.map-empty {
  position: relative;
  min-height: 180px;
  border: 1px solid #d8dee6;
  border-radius: 6px;
  background: #eef2f6;
  overflow: hidden;
}

.map-state {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 1;
  max-width: min(360px, calc(100% - 32px));
  border: 1px solid #d8dee6;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.92);
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
  border: 1px solid #d8dee6;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  padding: 14px;
}

.route-map-overlay > strong {
  display: block;
  margin-bottom: 10px;
  color: #1f2933;
  font-size: 16px;
}

.route-map-overlay-empty p {
  margin: 0;
  color: #697586;
  font-size: 13px;
}

.route-facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 12px 0 0;
}

.route-facts div {
  display: grid;
  gap: 4px;
}

.route-facts dt {
  color: #697586;
  font-size: 12px;
}

.route-facts dd {
  margin: 0;
  font-weight: 700;
}

.gpx-panel {
  display: grid;
  gap: 8px;
}

.gpx-panel a {
  display: inline-grid;
  place-items: center;
  min-height: 40px;
  border: 1px solid #d9480f;
  border-radius: 6px;
  background: #e8590c;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
}

.gpx-panel a.disabled {
  border-color: #c9cfd6;
  background: #c9cfd6;
  pointer-events: none;
}

.route-summary-bar {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  border: 1px solid #d8dee6;
  border-radius: 8px;
  background: #fff;
  padding: 14px;
}

.route-summary-bar div {
  display: grid;
  gap: 4px;
}

.route-summary-bar span {
  color: #697586;
  font-size: 12px;
  font-weight: 700;
}

.route-summary-bar strong,
.route-summary-bar a {
  color: #1f2933;
  font-size: 14px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.publisher-empty,
.markdown-status {
  max-width: 1440px;
  margin: 16px auto 0;
  border: 1px solid #d8dee6;
  background: #fff;
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
