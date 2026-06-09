// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PlaceCandidateSelector from "../../src/client/components/PlaceCandidateSelector.vue";

const candidate = {
  id: "B001",
  name: "犀浦",
  address: "成都市郫都区",
  city: "成都市",
  district: "郫都区",
  location: { gcj02: { lng: 104.012, lat: 30.758 } },
  source: "amap" as const,
};

describe("PlaceCandidateSelector", () => {
  it("emits selected start and end candidates", async () => {
    const end = { ...candidate, id: "B002", name: "青城山" };
    const wrapper = mount(PlaceCandidateSelector, {
      props: {
        startCandidates: [candidate],
        endCandidates: [end],
        selectedStart: null,
        selectedEnd: null,
      },
    });

    await wrapper.get('[data-testid="start-candidate-B001"]').trigger("click");
    await wrapper.get('[data-testid="end-candidate-B002"]').trigger("click");

    expect(wrapper.emitted("select-start")?.[0]).toEqual([candidate]);
    expect(wrapper.emitted("select-end")?.[0]).toEqual([end]);
  });

  it("wraps long candidate labels inside a responsive text element", () => {
    const longCandidate = {
      ...candidate,
      id: "LONG",
      name: "成都市天府绿道锦城湖桂溪生态公园超长候选地点名称",
      address: "四川省成都市高新区绕城高速南侧很长很长的地址描述",
    };
    const wrapper = mount(PlaceCandidateSelector, {
      props: {
        startCandidates: [longCandidate],
        endCandidates: [],
        selectedStart: null,
        selectedEnd: null,
      },
    });

    const label = wrapper.get('[data-testid="start-candidate-LONG"] .candidate-label');
    expect(label.text()).toContain("成都市天府绿道锦城湖");
  });
});
