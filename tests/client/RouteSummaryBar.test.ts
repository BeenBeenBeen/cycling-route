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
    points: [
      { distanceM: 0, lng: 104.01, lat: 30.756, ele: 480 },
      { distanceM: 6_000, lng: 103.8, lat: 30.82, ele: 620 },
      { distanceM: 12_350, lng: 103.566, lat: 30.903, ele: 540 },
    ],
  },
};

describe("RouteSummaryBar", () => {
  it("renders empty route metrics before planning", () => {
    const wrapper = mount(RouteSummaryBar, {
      props: { plannedRoute: null, gpxPath: "", gpxUrl: "", loading: false },
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
        loading: false,
      },
    });

    expect(wrapper.text()).toContain("12.35 km");
    expect(wrapper.get('[data-testid="distance-metrics"]').text()).toContain("预计骑行时间");
    expect(wrapper.get('[data-testid="distance-metrics"]').text()).toContain("1 小时 1 分钟");
    expect(wrapper.get('[data-testid="distance-metrics"]').text()).toContain("预计消耗卡路里");
    expect(wrapper.get('[data-testid="distance-metrics"]').text()).toContain("约 600 kcal");
    expect(wrapper.text()).toContain("120 m");
    expect(wrapper.text()).toContain("最大坡度");
    expect(wrapper.text()).toContain("2.3%");
    expect(wrapper.text()).not.toContain("预计耗时");
    expect(wrapper.get("a").attributes("href")).toBe("/media/routes/route-1.gpx");
  });

  it("owns the send-to-publisher action", async () => {
    const wrapper = mount(RouteSummaryBar, {
      props: {
        plannedRoute,
        gpxPath: "",
        gpxUrl: "",
        loading: false,
      },
    });

    await wrapper.get('[data-testid="send-to-publisher"]').trigger("click");

    expect(wrapper.emitted("send-to-publisher")).toHaveLength(1);
  });
});
