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
