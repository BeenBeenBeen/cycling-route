// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import RouteMap from "../../src/client/components/RouteMap.vue";

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

describe("RouteMap", () => {
  it("renders an empty state without a planned route", () => {
    const wrapper = mount(RouteMap, { props: { plannedRoute: null } });

    expect(wrapper.text()).toContain("尚未生成路线");
  });

  it("renders route facts when a planned route exists", () => {
    const wrapper = mount(RouteMap, { props: { plannedRoute } });

    expect(wrapper.text()).toContain("犀浦到青城山");
    expect(wrapper.text()).toContain("12.35 km");
    expect(wrapper.text()).toContain("120 m");
    expect(wrapper.get('[data-testid="route-map-canvas"]').attributes()).toHaveProperty(
      "data-amap-configured",
    );
  });
});
