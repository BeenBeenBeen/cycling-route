// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { NGrid } from "naive-ui";
import { describe, expect, it } from "vitest";
import GeneratedPostEditor from "../../src/client/components/GeneratedPostEditor.vue";

const post = {
  titleCandidates: ["成都周末骑行"],
  body: "正文",
  guide: "攻略",
  easterEgg: "彩蛋",
  hashtags: ["骑行"],
  coverTitle: "青城山骑行",
  coverSubtitle: "周末路线",
  imagePrompt: "poster",
};

describe("GeneratedPostEditor", () => {
  it("uses a single-column editor grid on phones", () => {
    const wrapper = mount(GeneratedPostEditor, {
      props: { post, selectedTitle: post.titleCandidates[0] },
    });

    expect(wrapper.getComponent(NGrid).props("cols")).toBe("1 s:2");
  });
});
