// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

const markerSetMap = vi.fn();
const markerSetCenter = vi.fn();
const circleMarker = vi.fn();

vi.mock("../../src/client/amapLoader", () => ({
  loadAmap: vi.fn().mockResolvedValue({
    Map: class {
      setFitView = vi.fn();
      destroy = vi.fn();
    },
    Marker: class {
      setMap = vi.fn();
    },
    Polyline: class {
      setMap = vi.fn();
    },
    CircleMarker: class {
      setMap = markerSetMap;
      setCenter = markerSetCenter;

      constructor(options: Record<string, unknown>) {
        circleMarker(options);
      }
    },
  }),
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("RouteMap elevation hover marker", () => {
  it("shows a converted circle marker for the hovered elevation point and clears it", async () => {
    vi.stubEnv("VITE_AMAP_JS_API_KEY", "test-key");
    const { default: RouteMap } = await import("../../src/client/components/RouteMap.vue");
    const wrapper = mount(RouteMap, { props: { plannedRoute: null } });
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="route-map-canvas"]').attributes("data-amap-configured")).toBe("true");
      expect(wrapper.find(".map-state-loading").exists()).toBe(false);
    });

    const profile = wrapper.findComponent({ name: "ElevationProfileChart" });
    profile.vm.$emit("hover-point", {
      distanceM: 5_000,
      lng: 104.02,
      lat: 30.76,
      ele: 620,
    });
    await vi.waitFor(() => expect(circleMarker).toHaveBeenCalled());

    const firstCenter = circleMarker.mock.calls[0][0].center as [number, number];
    expect(firstCenter[0]).toBeGreaterThan(104.02);
    expect(firstCenter[1]).toBeLessThan(30.77);
    expect(circleMarker).toHaveBeenCalledWith(expect.objectContaining({
      radius: 6,
      fillColor: "#0f766e",
    }));
    expect(markerSetMap).toHaveBeenCalledWith(expect.anything());

    profile.vm.$emit("hover-point", {
      distanceM: 6_000,
      lng: 104.03,
      lat: 30.77,
      ele: 625,
    });
    expect(markerSetCenter).toHaveBeenCalledTimes(1);
    const nextCenter = markerSetCenter.mock.calls[0][0] as [number, number];
    expect(nextCenter[0]).toBeGreaterThan(firstCenter[0]);
    expect(nextCenter[1]).toBeGreaterThan(firstCenter[1]);
    expect(circleMarker).toHaveBeenCalledTimes(1);

    profile.vm.$emit("hover-point", null);
    expect(markerSetMap).toHaveBeenLastCalledWith(null);
  });
});
