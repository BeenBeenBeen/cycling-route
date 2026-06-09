# V2 Split Route Planner And Publisher Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split the V2.0 frontend into a route-planning map workspace and a Xiaohongshu publishing workspace, connected by an explicit `RoutePublishDraft` handoff.

**Architecture:** Keep backend APIs and domain use cases unchanged. Move frontend orchestration out of the current single `App.vue` into route-scoped views: `RoutePlannerView` owns route search/planning/GPX, `PublisherView` owns route facts, post generation, cover generation, Markdown save, and publish assist. Use `vue-router` for navigation and a small `routePublishDraftStore` wrapper around `localStorage` for cross-view handoff.

**Tech Stack:** Vue 3, Vite, TypeScript, Vue Test Utils, Vitest, vue-router, existing Express APIs.

---

## Context

Read these documents before implementation:

- `docs/requirements-v2.md`
- `docs/architecture-redesign-v2.0.md`

Current frontend state:

- `src/client/App.vue` currently owns all workflow state and renders route planning, map, GPX, route form, generated post editor, cover preview, and workflow actions in one page.
- There is no `vue-router` dependency yet.
- Existing reusable components should be preserved where possible:
  - `RoutePlannerForm.vue`
  - `PlaceCandidateSelector.vue`
  - `RouteMap.vue`
  - `GpxDownloadPanel.vue`
  - `RouteForm.vue`
  - `GeneratedPostEditor.vue`
  - `CoverPreview.vue`
  - `WorkflowActions.vue`

Implementation constraints:

- Do not change backend API contracts for this UI split.
- Do not store API keys, cookies, auth headers, or Xiaohongshu credentials in `localStorage`.
- Use TDD for behavior changes.
- Keep commits small and scoped.

---

### Task 1: Add Vue Router And Top Navigation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/client/router.ts`
- Create: `src/client/components/AppNav.vue`
- Modify: `src/client/main.ts`
- Modify: `src/client/App.vue`
- Test: `tests/client/AppNav.test.ts`
- Test: `tests/client/router.test.ts`
- Test: `tests/client/App.test.ts`

**Step 1: Install routing dependency**

Run:

```bash
npm install vue-router@^4
```

Expected: `package.json` and `package-lock.json` include `vue-router`.

**Step 2: Write failing AppNav test**

Create `tests/client/AppNav.test.ts`:

```ts
// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";
import AppNav from "../../src/client/components/AppNav.vue";

const mountWithRoute = async (path: string) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/route-planner", component: { template: "<div />" } },
      { path: "/publisher", component: { template: "<div />" } },
    ],
  });
  router.push(path);
  await router.isReady();

  return mount(AppNav, {
    global: {
      plugins: [router],
    },
  });
};

describe("AppNav", () => {
  it("renders route planner and publisher links", async () => {
    const wrapper = await mountWithRoute("/route-planner");

    expect(wrapper.text()).toContain("路线规划");
    expect(wrapper.text()).toContain("小红书发布");
    expect(wrapper.get('[data-testid="nav-route-planner"]').attributes("href")).toBe("/route-planner");
    expect(wrapper.get('[data-testid="nav-publisher"]').attributes("href")).toBe("/publisher");
  });

  it("marks the active route", async () => {
    const wrapper = await mountWithRoute("/publisher");

    expect(wrapper.get('[data-testid="nav-publisher"]').classes()).toContain("active");
  });
});
```

**Step 3: Run test to verify it fails**

Run:

```bash
npm test -- tests/client/AppNav.test.ts
```

Expected: FAIL because `AppNav.vue` does not exist.

**Step 4: Create `AppNav.vue`**

Create `src/client/components/AppNav.vue`:

```vue
<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <nav class="app-nav" aria-label="主导航">
    <RouterLink data-testid="nav-route-planner" to="/route-planner">路线规划</RouterLink>
    <RouterLink data-testid="nav-publisher" to="/publisher">小红书发布</RouterLink>
  </nav>
</template>
```

**Step 5: Write failing router test**

Create `tests/client/router.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { routes } from "../../src/client/router";

describe("client router", () => {
  it("defines route planner, publisher, and default redirect", () => {
    expect(routes.map((route) => route.path)).toEqual(["/", "/route-planner", "/publisher"]);
    expect(routes[0]).toMatchObject({ path: "/", redirect: "/route-planner" });
  });
});
```

