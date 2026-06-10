// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import ElevationProfileChart from "../../src/client/components/ElevationProfileChart.vue";

const points = [
  { distanceM: 0, lng: 104.01, lat: 30.75, ele: 480 },
  { distanceM: 5_000, lng: 104.02, lat: 30.76, ele: 620 },
  { distanceM: 10_000, lng: 104.03, lat: 30.77, ele: 540 },
];

describe("ElevationProfileChart", () => {
  it("renders route elevation samples as a scaled polyline", () => {
    const wrapper = mount(ElevationProfileChart, { props: { points } });

    expect(wrapper.find('[data-testid="elevation-profile-chart"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="elevation-profile-line"]').attributes("points")).toBe(
      "25,54 211,4 397,33",
    );
    expect(wrapper.get('[data-testid="elevation-profile-area"]').attributes("d")).toBe(
      "M 25 54 L 211 4 L 397 33 L 397 54 L 25 54 Z",
    );
    expect(wrapper.findAll('[data-testid="elevation-contour-line"]')).toHaveLength(5);
    expect(wrapper.text()).toContain("480 m");
    expect(wrapper.text()).toContain("620 m");
    expect(wrapper.text()).toContain("10 km");
  });

  it("ignores samples without elevation values", () => {
    const wrapper = mount(ElevationProfileChart, {
      props: {
        points: [points[0], { distanceM: 2_500, lng: 104.015, lat: 30.755 }, points[2]],
      },
    });

    expect(wrapper.get('[data-testid="elevation-profile-line"]').attributes("points")).toBe(
      "25,54 397,4",
    );
  });

  it("shows the nearest distance and elevation while hovering over the chart", async () => {
    const wrapper = mount(ElevationProfileChart, { props: { points } });
    const svg = wrapper.get("svg");
    vi.spyOn(svg.element, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 398,
      bottom: 76,
      width: 398,
      height: 76,
      toJSON: () => ({}),
    });

    await svg.trigger("mousemove", { clientX: 211, clientY: 30 });

    const tooltip = wrapper.get('[data-testid="elevation-profile-tooltip"]');
    expect(tooltip.findAll("text")).toHaveLength(3);
    expect(tooltip.text()).toContain("距离：5 km");
    expect(tooltip.text()).toContain("海拔：620 m");
    expect(tooltip.text()).toContain("坡度：0.6%");
    expect(wrapper.emitted("hover-point")?.at(-1)?.[0]).toMatchObject(points[1]);

    await svg.trigger("mouseleave");
    expect(wrapper.find('[data-testid="elevation-profile-tooltip"]').exists()).toBe(false);
    expect(wrapper.emitted("hover-point")?.at(-1)).toEqual([null]);
  });

  it("shows an empty state when no elevation samples are available", () => {
    const wrapper = mount(ElevationProfileChart, {
      props: { points: [{ distanceM: 0, lng: 104.01, lat: 30.75 }] },
    });

    expect(wrapper.find('[data-testid="elevation-profile-line"]').exists()).toBe(false);
    expect(wrapper.findAll('[data-testid="elevation-contour-line"]')).toHaveLength(5);
    expect(wrapper.text()).toContain("暂无海拔数据");
  });
});
