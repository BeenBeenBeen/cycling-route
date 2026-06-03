// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import RouteForm from "../../src/client/components/RouteForm.vue";

describe("RouteForm", () => {
  it("emits route input with textarea lists and numeric fields converted", async () => {
    const wrapper = mount(RouteForm);

    await wrapper.get('[name="routeName"]').setValue("成都到青城山周末骑行");
    await wrapper.get('[name="startPoint"]').setValue("犀浦");
    await wrapper.get('[name="endPoint"]').setValue("青城山");
    await wrapper.get('[name="distanceKm"]').setValue("82.5");
    await wrapper.get('[name="elevationGainM"]').setValue("620");
    await wrapper.get('[name="difficulty"]').setValue("进阶");
    await wrapper.get('[name="roadType"]').setValue("绿道、公路、乡道");
    await wrapper.get('[name="highlights"]').setValue("绿道舒服\n青城山适合拍照\n");
    await wrapper.get('[name="warnings"]').setValue("返程注意车流\n ");
    await wrapper.get('[name="supplyPoints"]').setValue("都江堰城区\n");
    await wrapper.get('[name="photoSpots"]').setValue("河边转角\n树林路段");

    await wrapper.get("form").trigger("submit");

    expect(wrapper.emitted("submit-route")?.[0]?.[0]).toMatchObject({
      routeName: "成都到青城山周末骑行",
      distanceKm: 82.5,
      elevationGainM: 620,
      highlights: ["绿道舒服", "青城山适合拍照"],
      warnings: ["返程注意车流"],
      supplyPoints: ["都江堰城区"],
      photoSpots: ["河边转角", "树林路段"],
    });
  });
});