**Step 6: Run test to verify it fails**

Run:

```bash
npm test -- tests/client/router.test.ts
```

Expected: FAIL because `router.ts` does not exist.

**Step 7: Create router and wire main**

Create `src/client/router.ts`:

```ts
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const RoutePlannerView = () => import("./views/RoutePlannerView.vue");
const PublisherView = () => import("./views/PublisherView.vue");

export const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/route-planner" },
  { path: "/route-planner", component: RoutePlannerView },
  { path: "/publisher", component: PublisherView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
```

Modify `src/client/main.ts`:

```ts
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";

createApp(App).use(router).mount("#app");
```

Temporarily create minimal view placeholders:

```vue
<!-- src/client/views/RoutePlannerView.vue -->
<template>
  <section data-testid="route-planner-view">路线规划</section>
</template>
```

```vue
<!-- src/client/views/PublisherView.vue -->
<template>
  <section data-testid="publisher-view">小红书发布</section>
</template>
```

Modify `src/client/App.vue` to only render nav and router outlet:

```vue
<script setup lang="ts">
import { RouterView } from "vue-router";
import AppNav from "./components/AppNav.vue";
</script>

<template>
  <main class="workspace">
    <header class="topbar">
      <div>
        <h1>成都骑行路线发布工具</h1>
        <p>路线规划与小红书发布工作台</p>
      </div>
      <AppNav />
    </header>
    <RouterView />
  </main>
</template>
```

Keep global CSS in `App.vue` for now. Do not move all CSS in this task.

**Step 8: Update App smoke test**

Replace the old workflow-heavy `tests/client/App.test.ts` with a routing smoke test:

```ts
// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";
import App from "../../src/client/App.vue";
import { routes } from "../../src/client/router";

const mountApp = async (path = "/route-planner") => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  });
  router.push(path);
  await router.isReady();

  return mount(App, {
    global: {
      plugins: [router],
    },
  });
};

describe("App shell", () => {
  it("renders navigation and the selected route", async () => {
    const wrapper = await mountApp("/publisher");

    expect(wrapper.text()).toContain("路线规划");
    expect(wrapper.text()).toContain("小红书发布");
    expect(wrapper.find('[data-testid="publisher-view"]').exists()).toBe(true);
  });
});
```

**Step 9: Run tests**

Run:

```bash
npm test -- tests/client/AppNav.test.ts tests/client/router.test.ts tests/client/App.test.ts
```

Expected: PASS.

**Step 10: Commit**

```bash
git add package.json package-lock.json src/client/main.ts src/client/router.ts src/client/App.vue src/client/components/AppNav.vue src/client/views/RoutePlannerView.vue src/client/views/PublisherView.vue tests/client/AppNav.test.ts tests/client/router.test.ts tests/client/App.test.ts
git commit -m "feat: add split workspace navigation"
```

---

### Task 2: Add Route Publish Draft Store

**Files:**
- Create: `src/client/stores/routePublishDraftStore.ts`
- Test: `tests/client/routePublishDraftStore.test.ts`

**Step 1: Write failing store test**

Create `tests/client/routePublishDraftStore.test.ts`:

