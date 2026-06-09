// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { NNotificationProvider } from "naive-ui";
import { defineComponent, h } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it, vi } from "vitest";
import RoutePlannerView from "../../src/client/views/RoutePlannerView.vue";
import { readRoutePublishDraft } from "../../src/client/stores/routePublishDraftStore";

const start = {
  id: "B001",
  name: "犀浦",
  location: { gcj02: { lng: 104.012, lat: 30.758 } },
  source: "amap" as const,
};
const end = {
  id: "B002",
  name: "青城山",
  location: { gcj02: { lng: 103.568, lat: 30.905 } },
  source: "amap" as const,
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
    status: "success" as const,
    sampleIntervalM: 100,
    batchSize: 100,
    gainNoiseThresholdM: 3,
    points: [{ distanceM: 0, lng: 104.01, lat: 30.756, ele: 500 }],
    elevationGainM: 120,
  },
  routeFacts,
};

const routeWithoutElevation = {
  ...plannedRoute,
  elevation: {
    ...plannedRoute.elevation,
    status: "failed" as const,
    points: plannedRoute.elevation.points.map(({ ele: _ele, ...point }) => point),
    elevationGainM: undefined,
    error: "Open-Elevation HTTP request failed with status 504.",
  },
  routeFacts: {
    ...routeFacts,
    elevationGainM: 0,
  },
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
    wrapper: mount(
      defineComponent({
        setup: () => () =>
          h(NNotificationProvider, { placement: "top-right" }, {
            default: () => h(RoutePlannerView),
          }),
      }),
      {
        global: {
          plugins: [router],
        },
      },
    ),
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

    expect(wrapper.find('[data-testid="route-planner-map-stage"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="route-planner-panel"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="route-summary-bar"]').exists()).toBe(true);

    await wrapper.get('[data-testid="start-query"]').setValue("犀浦");
    await wrapper.get('[data-testid="end-query"]').setValue("青城山");
    await wrapper.get("form").trigger("submit");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await vi.waitFor(() =>
      expect(wrapper.find('[data-testid="start-candidate-B001"]').exists()).toBe(true),
    );

    await wrapper.get('[data-testid="start-candidate-B001"]').trigger("click");
    await wrapper.get('[data-testid="end-candidate-B002"]').trigger("click");
    await wrapper.get('[data-testid="generate-route"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await vi.waitFor(() => expect(wrapper.text()).toContain("12.35 km"));

    await wrapper.get('[data-testid="generate-gpx"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    await vi.waitFor(() => expect(wrapper.text()).toContain("data/routes/route-1.gpx"));

    await wrapper.get('[data-testid="send-to-publisher"]').trigger("click");
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe("/publisher"));

    expect(readRoutePublishDraft()).toMatchObject({
      routeFacts,
      gpxPath: "data/routes/route-1.gpx",
      gpxUrl: "/media/routes/route-1.gpx",
    });
  });

  it("shows request errors as a top-right notification", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        error: "地点搜索失败",
        detail: "高德地图服务暂时不可用",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { wrapper } = await mountView();

    await wrapper.get('[data-testid="start-query"]').setValue("犀浦");
    await wrapper.get('[data-testid="end-query"]').setValue("青城山");
    await wrapper.get("form").trigger("submit");

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("地点搜索失败");
      expect(document.body.textContent).toContain("高德地图服务暂时不可用");
    });
    expect(wrapper.find(".error-banner").exists()).toBe(false);
  });

  it("notifies when route elevation lookup fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          startCandidates: [start],
          endCandidates: [end],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ route: routeWithoutElevation }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { wrapper } = await mountView();
    await wrapper.get('[data-testid="start-query"]').setValue("犀浦");
    await wrapper.get('[data-testid="end-query"]').setValue("青城山");
    await wrapper.get("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.find('[data-testid="start-candidate-B001"]').exists()).toBe(true),
    );
    await wrapper.get('[data-testid="start-candidate-B001"]').trigger("click");
    await wrapper.get('[data-testid="end-candidate-B002"]').trigger("click");
    await wrapper.get('[data-testid="generate-route"]').trigger("click");

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("累计爬升获取失败");
      expect(document.body.textContent).toContain("status 504");
    });
    expect(wrapper.get('[data-testid="route-summary-bar"]').text()).not.toContain("0 m");
  });
});
