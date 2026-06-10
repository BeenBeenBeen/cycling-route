// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";
import App from "../../src/client/App.vue";
import { routes } from "../../src/client/router";

const mountApp = async (path = "/route-planner") => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  });
  router.push(path);
  await router.isReady();

  return mount(App, {
    global: {
      plugins: [router],
    },
  });
};

describe("App shell", () => {
  it("renders navigation and the selected route", async () => {
    const wrapper = await mountApp("/publisher");

    expect(wrapper.text()).toContain("路线规划");
    expect(wrapper.text()).toContain("小红书发布");
    expect(wrapper.find('[data-testid="publisher-view"]').exists()).toBe(true);
  });

  it("provides a bounded content area for viewport-height pages", async () => {
    const wrapper = await mountApp();

    expect(wrapper.get('[data-testid="workspace-content"]').classes()).toContain(
      "workspace-content",
    );
  });
});
