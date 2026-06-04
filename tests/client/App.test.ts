// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/client/App.vue";

const post = {
  titleCandidates: ["标题一", "标题二", "标题三"],
  body: "正文",
  guide: "攻略",
  easterEgg: "彩蛋",
  hashtags: ["成都骑行", "路线攻略", "周末骑行"],
  coverTitle: "成都到青城山",
  coverSubtitle: "82km / 620m",
  imagePrompt: "no text cycling poster background",
};

describe("App workflow", () => {
  it("uses the latest route form values when generating cover and saving markdown", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ post }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          coverPath: "/tmp/cover.png",
          coverUrl: "/media/images/cover.png",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ markdownPath: "/tmp/post.md" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const wrapper = mount(App);
    await fillRoute(wrapper, "成都到青城山周末骑行", "82");
    await wrapper.get('[data-testid="generate-post"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await wrapper.get('[name="routeName"]').setValue("成都到龙泉山夜骑");
    await wrapper.get('[name="distanceKm"]').setValue("46");

    await wrapper.get('[data-testid="generate-cover"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await nextTick();
    await vi.waitFor(() =>
      expect(wrapper.get('[data-testid="save-markdown"]').attributes("disabled")).toBeUndefined(),
    );
    await wrapper.get('[data-testid="save-markdown"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    const coverBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    const markdownBody = JSON.parse(fetchMock.mock.calls[2][1].body);
    expect(coverBody.route).toMatchObject({
      routeName: "成都到龙泉山夜骑",
      distanceKm: 46,
    });
    expect(markdownBody.route).toMatchObject({
      routeName: "成都到龙泉山夜骑",
      distanceKm: 46,
    });
  });

  it("searches places, generates route, generates GPX, and saves markdown with the GPX path", async () => {
    const start = {
      id: "B001",
      name: "犀浦",
      location: { gcj02: { lng: 104.012, lat: 30.758 } },
      source: "amap",
    };
    const end = {
      id: "B002",
      name: "青城山",
      location: { gcj02: { lng: 103.568, lat: 30.905 } },
      source: "amap",
    };
    const routeFacts = {
      routeName: "犀浦到青城山",
      startPoint: "犀浦",
      endPoint: "青城山",
      distanceKm: 12.35,
      elevationGainM: 120,
      difficulty: "待确认",
      roadType: "待确认",
      highlights: ["待补充"],
      warnings: ["待补充"],
      supplyPoints: ["待补充"],
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
        status: "success",
        sampleIntervalM: 100,
        batchSize: 100,
        gainNoiseThresholdM: 3,
        points: [{ distanceM: 0, lng: 104.01, lat: 30.756, ele: 500 }],
        elevationGainM: 120,
      },
      routeFacts,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          startCandidates: [start],
          endCandidates: [end],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ route: plannedRoute }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          gpxPath: "data/routes/route-1.gpx",
          gpxUrl: "/media/routes/route-1.gpx",
          stravaCompatible: true,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ post }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ markdownPath: "/tmp/post.md" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const wrapper = mount(App);
    await wrapper.get('[data-testid="start-query"]').setValue("犀浦");
    await wrapper.get('[data-testid="end-query"]').setValue("青城山");
    await wrapper.get('[data-testid="search-places"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await vi.waitFor(() =>
      expect(wrapper.find('[data-testid="start-candidate-B001"]').exists()).toBe(true),
    );

    await wrapper.get('[data-testid="start-candidate-B001"]').trigger("click");
    await wrapper.get('[data-testid="end-candidate-B002"]').trigger("click");
    await wrapper.get('[data-testid="generate-route"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await vi.waitFor(() =>
      expect((wrapper.get('[name="routeName"]').element as HTMLInputElement).value).toBe(
        "犀浦到青城山",
      ),
    );
    expect(wrapper.text()).toContain("12.35 km");

    await wrapper.get('[data-testid="generate-gpx"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    await vi.waitFor(() => expect(wrapper.text()).toContain("data/routes/route-1.gpx"));

    await wrapper.get('[data-testid="generate-post"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    await vi.waitFor(() =>
      expect(wrapper.get('[data-testid="save-markdown"]').attributes("disabled")).toBeUndefined(),
    );
    await wrapper.get('[data-testid="save-markdown"]').trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(5));

    const markdownBody = JSON.parse(fetchMock.mock.calls[4][1].body);
    expect(markdownBody.gpxPath).toBe("data/routes/route-1.gpx");
  });
});

const fillRoute = async (wrapper: ReturnType<typeof mount>, routeName: string, distanceKm: string) => {
  await wrapper.get('[name="routeName"]').setValue(routeName);
  await wrapper.get('[name="startPoint"]').setValue("犀浦");
  await wrapper.get('[name="endPoint"]').setValue("青城山");
  await wrapper.get('[name="distanceKm"]').setValue(distanceKm);
  await wrapper.get('[name="elevationGainM"]').setValue("620");
  await wrapper.get('[name="difficulty"]').setValue("进阶");
  await wrapper.get('[name="roadType"]').setValue("绿道、公路、乡道");
  await wrapper.get('[name="highlights"]').setValue("绿道舒服");
  await wrapper.get('[name="warnings"]').setValue("返程注意车流");
  await wrapper.get('[name="supplyPoints"]').setValue("都江堰城区");
};
