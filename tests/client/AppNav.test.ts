// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";
import AppNav from "../../src/client/components/AppNav.vue";

const mountWithRoute = async (path: string) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/route-planner", component: { template: "<div />" } },
      { path: "/publisher", component: { template: "<div />" } },
    ],
  });
  router.push(path);
  await router.isReady();

  return mount(AppNav, {
    global: {
      plugins: [router],
    },
  });
};

describe("AppNav", () => {
  it("renders route planner and publisher links", async () => {
    const wrapper = await mountWithRoute("/route-planner");

    expect(wrapper.text()).toContain("路线规划");
    expect(wrapper.text()).toContain("小红书发布");
    expect(wrapper.get('[data-testid="nav-route-planner"]').attributes("href")).toBe("/route-planner");
    expect(wrapper.get('[data-testid="nav-publisher"]').attributes("href")).toBe("/publisher");
  });

  it("marks the active route", async () => {
    const wrapper = await mountWithRoute("/publisher");

    expect(wrapper.get('[data-testid="nav-publisher"]').classes()).toContain("active");
  });
});
