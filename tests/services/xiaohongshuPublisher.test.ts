import { describe, expect, it, vi } from "vitest";
import { createXiaohongshuPublisher } from "../../src/server/services/xiaohongshuPublisher";

describe("createXiaohongshuPublisher", () => {
  it("opens publish page, uploads cover, fills content, and does not publish", async () => {
    const page = {
      goto: vi.fn(),
      setInputFiles: vi.fn(),
      fill: vi.fn(),
      click: vi.fn(),
    };
    const context = { newPage: vi.fn().mockResolvedValue(page) };
    const launchContext = vi.fn().mockResolvedValue(context);
    const publish = createXiaohongshuPublisher({
      publishUrl: "https://example.test/publish",
      userDataDir: "/tmp/profile",
      launchContext,
    });

    await expect(
      publish({
        title: "标题一",
        body: "小红书正文",
        hashtags: ["成都骑行", "路线攻略"],
        coverPath: "/tmp/cover.png",
      }),
    ).resolves.toEqual({ ok: true });

    expect(launchContext).toHaveBeenCalledWith("/tmp/profile", {
      headless: false,
    });
    expect(page.goto).toHaveBeenCalledWith("https://example.test/publish", {
      waitUntil: "domcontentloaded",
    });
    expect(page.setInputFiles).toHaveBeenCalledWith(
      "input[type='file']",
      "/tmp/cover.png",
    );
    expect(page.fill).toHaveBeenCalledWith(
      "[placeholder*='标题'], input[name='title']",
      "标题一",
    );
    expect(page.fill).toHaveBeenCalledWith(
      "[contenteditable='true'], textarea",
      "小红书正文\n\n#成都骑行 #路线攻略",
    );
    expect(page.click).not.toHaveBeenCalled();
  });
});