```ts
// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearRoutePublishDraft,
  readRoutePublishDraft,
  writeRoutePublishDraft,
  type RoutePublishDraft,
} from "../../src/client/stores/routePublishDraftStore";

const draft: RoutePublishDraft = {
  plannedRoute: {
    routeId: "route_1",
    routeName: "犀浦到青城山",
    start: { id: "B001", name: "犀浦", location: { gcj02: { lng: 104, lat: 30 } }, source: "amap" },
    end: { id: "B002", name: "青城山", location: { gcj02: { lng: 103, lat: 31 } }, source: "amap" },
    waypoints: [],
    distanceKm: 12.35,
    polylineGcj02: [{ lng: 104, lat: 30 }],
    polylineWgs84: [{ lng: 103.998, lat: 30.002 }],
    elevation: {
      status: "success",
      sampleIntervalM: 100,
      batchSize: 100,
      gainNoiseThresholdM: 3,
      points: [{ distanceM: 0, lng: 103.998, lat: 30.002, ele: 500 }],
      elevationGainM: 120,
    },
    routeFacts: {
      routeName: "犀浦到青城山",
      startPoint: "犀浦",
      endPoint: "青城山",
      distanceKm: 12.35,
      elevationGainM: 120,
      difficulty: "待确认",
      roadType: "待确认",
      highlights: ["待补充"],
      warnings: ["待补充"],
      supplyPoints: ["待补充"],
    },
  },
  routeFacts: {
    routeName: "犀浦到青城山",
    startPoint: "犀浦",
    endPoint: "青城山",
    distanceKm: 12.35,
    elevationGainM: 120,
    difficulty: "待确认",
    roadType: "待确认",
    highlights: ["待补充"],
    warnings: ["待补充"],
    supplyPoints: ["待补充"],
  },
  gpxPath: "data/routes/route-1.gpx",
  gpxUrl: "/media/routes/route-1.gpx",
  updatedAt: "2026-06-09T00:00:00.000Z",
};

describe("routePublishDraftStore", () => {
  beforeEach(() => localStorage.clear());

  it("writes and reads the latest route publish draft", () => {
    writeRoutePublishDraft(draft);

    expect(readRoutePublishDraft()).toEqual(draft);
  });

  it("returns null for missing or invalid drafts", () => {
    expect(readRoutePublishDraft()).toBeNull();

    localStorage.setItem("cycling-route.routePublishDraft", "{bad json");
    expect(readRoutePublishDraft()).toBeNull();
  });

  it("clears the draft", () => {
    writeRoutePublishDraft(draft);
    clearRoutePublishDraft();

    expect(readRoutePublishDraft()).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/client/routePublishDraftStore.test.ts
```

Expected: FAIL because the store does not exist.

**Step 3: Implement the store**

Create `src/client/stores/routePublishDraftStore.ts`:

```ts
import type { PlannedRoute, RouteInput } from "../api/publishingApi";

const storageKey = "cycling-route.routePublishDraft";

export type RoutePublishDraft = {
  plannedRoute: PlannedRoute;
  routeFacts: RouteInput;
  gpxPath?: string;
  gpxUrl?: string;
  updatedAt: string;
};

const isRoutePublishDraft = (value: unknown): value is RoutePublishDraft => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<RoutePublishDraft>;
  return Boolean(
    draft.plannedRoute &&
      draft.routeFacts &&
      typeof draft.updatedAt === "string",
  );
};

export const readRoutePublishDraft = (): RoutePublishDraft | null => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return isRoutePublishDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeRoutePublishDraft = (draft: RoutePublishDraft) => {
  localStorage.setItem(storageKey, JSON.stringify(draft));
};

export const clearRoutePublishDraft = () => {
  localStorage.removeItem(storageKey);
};
```

**Step 4: Run test**

Run:

```bash
npm test -- tests/client/routePublishDraftStore.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/client/stores/routePublishDraftStore.ts tests/client/routePublishDraftStore.test.ts
git commit -m "feat: add route publish draft store"
```

---

### Task 3: Add Route Summary Bar

**Files:**
- Create: `src/client/components/RouteSummaryBar.vue`
- Test: `tests/client/RouteSummaryBar.test.ts`

**Step 1: Write failing component test**

Create `tests/client/RouteSummaryBar.test.ts`:

```ts
// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import RouteSummaryBar from "../../src/client/components/RouteSummaryBar.vue";

const plannedRoute = {
  routeId: "route_1",
  routeName: "犀浦到青城山",
  distanceKm: 12.35,
  estimatedDurationMin: 61,
  elevation: {
    status: "success",
    elevationGainM: 120,
  },
};

describe("RouteSummaryBar", () => {
  it("renders empty route metrics before planning", () => {
    const wrapper = mount(RouteSummaryBar, {
      props: { plannedRoute: null, gpxPath: "", gpxUrl: "" },
    });

    expect(wrapper.text()).toContain("0 km");
    expect(wrapper.text()).toContain("0 m");
    expect(wrapper.text()).toContain("--");
  });

  it("renders route metrics and GPX status", () => {
    const wrapper = mount(RouteSummaryBar, {
      props: {
        plannedRoute,
        gpxPath: "data/routes/route-1.gpx",
        gpxUrl: "/media/routes/route-1.gpx",
      },
    });

    expect(wrapper.text()).toContain("12.35 km");
    expect(wrapper.text()).toContain("120 m");
    expect(wrapper.text()).toContain("61 分钟");
    expect(wrapper.get("a").attributes("href")).toBe("/media/routes/route-1.gpx");
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/client/RouteSummaryBar.test.ts
```

