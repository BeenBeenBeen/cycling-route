// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { NGrid } from "naive-ui";
import { describe, expect, it } from "vitest";
import RouteMap from "../../src/client/components/RouteMap.vue";

const plannedRoute = {
  routeId: "route_1",
  routeName: "犀浦到青城山",
  start: {
    id: "B001",
    name: "犀浦",
    location: { gcj02: { lng: 104.012, lat: 30.758 } },
    source: "amap" as const,
  },
  end: {
    id: "B002",
    name: "青城山",
    location: { gcj02: { lng: 103.568, lat: 30.905 } },
    source: "amap" as const,
  },
  waypoints: [],
  distanceKm: 12.35,
  polylineGcj02: [
    { lng: 104.012, lat: 30.758 },
    { lng: 103.568, lat: 30.905 },
  ],
  polylineWgs84: [
    { lng: 104.01, lat: 30.756 },
    { lng: 103.566, lat: 30.903 },
  ],
  estimatedDurationMin: 61,
  elevation: {
    status: "success" as const,
    sampleIntervalM: 100,
    batchSize: 100,
    gainNoiseThresholdM: 3,
    points: [
      { distanceM: 0, lng: 104.01, lat: 30.756, ele: 480 },
      { distanceM: 6_000, lng: 103.8, lat: 30.82, ele: 620 },
      { distanceM: 12_350, lng: 103.566, lat: 30.903, ele: 540 },
    ],
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
};

describe("RouteMap", () => {
  it("renders a Chengdu-centered map canvas without a planned route", () => {
    const wrapper = mount(RouteMap, { props: { plannedRoute: null } });

    const canvas = wrapper.get('[data-testid="route-map-canvas"]');
    expect(canvas.attributes("data-default-center")).toBe("104.0668,30.5728");
    expect(wrapper.text()).toContain("成都市");
    expect(wrapper.find('[data-testid="elevation-profile-chart"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("暂无海拔数据");
  });

  it("renders route facts when a planned route exists", () => {
    const wrapper = mount(RouteMap, { props: { plannedRoute } });

    expect(wrapper.text()).toContain("犀浦到青城山");
    expect(wrapper.text()).toContain("12.35 km");
    expect(wrapper.text()).toContain("120 m");
    expect(wrapper.text()).toContain("最大坡度");
    expect(wrapper.text()).toContain("2.3%");
    expect(wrapper.text()).not.toContain("预计耗时");
    expect(wrapper.find('[data-testid="route-map-overlays"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="elevation-profile-chart"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-testid="elevation-contour-line"]')).toHaveLength(5);
    expect(wrapper.get('[data-testid="elevation-profile-line"]').attributes("points")).toBeTruthy();
    expect(wrapper.get('[data-testid="route-map-canvas"]').attributes()).toHaveProperty(
      "data-amap-configured",
    );
    expect(wrapper.getComponent(NGrid).props("cols")).toBe("1 s:3");
  });
});
