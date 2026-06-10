// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import RoutePlannerForm from "../../src/client/components/RoutePlannerForm.vue";

const start = {
  id: "B001",
  name: "犀浦",
  district: "郫都区",
  address: "犀浦街道",
  location: { gcj02: { lng: 104.012, lat: 30.758 } },
  source: "amap" as const,
};

const end = {
  id: "B002",
  name: "青城山",
  district: "都江堰市",
  location: { gcj02: { lng: 103.568, lat: 30.905 } },
  source: "amap" as const,
};

describe("RoutePlannerForm", () => {
  it("emits search when either populated input loses focus", async () => {
    const wrapper = mount(RoutePlannerForm, {
      props: {
        initialStartQuery: "",
        initialEndQuery: "",
        startCandidates: [],
        endCandidates: [],
        selectedStart: null,
        selectedEnd: null,
        loading: false,
        canGenerateRoute: false,
      },
    });

    await wrapper.get('[data-testid="start-query"]').setValue("犀浦");
    await wrapper.get('[data-testid="end-query"]').setValue("青城山");
    await wrapper.get('[data-testid="end-query"]').trigger("blur");

    expect(wrapper.emitted("search")).toEqual([
      [{ startQuery: "犀浦", endQuery: "青城山" }],
    ]);
    expect(wrapper.find('[data-testid="search-places"]').exists()).toBe(false);
  });

  it("does not search until both inputs are populated", async () => {
    const wrapper = mount(RoutePlannerForm, {
      props: {
        initialStartQuery: "",
        initialEndQuery: "",
        startCandidates: [],
        endCandidates: [],
        selectedStart: null,
        selectedEnd: null,
        loading: false,
        canGenerateRoute: false,
      },
    });

    await wrapper.get('[data-testid="start-query"]').setValue("犀浦");
    await wrapper.get('[data-testid="start-query"]').trigger("blur");

    expect(wrapper.emitted("search")).toBeUndefined();
  });

  it("renders and selects candidates in each input dropdown", async () => {
    const wrapper = mount(RoutePlannerForm, {
      props: {
        initialStartQuery: "",
        initialEndQuery: "",
        startCandidates: [start],
        endCandidates: [end],
        selectedStart: null,
        selectedEnd: null,
        loading: false,
        canGenerateRoute: false,
      },
    });

    expect(wrapper.get('[data-testid="start-candidate-B001"]').text()).toContain(
      "犀浦 · 郫都区 · 犀浦街道",
    );
    expect(wrapper.get('[data-testid="end-candidate-B002"]').text()).toContain(
      "青城山 · 都江堰市",
    );
    expect(wrapper.get('[data-testid="route-planner-fields"]').attributes("style")).toContain(
      "repeat(1, minmax(0, 1fr))",
    );
    expect(wrapper.get('[data-testid="start-candidate-dropdown"]').classes()).toContain(
      "place-candidate-dropdown--flow",
    );

    await wrapper.get('[data-testid="start-candidate-B001"]').trigger("mousedown");
    await wrapper.get('[data-testid="start-candidate-B001"]').trigger("click");

    expect(wrapper.emitted("select-start")?.[0]).toEqual([start]);
    expect((wrapper.get('[data-testid="start-query"]').element as HTMLInputElement).value).toBe("犀浦");
  });

  it("shows input loading indicators and owns the route generation action", async () => {
    const wrapper = mount(RoutePlannerForm, {
      props: {
        initialStartQuery: "",
        initialEndQuery: "",
        startCandidates: [],
        endCandidates: [],
        selectedStart: start,
        selectedEnd: end,
        loading: true,
        canGenerateRoute: true,
      },
    });

    expect(wrapper.find('[data-testid="start-query-loading"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="end-query-loading"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="generate-route"]').text()).toContain("生成路线中");

    const readyWrapper = mount(RoutePlannerForm, {
      props: {
        initialStartQuery: "",
        initialEndQuery: "",
        startCandidates: [],
        endCandidates: [],
        selectedStart: start,
        selectedEnd: end,
        loading: false,
        canGenerateRoute: true,
      },
    });
    await readyWrapper.get('[data-testid="generate-route"]').trigger("click");

    expect(readyWrapper.emitted("generate-route")).toHaveLength(1);
  });
});