Expected: FAIL because `RouteSummaryBar.vue` does not exist.

**Step 3: Implement component**

Create `src/client/components/RouteSummaryBar.vue`:

```vue
<script setup lang="ts">
import type { PlannedRoute } from "../api/publishingApi";

defineProps<{
  plannedRoute: PlannedRoute | null;
  gpxPath: string;
  gpxUrl: string;
}>();
</script>

<template>
  <section class="route-summary-bar" data-testid="route-summary-bar">
    <div>
      <span>距离</span>
      <strong>{{ plannedRoute?.distanceKm ?? 0 }} km</strong>
    </div>
    <div>
      <span>累计爬升</span>
      <strong>{{ plannedRoute?.elevation.elevationGainM ?? 0 }} m</strong>
    </div>
    <div>
      <span>预计耗时</span>
      <strong>{{ plannedRoute?.estimatedDurationMin ? `${plannedRoute.estimatedDurationMin} 分钟` : "--" }}</strong>
    </div>
    <div>
      <span>GPX</span>
      <a v-if="gpxUrl" :href="gpxUrl" download>{{ gpxPath || "下载 GPX" }}</a>
      <strong v-else>未生成</strong>
    </div>
  </section>
</template>
```

**Step 4: Run test**

Run:

```bash
npm test -- tests/client/RouteSummaryBar.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/client/components/RouteSummaryBar.vue tests/client/RouteSummaryBar.test.ts
git commit -m "feat: add route summary bar"
```

---

### Task 4: Build Route Planner View

**Files:**
- Modify: `src/client/views/RoutePlannerView.vue`
- Modify: `src/client/components/WorkflowActions.vue`
- Test: `tests/client/RoutePlannerView.test.ts`

**Step 1: Write failing route planner test**

Create `tests/client/RoutePlannerView.test.ts`:

```ts
// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it, vi } from "vitest";
import RoutePlannerView from "../../src/client/views/RoutePlannerView.vue";
import { readRoutePublishDraft } from "../../src/client/stores/routePublishDraftStore";

const start = {
  id: "B001",
  name: "犀浦",
  location: { gcj02: { lng: 104.012, lat: 30.758 } },
  source: "amap",
};
const end = {
  id: "B002",
  name: "青城山",
  location: { gcj02: { lng: 103.568, lat: 30.905 } },
  source: "amap",
};
const routeFacts = {
  routeName: "犀浦到青城山",
  startPoint: "犀浦",
  endPoint: "青城山",
  distanceKm: 12.35,
  elevationGainM: 120,
  difficulty: "待确认",
  roadType: "待确认",
  highlights: ["待补充"],
  warnings: ["待补充"],
  supplyPoints: ["待补充"],
};
const plannedRoute = {
  routeId: "route_1",
  routeName: "犀浦到青城山",
  start,
  end,
  waypoints: [],
  distanceKm: 12.35,
  polylineGcj02: [start.location.gcj02],
  polylineWgs84: [{ lng: 104.01, lat: 30.756 }],
  elevation: {
    status: "success",
    sampleIntervalM: 100,
    batchSize: 100,
    gainNoiseThresholdM: 3,
    points: [{ distanceM: 0, lng: 104.01, lat: 30.756, ele: 500 }],
    elevationGainM: 120,
  },
  routeFacts,
};

const mountView = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/route-planner", component: RoutePlannerView },
      { path: "/publisher", component: { template: "<div data-testid='publisher-view' />" } },
    ],
  });
  router.push("/route-planner");
  await router.isReady();

  return {
    router,
    wrapper: mount(RoutePlannerView, {
      global: {
        plugins: [router],
      },
    }),
  };
};

describe("RoutePlannerView", () => {
  it("searches places, generates route and GPX, then sends draft to publisher", async () => {
    localStorage.clear();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ startCandidates: [start], endCandidates: [end] }) })
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ route: plannedRoute }) })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          gpxPath: "data/routes/route-1.gpx",
          gpxUrl: "/media/routes/route-1.gpx",
          stravaCompatible: true,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { router, wrapper } = await mountView();

    await wrapper.get('[data-testid="start-query"]').setValue("犀浦");
    await wrapper.get('[data-testid="end-query"]').setValue("青城山");
    await wrapper.get('[data-testid="search-places"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await wrapper.get('[data-testid="start-candidate-B001"]').trigger("click");
    await wrapper.get('[data-testid="end-candidate-B002"]').trigger("click");
    await wrapper.get('[data-testid="generate-route"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(wrapper.text()).toContain("12.35 km");

    await wrapper.get('[data-testid="generate-gpx"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    await wrapper.get('[data-testid="send-to-publisher"]').trigger("click");
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe("/publisher"));

    expect(readRoutePublishDraft()).toMatchObject({
      routeFacts,
      gpxPath: "data/routes/route-1.gpx",
      gpxUrl: "/media/routes/route-1.gpx",
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/client/RoutePlannerView.test.ts
```

