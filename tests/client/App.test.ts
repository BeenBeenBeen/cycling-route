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
    await wrapper.findAll("button")[1].trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await wrapper.get('[name="routeName"]').setValue("成都到龙泉山夜骑");
    await wrapper.get('[name="distanceKm"]').setValue("46");

    await wrapper.findAll("button")[2].trigger("click");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await nextTick();
    await vi.waitFor(() =>
      expect(wrapper.findAll("button")[3].attributes("disabled")).toBeUndefined(),
    );
    await wrapper.findAll("button")[3].trigger("click");
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
