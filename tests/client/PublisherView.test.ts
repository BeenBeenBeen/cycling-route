// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { NNotificationProvider } from "naive-ui";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import PublisherView from "../../src/client/views/PublisherView.vue";
import { writeRoutePublishDraft } from "../../src/client/stores/routePublishDraftStore";
import type { GeneratedPost, RouteInput } from "../../src/client/api/publishingApi";

const start = {
  id: "B001",
  name: "犀浦",
  location: { gcj02: { lng: 104.012, lat: 30.758 } },
  source: "amap" as const,
};
const end = {
  id: "B002",
  name: "青城山",
  location: { gcj02: { lng: 103.568, lat: 30.905 } },
  source: "amap" as const,
};
const routeFacts: RouteInput = {
  routeName: "犀浦到青城山",
  startPoint: "犀浦",
  endPoint: "青城山",
  distanceKm: 12.35,
  elevationGainM: 120,
  difficulty: "待确认",
  roadType: "待确认",
  highlights: ["绿道", "山景"],
  warnings: ["注意补水"],
  supplyPoints: ["青城山镇"],
};

const post: GeneratedPost = {
  titleCandidates: ["成都周末骑行路线"],
  body: "正文",
  guide: "攻略",
  easterEgg: "彩蛋",
  hashtags: ["骑行", "成都"],
  coverTitle: "青城山骑行",
  coverSubtitle: "周末路线",
  imagePrompt: "poster style",
};
const plannedRoute = {
  routeId: "route_1",
  routeName: "犀浦到青城山",
  start,
  end,
  waypoints: [],
  distanceKm: 12.35,
  polylineGcj02: [start.location.gcj02],
  polylineWgs84: [{ lng: 104.01, lat: 30.756 }],
  elevation: {
    status: "success" as const,
    sampleIntervalM: 100,
    batchSize: 100,
    gainNoiseThresholdM: 3,
    points: [{ distanceM: 0, lng: 104.01, lat: 30.756, ele: 500 }],
    elevationGainM: 120,
  },
  routeFacts,
};

const mountView = () =>
  mount(
    defineComponent({
      setup: () => () =>
        h(NNotificationProvider, { placement: "top-right" }, {
          default: () => h(PublisherView),
        }),
    }),
  );

describe("PublisherView", () => {
  it("loads route draft, generates post and saves markdown with GPX path", async () => {
    localStorage.clear();
    writeRoutePublishDraft({
      plannedRoute,
      routeFacts,
      gpxPath: "data/routes/route-1.gpx",
      gpxUrl: "/media/routes/route-1.gpx",
      updatedAt: "2026-06-09T00:00:00.000Z",
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ post }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ markdownPath: "posts/post.md" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const wrapper = mountView();

    expect(wrapper.get('input[name="routeName"]').element).toHaveProperty(
      "value",
      "犀浦到青城山",
    );
    expect(wrapper.text()).toContain("data/routes/route-1.gpx");

    await wrapper.get('[data-testid="generate-post"]').trigger("click");
    await vi.waitFor(() => expect(wrapper.text()).toContain("成都周末骑行路线"));

    await wrapper.get('[data-testid="save-markdown"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const saveBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(saveBody).toMatchObject({
      route: routeFacts,
      selectedTitle: "成都周末骑行路线",
      gpxPath: "data/routes/route-1.gpx",
    });
    await vi.waitFor(() => expect(wrapper.text()).toContain("posts/post.md"));
  });

  it("shows an empty route hint when no planner draft exists", () => {
    localStorage.clear();

    const wrapper = mountView();

    expect(wrapper.text()).toContain("尚未接收路线规划结果");
    expect(wrapper.find('input[name="routeName"]').exists()).toBe(true);
  });

  it("shows publishing request errors as a top-right notification", async () => {
    localStorage.clear();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        error: "文案生成失败",
        detail: "上游服务不可用",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const wrapper = mountView();

    await wrapper.get('[data-testid="generate-post"]').trigger("click");

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("文案生成失败");
      expect(document.body.textContent).toContain("上游服务不可用");
    });
    expect(wrapper.find(".error-banner").exists()).toBe(false);
  });
});