Expected: FAIL because `RoutePlannerView` is still a placeholder.

**Step 3: Extend WorkflowActions for route planner handoff**

Modify `src/client/components/WorkflowActions.vue`:

- Add prop:

```ts
canSendToPublisher?: boolean;
```

- Add emit:

```ts
sendToPublisher: [];
```

- Add button after GPX button:

```vue
<button
  data-testid="send-to-publisher"
  :disabled="!canSendToPublisher || !!loadingAction"
  @click="emit('sendToPublisher')"
>
  发送到小红书发布
</button>
```

Ensure default usage does not break by treating `undefined` as false.

**Step 4: Implement RoutePlannerView**

Move route planning state and handlers from old `App.vue` into `src/client/views/RoutePlannerView.vue`.

Use these imports:

```ts
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import {
  generateGpx,
  generateRoute,
  PublishingApiError,
  type PlaceCandidate,
  type PlannedRoute,
  searchPlaces,
} from "../api/publishingApi";
import GpxDownloadPanel from "../components/GpxDownloadPanel.vue";
import PlaceCandidateSelector from "../components/PlaceCandidateSelector.vue";
import RouteMap from "../components/RouteMap.vue";
import RoutePlannerForm from "../components/RoutePlannerForm.vue";
import RouteSummaryBar from "../components/RouteSummaryBar.vue";
import WorkflowActions from "../components/WorkflowActions.vue";
import { writeRoutePublishDraft } from "../stores/routePublishDraftStore";
```

Important handler for handoff:

```ts
const onSendToPublisher = async () => {
  if (!plannedRoute.value) {
    throw new Error("请先生成骑行路线");
  }

  writeRoutePublishDraft({
    plannedRoute: plannedRoute.value,
    routeFacts: plannedRoute.value.routeFacts,
    gpxPath: gpxPath.value || undefined,
    gpxUrl: gpxUrl.value || undefined,
    updatedAt: new Date().toISOString(),
  });
  await router.push("/publisher");
};
```

Template shape:

```vue
<template>
  <section class="route-planner-view">
    <section v-if="errorMessage" class="error-banner">
      <strong>{{ errorMessage }}</strong>
      <pre v-if="errorDetail">{{ errorDetail }}</pre>
    </section>
    <RouteMap :planned-route="plannedRoute" />
    <aside class="route-planner-overlay">
      <RoutePlannerForm @search="onSearchPlaces" />
      <PlaceCandidateSelector ... />
    </aside>
    <RouteSummaryBar :planned-route="plannedRoute" :gpx-path="gpxPath" :gpx-url="gpxUrl" />
    <div class="route-planner-actions">
      <WorkflowActions
        :loading-action="loadingAction"
        :has-post="false"
        :has-cover="false"
        :can-generate-route="canGenerateRoute"
        :has-route="plannedRoute !== null"
        :can-send-to-publisher="plannedRoute !== null"
        markdown-path=""
        :publish-started="false"
        @generate-route="onGenerateRoute"
        @generate-gpx="onGenerateGpx"
        @send-to-publisher="onSendToPublisher"
      />
    </div>
  </section>
</template>
```

