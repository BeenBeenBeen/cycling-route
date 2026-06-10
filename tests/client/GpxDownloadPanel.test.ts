// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import GpxDownloadPanel from "../../src/client/components/GpxDownloadPanel.vue";

describe("GpxDownloadPanel", () => {
  it("disables download when no GPX URL exists", () => {
    const wrapper = mount(GpxDownloadPanel, {
      props: { gpxPath: "", gpxUrl: "", loading: false, canGenerate: false },
    });

    expect(wrapper.get('[data-testid="download-gpx"]').attributes("aria-disabled")).toBe("true");
  });

  it("renders a download link when GPX URL exists", () => {
    const wrapper = mount(GpxDownloadPanel, {
      props: {
        gpxPath: "data/routes/route-1.gpx",
        gpxUrl: "/media/routes/route-1.gpx",
        loading: false,
        canGenerate: true,
      },
    });

    expect(wrapper.get('[data-testid="download-gpx"]').attributes("href")).toBe(
      "/media/routes/route-1.gpx",
    );
    expect(wrapper.text()).toContain("data/routes/route-1.gpx");
  });

  it("owns the GPX generation action", async () => {
    const wrapper = mount(GpxDownloadPanel, {
      props: { gpxPath: "", gpxUrl: "", loading: false, canGenerate: true },
    });

    await wrapper.get('[data-testid="generate-gpx"]').trigger("click");

    expect(wrapper.emitted("generate")).toHaveLength(1);
  });
});
