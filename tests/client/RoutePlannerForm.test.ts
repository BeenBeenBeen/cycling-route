// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import RoutePlannerForm from "../../src/client/components/RoutePlannerForm.vue";

describe("RoutePlannerForm", () => {
  it("emits search when start and end are provided", async () => {
    const wrapper = mount(RoutePlannerForm);

    await wrapper.get('[data-testid="start-query"]').setValue("犀浦");
    await wrapper.get('[data-testid="end-query"]').setValue("青城山");
    await wrapper.get('[data-testid="search-places"]').trigger("click");
    await wrapper.get("form").trigger("submit");

    expect(wrapper.emitted("search")).toEqual([
      [{ startQuery: "犀浦", endQuery: "青城山" }],
    ]);
  });

  it("does not emit search for blank input", async () => {
    const wrapper = mount(RoutePlannerForm);

    await wrapper.get('[data-testid="search-places"]').trigger("click");

    expect(wrapper.emitted("search")).toBeUndefined();
  });
});