**Step 5: Run test**

Run:

```bash
npm test -- tests/client/RoutePlannerView.test.ts tests/client/WorkflowActions.test.ts tests/client/RouteSummaryBar.test.ts
```

Expected: PASS. If there is no `WorkflowActions.test.ts`, run only existing relevant tests plus `RoutePlannerView.test.ts`.

**Step 6: Commit**

```bash
git add src/client/views/RoutePlannerView.vue src/client/components/WorkflowActions.vue tests/client/RoutePlannerView.test.ts
git commit -m "feat: split route planner view"
```

---

### Task 5: Build Publisher View

**Files:**
- Modify: `src/client/views/PublisherView.vue`
- Test: `tests/client/PublisherView.test.ts`

**Step 1: Write failing publisher test**

Create `tests/client/PublisherView.test.ts`:

```ts
// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import PublisherView from "../../src/client/views/PublisherView.vue";
import { writeRoutePublishDraft } from "../../src/client/stores/routePublishDraftStore";

const post = {
  titleCandidates: ["标题一", "标题二", "标题三"],
  body: "正文",
  guide: "攻略",
  easterEgg: "彩蛋",
  hashtags: ["成都骑行", "路线攻略", "周末骑行"],
  coverTitle: "成都到青城山",
  coverSubtitle: "12km / 120m",
  imagePrompt: "no text cycling poster background",
};

const routeFacts = {
  routeName: "犀浦到青城山",
  startPoint: "犀浦",
  endPoint: "青城山",
  distanceKm: 12.35,
  elevationGainM: 120,
  difficulty: "待确认",
  roadType: "待确认",
  highlights: ["待补充"],
  warnings: ["待补充"],
  supplyPoints: ["待补充"],
};

const plannedRoute = {
  routeId: "route_1",
  routeName: "犀浦到青城山",
  start: { id: "B001", name: "犀浦", location: { gcj02: { lng: 104, lat: 30 } }, source: "amap" },
  end: { id: "B002", name: "青城山", location: { gcj02: { lng: 103, lat: 31 } }, source: "amap" },
  waypoints: [],
  distanceKm: 12.35,
  polylineGcj02: [{ lng: 104, lat: 30 }],
  polylineWgs84: [{ lng: 103.998, lat: 30.002 }],
  elevation: {
    status: "success",
    sampleIntervalM: 100,
    batchSize: 100,
    gainNoiseThresholdM: 3,
    points: [{ distanceM: 0, lng: 103.998, lat: 30.002, ele: 500 }],
    elevationGainM: 120,
  },
  routeFacts,
};

describe("PublisherView", () => {
  it("loads route publish draft and saves markdown with GPX path", async () => {
    localStorage.clear();
    writeRoutePublishDraft({
      plannedRoute,
      routeFacts,
      gpxPath: "data/routes/route-1.gpx",
      gpxUrl: "/media/routes/route-1.gpx",
      updatedAt: "2026-06-09T00:00:00.000Z",
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ post }) })
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ markdownPath: "/tmp/post.md" }) });
    vi.stubGlobal("fetch", fetchMock);

    const wrapper = mount(PublisherView);

    await vi.waitFor(() =>
      expect((wrapper.get('[name="routeName"]').element as HTMLInputElement).value).toBe("犀浦到青城山"),
    );
    expect(wrapper.text()).toContain("data/routes/route-1.gpx");

    await wrapper.get('[data-testid="generate-post"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await wrapper.get('[data-testid="save-markdown"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const markdownBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(markdownBody.route).toMatchObject(routeFacts);
    expect(markdownBody.gpxPath).toBe("data/routes/route-1.gpx");
  });

  it("shows an empty state when no draft exists", () => {
    localStorage.clear();

    const wrapper = mount(PublisherView);

    expect(wrapper.text()).toContain("请先在路线规划界面生成路线");
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/client/PublisherView.test.ts
```

Expected: FAIL because `PublisherView` is still a placeholder.

**Step 3: Implement PublisherView**

Move post/cover/markdown/publish state and handlers from old `App.vue` into `src/client/views/PublisherView.vue`.

Use these imports:

