import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/server/app";

const route = {
  routeName: "成都到青城山周末骑行",
  startPoint: "犀浦",
  endPoint: "青城山",
  distanceKm: 82,
  elevationGainM: 620,
  difficulty: "进阶",
  roadType: "绿道、公路、乡道",
  highlights: ["绿道舒服"],
  warnings: ["返程注意车流"],
  supplyPoints: ["都江堰城区"],
};

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

describe("app API route wiring", () => {
  it("registers health and publishing workflow routes", async () => {
    const dependencies = {
      logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      generatePost: vi.fn().mockResolvedValue(post),
      generateCover: vi.fn().mockResolvedValue({
        coverPath: "/tmp/cover.png",
        coverUrl: "/media/images/cover.png",
      }),
      saveMarkdown: vi.fn().mockResolvedValue({ markdownPath: "/tmp/post.md" }),
      assistPublish: vi.fn().mockResolvedValue({ ok: true }),
    };
    const app = createApp(dependencies as any);

    expect(await invoke(app, "get", "/api/health")).toEqual({
      statusCode: 200,
      body: { ok: true },
    });
    expect(await invoke(app, "post", "/api/generate-post", route)).toMatchObject({
      statusCode: 200,
      body: { post },
    });
    expect(
      await invoke(app, "post", "/api/generate-cover", {
        route,
        imagePrompt: post.imagePrompt,
        coverTitle: post.coverTitle,
        coverSubtitle: post.coverSubtitle,
      }),
    ).toMatchObject({
      statusCode: 200,
      body: {
        coverPath: "/tmp/cover.png",
        coverUrl: "/media/images/cover.png",
      },
    });
    expect(
      await invoke(app, "post", "/api/save-markdown", {
        route,
        post,
        selectedTitle: "标题一",
        coverPath: "/tmp/cover.png",
      }),
    ).toMatchObject({
      statusCode: 200,
      body: { markdownPath: "/tmp/post.md" },
    });
    expect(
      await invoke(app, "post", "/api/assist-publish", {
        title: "标题一",
        body: post.body,
        hashtags: post.hashtags,
        coverPath: "/tmp/cover.png",
      }),
    ).toMatchObject({
      statusCode: 200,
      body: { ok: true },
    });

    expect(dependencies.generatePost).toHaveBeenCalledWith(route);
    expect(dependencies.generateCover).toHaveBeenCalledOnce();
    expect(dependencies.saveMarkdown).toHaveBeenCalledOnce();
    expect(dependencies.assistPublish).toHaveBeenCalledOnce();
  });
});

const invoke = async (
  app: any,
  method: "get" | "post",
  path: string,
  body?: unknown,
) => {
  const layer = app.router.stack.find(
    (item: any) => item.route?.path === path && item.route?.methods?.[method],
  );
  if (!layer) {
    throw new Error(`Route not found: ${method.toUpperCase()} ${path}`);
  }

  const handler = layer.route.stack.at(-1).handle;
  const req = { body };
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  await handler(req, res);
  return { statusCode: res.statusCode, body: res.body };
};
