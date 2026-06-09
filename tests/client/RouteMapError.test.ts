// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/client/amapLoader", () => ({
  loadAmap: vi.fn().mockRejectedValue(new Error("高德地图加载失败")),
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("RouteMap errors", () => {
  it("emits map loading errors instead of rendering them inline", async () => {
    vi.stubEnv("VITE_AMAP_JS_API_KEY", "test-key");
    const { default: RouteMap } = await import("../../src/client/components/RouteMap.vue");
    const wrapper = mount(RouteMap, { props: { plannedRoute: null } });

    await vi.waitFor(() => {
      expect(wrapper.emitted("error")?.[0]?.[0]).toEqual(
        new Error("高德地图加载失败"),
      );
    });
    expect(wrapper.text()).not.toContain("高德地图加载失败");
  });
});