```ts
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
```

Initialize:

```ts
const draft = readRoutePublishDraft();
const route = ref<RouteInput | null>(draft?.routeFacts ?? null);
const gpxPath = ref(draft?.gpxPath ?? "");
const gpxUrl = ref(draft?.gpxUrl ?? "");
```

Keep the old `currentRoute`, `runAction`, `onGeneratePost`, `onGenerateCover`, `onSaveMarkdown`, and `onAssistPublish` behavior. Do not include route search or route generation handlers here.

Template shape:

```vue
<template>
  <section class="publisher-view">
    <section v-if="errorMessage" class="error-banner">
      <strong>{{ errorMessage }}</strong>
      <pre v-if="errorDetail">{{ errorDetail }}</pre>
    </section>
    <section v-if="!route" class="empty-panel">请先在路线规划界面生成路线，或手工填写路线事实。</section>
    <section class="publisher-layout">
      <section class="publisher-main">
        <RouteForm ref="routeForm" :initial-route="route" @submit-route="route = $event" />
        <GeneratedPostEditor v-model:post="generatedPost" v-model:selected-title="selectedTitle" />
      </section>
      <aside class="publisher-side">
        <GpxDownloadPanel :gpx-path="gpxPath" :gpx-url="gpxUrl" :loading="false" />
        <CoverPreview :cover-path="coverUrl" :loading="loadingAction === 'generateCover'" :error="loadingAction ? '' : errorDetail" />
        <WorkflowActions
          :loading-action="loadingAction"
          :has-post="hasPost"
          :has-cover="hasCover"
          :can-generate-route="false"
          :has-route="false"
          markdown-path="markdownPath"
          :publish-started="publishStarted"
          @generate-post="onGeneratePost"
          @generate-cover="onGenerateCover"
          @save-markdown="onSaveMarkdown"
          @assist-publish="onAssistPublish"
        />
      </aside>
    </section>
  </section>
</template>
```

When implementing, make sure `:markdown-path="markdownPath"` is bound, not a literal string.

**Step 4: Run test**

Run:

```bash
npm test -- tests/client/PublisherView.test.ts tests/client/RouteForm.test.ts tests/client/GeneratedPostEditor.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/client/views/PublisherView.vue tests/client/PublisherView.test.ts
git commit -m "feat: split publisher view"
```

---

### Task 6: Apply Map-First Route Planner Layout

**Files:**
- Modify: `src/client/App.vue`
- Modify: `src/client/views/RoutePlannerView.vue`
- Modify: `src/client/views/PublisherView.vue`
- Modify: `src/client/components/RouteMap.vue`
- Test: `tests/client/RoutePlannerView.test.ts`
- Test: `tests/client/RouteMap.test.ts`

**Step 1: Write failing layout assertions**

Add to `tests/client/RoutePlannerView.test.ts`:

```ts
it("uses a map-first route planner layout", async () => {
  const { wrapper } = await mountView();

  expect(wrapper.get('[data-testid="route-planner-map-stage"]').exists()).toBe(true);
  expect(wrapper.get('[data-testid="route-planner-panel"]').exists()).toBe(true);
  expect(wrapper.get('[data-testid="route-summary-bar"]').exists()).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/client/RoutePlannerView.test.ts
```

Expected: FAIL until test ids and layout containers exist.

**Step 3: Add layout containers**

In `RoutePlannerView.vue`, wrap content:

```vue
<section class="route-planner-view">
  <section class="route-planner-map-stage" data-testid="route-planner-map-stage">
    <RouteMap :planned-route="plannedRoute" />
  </section>
  <aside class="route-planner-panel" data-testid="route-planner-panel">
    ...
  </aside>
  <RouteSummaryBar ... />
  <div class="route-planner-top-actions">...</div>
</section>
```

**Step 4: Update CSS**

Keep CSS in `App.vue` unless extracting a CSS file is already planned.

Add:

```css
.route-planner-view {
  position: relative;
  min-height: calc(100vh - 80px);
  overflow: hidden;
}

.route-planner-map-stage {
  position: absolute;
  inset: 0;
}

.route-planner-map-stage .route-map {
  height: 100%;
  border: 0;
  border-radius: 0;
  padding: 0;
}

.route-planner-panel {
  position: relative;
  z-index: 2;
  width: min(380px, calc(100vw - 32px));
  margin: 16px;
  display: grid;
  gap: 12px;
}

.route-summary-bar {
  position: absolute;
  right: 16px;
  bottom: 16px;
  left: 16px;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  border: 1px solid #d8dee6;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  padding: 12px;
}
```

Mobile:

```css
@media (max-width: 960px) {
  .route-planner-view {
    min-height: auto;
    overflow: visible;
  }

  .route-planner-map-stage {
    position: relative;
    min-height: 360px;
  }

  .route-planner-panel,
  .route-summary-bar {
    position: relative;
    inset: auto;
    width: auto;
    margin: 12px;
  }

  .route-summary-bar {
    grid-template-columns: 1fr 1fr;
  }
}
```

**Step 5: Run focused tests**

Run:

```bash
npm test -- tests/client/RoutePlannerView.test.ts tests/client/RouteMap.test.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add src/client/App.vue src/client/views/RoutePlannerView.vue src/client/views/PublisherView.vue src/client/components/RouteMap.vue tests/client/RoutePlannerView.test.ts tests/client/RouteMap.test.ts
git commit -m "feat: apply map-first route planner layout"
```

---

### Task 7: Clean Up Old Single-Page Workflow Tests And Compatibility

**Files:**
- Modify: `tests/client/App.test.ts`
- Modify: `tests/client/RoutePlannerView.test.ts`
- Modify: `tests/client/PublisherView.test.ts`
- Modify as needed: `src/client/components/WorkflowActions.vue`

**Step 1: Audit old App workflow expectations**

Run:

```bash
npm test -- tests/client
```

Expected: Some tests may fail if they still assume all workflow controls live in `App.vue`.

**Step 2: Move workflow assertions to view tests**

Rules:

- Route search, candidate selection, generate route, generate GPX, and send-to-publisher assertions belong in `RoutePlannerView.test.ts`.
- Generate post, generate cover, save Markdown, and assist publish assertions belong in `PublisherView.test.ts`.
- `App.test.ts` should only verify shell routing and navigation.

If the old test "uses the latest route form values when generating cover and saving markdown" is removed from `App.test.ts`, add equivalent coverage to `PublisherView.test.ts`:

```ts
it("uses the latest route form values when generating cover and saving markdown", async () => {
  // seed draft
  // generate post
  // edit routeName and distanceKm
  // generate cover and save markdown
  // assert request bodies use latest form values
});
```

**Step 3: Run all client tests**

Run:

```bash
npm test -- tests/client
```

Expected: PASS.

**Step 4: Commit**

```bash
git add tests/client src/client
git commit -m "test: align client workflow coverage with split views"
```

---

### Task 8: Full Validation And Documentation Check

**Files:**
- Modify if needed: `docs/manual-test.md`
- No production code unless tests expose a real issue.

**Step 1: Run full test suite**

Run:

```bash
npm test
```

Expected: PASS.

**Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

**Step 3: Update manual test doc if it references the old single-page UI**

Open:

```bash
sed -n '1,220p' docs/manual-test.md
```

If it describes old single-page flow, update it:

- Start at `/route-planner`.
- Search places.
- Generate route.
- Generate GPX.
- Click "发送到小红书发布".
- Continue at `/publisher`.
- Generate post.
- Generate cover.
- Save Markdown.
- Assist publish.

**Step 4: Run final git status**

Run:

```bash
git status --short
```

Expected: only intentional files modified.

**Step 5: Commit final docs if changed**

```bash
git add docs/manual-test.md
git commit -m "docs: update split workspace manual test flow"
```

If no docs changed, skip this commit.

---

## Final Acceptance Criteria

- Top navigation exists and highlights the current route.
- `/route-planner` renders a map-first planning workspace.
- `/publisher` renders a publishing workspace.
- Route planning no longer shares one giant `App.vue` state object with publishing.
- Route planning can search places, generate route, generate GPX, and write `RoutePublishDraft`.
- Clicking "发送到小红书发布" writes draft data and navigates to `/publisher`.
- Publisher view reads draft data and fills the route form.
- Markdown save includes `gpxPath` when generated.
- Full test suite and build pass.

