# 成都骑行路线发布工具重构 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 按 `docs/architecture-redesign.md` 重建本地 Vue + Express 应用，支持路线录入、AI 文案生成、AI 封面背景生成、本地封面合成、Markdown 保存和小红书辅助发布。

**Architecture:** 前端使用 Vue 工作台界面，后端使用 Express API。后端按 domain、useCases、routes、services 分层，领域模型使用 Zod 校验，OpenAI、Sharp、文件系统、Playwright 通过服务层隔离。日志使用 JSON Lines，统一记录 API 和 OpenAI 请求的 headers/body，并按规范脱敏。

**Tech Stack:** Vue 3、Vite、TypeScript、Express、Zod、OpenAI Node SDK、Sharp、Playwright、Vitest、Supertest、@vue/test-utils、jsdom。

---

## 实施约束

- 严格按 TDD：先写失败测试，再实现。
- 每个任务完成后运行指定测试，并提交。
- 不真实调用 OpenAI 单元测试；使用依赖注入或假 fetch。
- 不真实打开小红书单元测试；Playwright 服务使用 fake browser/page 抽象测试。
- 不自动点击小红书最终发布按钮。
- 不记录 API key、authorization、cookie、验证码、图片 base64。
- 参考设计文档：`docs/architecture-redesign.md`。

## Task 1: 恢复项目脚手架

**Files:**
- Create: `index.html`
- Create: `src/client/main.ts`
- Create: `src/client/App.vue`
- Create: `src/server/app.ts`
- Create: `src/server/index.ts`
- Create: `src/server/config.ts`
- Create: `data/.gitkeep`
- Modify: `.env.example`
- Modify: `.gitignore`

**Step 1: 创建最小文件结构**

创建目录：

```bash
mkdir -p src/client src/server data
```

**Step 2: 实现 `index.html`**

```html
<div id="app"></div>
<script type="module" src="/src/client/main.ts"></script>
```

**Step 3: 实现 `src/client/main.ts`**

```ts
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

**Step 4: 实现 `src/client/App.vue`**

```vue
<template>
  <main>
    <h1>成都骑行路线发布工具</h1>
  </main>
</template>
```

**Step 5: 实现 `src/server/config.ts`**

```ts
import "dotenv/config";

export type AppConfig = {
  port: number;
  openaiApiKey?: string;
  openaiTextModel?: string;
  openaiImageModel?: string;
  xiaohongshuPublishUrl: string;
};

export const loadConfig = (): AppConfig => ({
  port: Number(process.env.PORT ?? "8787"),
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiTextModel: process.env.OPENAI_TEXT_MODEL,
  openaiImageModel: process.env.OPENAI_IMAGE_MODEL,
  xiaohongshuPublishUrl:
    process.env.XIAOHONGSHU_PUBLISH_URL ??
    "https://creator.xiaohongshu.com/publish/publish",
});
```

**Step 6: 实现 `src/server/app.ts`**

```ts
import express from "express";

export const createApp = () => {
  const app = express();
  app.use(express.json({ limit: "10mb" }));
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });
  return app;
};
```

**Step 7: 实现 `src/server/index.ts`**

```ts
import { createApp } from "./app";
import { loadConfig } from "./config";

const config = loadConfig();
const app = createApp();

app.listen(config.port, "127.0.0.1", () => {
  console.log(`API listening on http://127.0.0.1:${config.port}`);
});
```

**Step 8: 更新 `.env.example`**

```env
PORT=8787
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=
OPENAI_IMAGE_MODEL=
HTTP_PROXY=
HTTPS_PROXY=
ALL_PROXY=
XIAOHONGSHU_PUBLISH_URL=https://creator.xiaohongshu.com/publish/publish
```

**Step 9: 更新 `.gitignore`**

```gitignore
node_modules/
dist/
.env
data/images/
data/posts/
data/browser-profile/
```

**Step 10: 验证**

Run:

```bash
npm run build
```

Expected: TypeScript 和 Vite build 通过。

**Step 11: Commit**

```bash
git add index.html src/client src/server data .env.example .gitignore
git commit -m "chore: scaffold redesigned publishing app"
```

## Task 2: 领域模型和提示词

**Files:**
- Create: `src/server/domain/routeInput.ts`
- Create: `src/server/domain/generatedPost.ts`
- Create: `src/server/domain/coverPoster.ts`
- Create: `src/server/domain/publishDraft.ts`
- Create: `src/server/domain/promptBuilder.ts`
- Test: `tests/domain/routeInput.test.ts`
- Test: `tests/domain/generatedPost.test.ts`
- Test: `tests/domain/promptBuilder.test.ts`

**Step 1: 写 `RouteInput` 失败测试**

`tests/domain/routeInput.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseRouteInput } from "../../src/server/domain/routeInput";

const validRoute = {
  routeName: "成都到青城山周末骑行",
  startPoint: "犀浦",
  endPoint: "青城山",
  distanceKm: 82,
  elevationGainM: 620,
  difficulty: "进阶",
  roadType: "绿道、公路、乡道",
  highlights: ["绿道舒服", "青城山适合拍照"],
  warnings: ["返程注意车流"],
  supplyPoints: ["都江堰城区"],
};

describe("parseRouteInput", () => {
  it("accepts valid route input", () => {
    expect(parseRouteInput(validRoute)).toMatchObject(validRoute);
  });

  it("rejects empty required fields", () => {
    expect(() => parseRouteInput({ ...validRoute, routeName: "" })).toThrow();
  });

  it("rejects invalid distance and elevation", () => {
    expect(() => parseRouteInput({ ...validRoute, distanceKm: 0 })).toThrow();
    expect(() => parseRouteInput({ ...validRoute, elevationGainM: -1 })).toThrow();
  });

  it("cleans list fields", () => {
    const parsed = parseRouteInput({
      ...validRoute,
      highlights: ["  绿道舒服  ", ""],
    });
    expect(parsed.highlights).toEqual(["绿道舒服"]);
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npm test -- tests/domain/routeInput.test.ts
```

Expected: FAIL，模块不存在。

**Step 3: 实现 `routeInput.ts`**

```ts
import { z } from "zod";

const requiredText = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).optional();
const requiredTextList = z.array(z.string())
  .transform((items) => items.map((item) => item.trim()).filter(Boolean))
  .pipe(z.array(z.string().min(1)).min(1));
const optionalTextList = z.array(z.string())
  .transform((items) => items.map((item) => item.trim()).filter(Boolean))
  .optional();

export const routeInputSchema = z.object({
  routeName: requiredText,
  startPoint: requiredText,
  endPoint: requiredText,
  distanceKm: z.number().finite().positive(),
  elevationGainM: z.number().finite().min(0),
  difficulty: requiredText,
  roadType: requiredText,
  highlights: requiredTextList,
  warnings: requiredTextList,
  supplyPoints: requiredTextList,
  bestSeason: optionalText,
  bestStartTime: optionalText,
  targetRiders: optionalText,
  transportation: optionalText,
  estimatedDuration: optionalText,
  photoSpots: optionalTextList,
  foodRecommendations: optionalTextList,
  userHashtags: optionalTextList,
  extraNotes: optionalText,
});

export type RouteInput = z.infer<typeof routeInputSchema>;

export const parseRouteInput = (input: unknown): RouteInput =>
  routeInputSchema.parse(input);
```

**Step 4: 写生成文案 schema 和提示词测试**

`tests/domain/generatedPost.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generatedPostSchema } from "../../src/server/domain/generatedPost";

describe("generatedPostSchema", () => {
  it("requires structured post fields", () => {
    expect(() =>
      generatedPostSchema.parse({
        titleCandidates: ["a", "b", "c"],
        body: "正文",
        guide: "攻略",
        easterEgg: "彩蛋",
        hashtags: ["成都骑行", "路线攻略", "周末骑行"],
        coverTitle: "成都到青城山",
        coverSubtitle: "82km / 620m",
        imagePrompt: "no text cycling poster background",
      }),
    ).not.toThrow();
  });
});
```

`tests/domain/promptBuilder.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildPostPrompt } from "../../src/server/domain/promptBuilder";

describe("buildPostPrompt", () => {
  it("preserves route facts and requires JSON output", () => {
    const prompt = buildPostPrompt({
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
    });

    expect(prompt).toContain("输出必须是 JSON");
    expect(prompt).toContain("82");
    expect(prompt).toContain("620");
    expect(prompt).toContain("不能编造确定存在的店铺、景点或服务");
    expect(prompt).toContain("无最终中文文字");
  });
});
```

**Step 5: 运行测试确认失败**

Run:

```bash
npm test -- tests/domain/generatedPost.test.ts tests/domain/promptBuilder.test.ts
```

Expected: FAIL，模块不存在。

**Step 6: 实现领域文件**

`src/server/domain/generatedPost.ts`:

```ts
import { z } from "zod";

export const generatedPostSchema = z.object({
  titleCandidates: z.array(z.string().trim().min(1)).length(3),
  body: z.string().trim().min(1),
  guide: z.string().trim().min(1),
  easterEgg: z.string().trim().min(1),
  hashtags: z.array(z.string().trim().min(1)).min(3),
  coverTitle: z.string().trim().min(1),
  coverSubtitle: z.string().trim().min(1),
  imagePrompt: z.string().trim().min(1),
});

export type GeneratedPost = z.infer<typeof generatedPostSchema>;
```

`src/server/domain/coverPoster.ts`:

```ts
import { z } from "zod";
import { routeInputSchema } from "./routeInput";

export const coverPosterRequestSchema = z.object({
  route: routeInputSchema,
  imagePrompt: z.string().trim().min(1),
  coverTitle: z.string().trim().min(1),
  coverSubtitle: z.string().trim().min(1),
});

export type CoverPosterRequest = z.infer<typeof coverPosterRequestSchema>;
```

`src/server/domain/publishDraft.ts`:

```ts
import { z } from "zod";

export const publishDraftSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  hashtags: z.array(z.string().trim().min(1)).min(1),
  coverPath: z.string().trim().min(1),
});

export type PublishDraft = z.infer<typeof publishDraftSchema>;
```

`src/server/domain/promptBuilder.ts`:

```ts
import type { RouteInput } from "./routeInput";

const list = (items?: string[]) =>
  items && items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "未提供";

const text = (value?: string) => value ?? "未提供";

export const buildPostPrompt = (route: RouteInput) => `你是成都周边骑行路线的小红书内容策划。

输出必须是 JSON，不要 Markdown，不要解释文字。
不得修改路线名称、起点、终点、总里程、累计爬升、难度、路况、风险提醒和补给点。
文案可以有种草感，但不能夸大安全性、难度适配或风景体验。
路线彩蛋必须基于用户输入，或以“可探索”“可留意”的方式表达。
不能编造确定存在的店铺、景点或服务。
图片提示词必须描述“无最终中文文字”的类似 Strava 风格海报背景。

请输出：
{
  "titleCandidates": ["标题1", "标题2", "标题3"],
  "body": "小红书正文",
  "guide": "路线攻略",
  "easterEgg": "路线彩蛋",
  "hashtags": ["成都骑行", "成都周边游", "路线攻略"],
  "coverTitle": "封面主标题",
  "coverSubtitle": "封面副标题",
  "imagePrompt": "无文字封面背景图片提示词"
}

路线事实：
- 路线名称：${route.routeName}
- 起点：${route.startPoint}
- 终点或折返点：${route.endPoint}
- 总里程：${route.distanceKm}km
- 累计爬升：${route.elevationGainM}m
- 难度：${route.difficulty}
- 路况类型：${route.roadType}

路线亮点：
${list(route.highlights)}

风险提醒和安全注意事项：
${list(route.warnings)}

补给点：
${list(route.supplyPoints)}

推荐信息：
- 推荐季节：${text(route.bestSeason)}
- 推荐出发时间：${text(route.bestStartTime)}
- 适合人群：${text(route.targetRiders)}
- 交通建议：${text(route.transportation)}
- 预计耗时：${text(route.estimatedDuration)}

拍照点：
${list(route.photoSpots)}

美食推荐：
${list(route.foodRecommendations)}

用户指定话题标签：
${list(route.userHashtags)}

其他补充说明：
${text(route.extraNotes)}`;
```

**Step 7: 验证**

Run:

```bash
npm test -- tests/domain/routeInput.test.ts tests/domain/generatedPost.test.ts tests/domain/promptBuilder.test.ts
```

Expected: PASS。

**Step 8: Commit**

```bash
git add src/server/domain tests/domain
git commit -m "feat: define publishing domain models"
```

## Task 3: 结构化日志模块

**Files:**
- Create: `src/server/logging/jsonLogger.ts`
- Create: `src/server/logging/requestLogger.ts`
- Test: `tests/server/logging/jsonLogger.test.ts`
- Test: `tests/server/logging/requestLogger.test.ts`
- Modify: `src/server/app.ts`

**Step 1: 写 logger 测试**

`tests/server/logging/jsonLogger.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createJsonLogger, redactValue } from "../../../src/server/logging/jsonLogger";

describe("jsonLogger", () => {
  it("redacts sensitive keys", () => {
    expect(redactValue({ apiKey: "secret", nested: { token: "abc" } })).toEqual({
      apiKey: "[redacted]",
      nested: { token: "[redacted]" },
    });
  });

  it("writes one JSON log line", () => {
    const sink = vi.fn();
    const logger = createJsonLogger({ sink });
    logger.info("api.request.started", {
      requestHeaders: { authorization: "Bearer key", "content-type": "application/json" },
    });
    const parsed = JSON.parse(sink.mock.calls[0][0]);
    expect(parsed.event).toBe("api.request.started");
    expect(parsed.requestHeaders.authorization).toBe("[redacted]");
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npm test -- tests/server/logging/jsonLogger.test.ts
```

Expected: FAIL，模块不存在。

**Step 3: 实现 `jsonLogger.ts`**

```ts
type LogLevel = "debug" | "info" | "warn" | "error";
type Sink = (line: string) => void;

const sensitivePattern = /authorization|cookie|set-cookie|x-api-key|apiKey|password|token|secret|code/i;

export const redactValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sensitivePattern.test(key) ? "[redacted]" : redactValue(item),
      ]),
    );
  }

  if (typeof value === "string" && value.length > 512) {
    return `${value.slice(0, 512)}...`;
  }

  return value;
};

export const createJsonLogger = ({ sink = console.log }: { sink?: Sink } = {}) => {
  const write = (level: LogLevel, event: string, fields: Record<string, unknown> = {}) => {
    sink(
      JSON.stringify({
        time: new Date().toISOString(),
        level,
        event,
        ...redactValue(fields),
      }),
    );
  };

  return {
    debug: (event: string, fields?: Record<string, unknown>) => write("debug", event, fields),
    info: (event: string, fields?: Record<string, unknown>) => write("info", event, fields),
    warn: (event: string, fields?: Record<string, unknown>) => write("warn", event, fields),
    error: (event: string, fields?: Record<string, unknown>) => write("error", event, fields),
  };
};

export type JsonLogger = ReturnType<typeof createJsonLogger>;
```

**Step 4: 写 request logger 测试**

`tests/server/logging/requestLogger.test.ts`:

```ts
import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import { createRequestLogger } from "../../../src/server/logging/requestLogger";

describe("createRequestLogger", () => {
  it("logs request headers and body", () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const middleware = createRequestLogger(logger as any);
    const req = {
      method: "POST",
      originalUrl: "/api/generate-post",
      headers: { authorization: "Bearer abc", "content-type": "application/json" },
      body: { routeName: "成都到青城山" },
    };
    const res = new EventEmitter() as EventEmitter & { statusCode: number };
    const next = vi.fn();
    res.statusCode = 200;

    middleware(req as any, res as any, next);
    res.emit("finish");

    expect(next).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("api.request.started", expect.objectContaining({
      method: "POST",
      path: "/api/generate-post",
      requestBody: { routeName: "成都到青城山" },
    }));
    expect(logger.info).toHaveBeenCalledWith("api.request.completed", expect.objectContaining({
      status: 200,
    }));
  });
});
```

**Step 5: 实现 `requestLogger.ts` 并接入 app**

```ts
import type { NextFunction, Request, Response } from "express";
import type { JsonLogger } from "./jsonLogger";

export const createRequestLogger =
  (logger: JsonLogger) => (req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    logger.info("api.request.started", {
      requestId,
      method: req.method,
      path: req.originalUrl.split("?")[0],
      requestHeaders: req.headers,
      requestBody: req.body,
    });

    res.on("finish", () => {
      logger.info("api.request.completed", {
        requestId,
        method: req.method,
        path: req.originalUrl.split("?")[0],
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });

    next();
  };
```

Modify `src/server/app.ts`:

```ts
import express from "express";
import { createJsonLogger } from "./logging/jsonLogger";
import { createRequestLogger } from "./logging/requestLogger";

export const createApp = () => {
  const app = express();
  const logger = createJsonLogger();
  app.use(express.json({ limit: "10mb" }));
  app.use(createRequestLogger(logger));
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });
  return app;
};
```

**Step 6: 验证**

Run:

```bash
npm test -- tests/server/logging/jsonLogger.test.ts tests/server/logging/requestLogger.test.ts
```

Expected: PASS。

**Step 7: Commit**

```bash
git add src/server/logging src/server/app.ts tests/server/logging
git commit -m "feat: add structured request logging"
```

## Task 4: OpenAI 客户端和文案生成用例

**Files:**
- Create: `src/server/services/openaiClient.ts`
- Create: `src/server/services/openaiPostGenerator.ts`
- Create: `src/server/useCases/generatePostUseCase.ts`
- Test: `tests/services/openaiClient.test.ts`
- Test: `tests/useCases/generatePostUseCase.test.ts`

**Step 1: 写 OpenAI 客户端测试**

`tests/services/openaiClient.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createLoggedFetch, resolveProxyUrl } from "../../src/server/services/openaiClient";

describe("resolveProxyUrl", () => {
  it("prefers HTTPS then ALL then HTTP proxy", () => {
    expect(resolveProxyUrl({ httpsProxy: "https://p", allProxy: "socks://p", httpProxy: "http://p" })).toBe("https://p");
    expect(resolveProxyUrl({ allProxy: "socks://p", httpProxy: "http://p" })).toBe("socks://p");
  });
});

describe("createLoggedFetch", () => {
  it("logs headers and body with redaction", async () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("{}", { status: 200 }));
    const logged = createLoggedFetch(fetch, logger as any);
    await logged("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: "Bearer secret", "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-test", input: "hello" }),
    });
    expect(logger.info).toHaveBeenCalledWith("openai.request.started", expect.objectContaining({
      requestHeaders: expect.any(Object),
      requestBody: { model: "gpt-test", input: "hello" },
    }));
  });
});
```

**Step 2: 实现 `openaiClient.ts`**

实现要求：

- 导出 `resolveProxyUrl`。
- 导出 `createLoggedFetch`。
- 导出 `createOpenAIClient(apiKey, proxyConfig, logger)`。
- `createLoggedFetch` 记录 `openai.request.started/completed/failed`。
- body 是 JSON 字符串时解析后记录；解析失败时记录字符串摘要。

**Step 3: 写生成文案用例测试**

`tests/useCases/generatePostUseCase.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createGeneratePostUseCase } from "../../src/server/useCases/generatePostUseCase";

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

describe("createGeneratePostUseCase", () => {
  it("generates and validates post content", async () => {
    const generatePost = vi.fn().mockResolvedValue({
      titleCandidates: ["a", "b", "c"],
      body: "正文",
      guide: "攻略",
      easterEgg: "彩蛋",
      hashtags: ["成都骑行", "路线攻略", "周末骑行"],
      coverTitle: "成都到青城山",
      coverSubtitle: "82km / 620m",
      imagePrompt: "no text cycling poster background",
    });
    const useCase = createGeneratePostUseCase({ generatePost });
    await expect(useCase(route)).resolves.toMatchObject({ coverTitle: "成都到青城山" });
  });
});
```

**Step 4: 实现 `generatePostUseCase.ts` 和 `openaiPostGenerator.ts`**

`generatePostUseCase.ts`：

```ts
import { generatedPostSchema, type GeneratedPost } from "../domain/generatedPost";
import { parseRouteInput, type RouteInput } from "../domain/routeInput";

export type GeneratePost = (route: RouteInput) => Promise<GeneratedPost>;

export const createGeneratePostUseCase =
  ({ generatePost }: { generatePost: GeneratePost }) =>
  async (input: unknown): Promise<GeneratedPost> => {
    const route = parseRouteInput(input);
    return generatedPostSchema.parse(await generatePost(route));
  };
```

`openaiPostGenerator.ts`：

```ts
import { generatedPostSchema, type GeneratedPost } from "../domain/generatedPost";
import { buildPostPrompt } from "../domain/promptBuilder";
import type { RouteInput } from "../domain/routeInput";
import { createOpenAIClient } from "./openaiClient";
import type { JsonLogger } from "../logging/jsonLogger";

export const createOpenaiPostGenerator = ({
  apiKey,
  model,
  logger,
}: {
  apiKey?: string;
  model?: string;
  logger: JsonLogger;
}) => {
  if (!apiKey) throw new Error("OPENAI_API_KEY is required");
  if (!model) throw new Error("OPENAI_TEXT_MODEL is required");

  const client = createOpenAIClient(apiKey, {
    httpProxy: process.env.HTTP_PROXY ?? process.env.http_proxy,
    httpsProxy: process.env.HTTPS_PROXY ?? process.env.https_proxy,
    allProxy: process.env.ALL_PROXY ?? process.env.all_proxy,
  }, logger);

  return async (route: RouteInput): Promise<GeneratedPost> => {
    const response = await client.responses.create({
      model,
      input: buildPostPrompt(route),
      text: { format: { type: "json_object" } },
    });
    return generatedPostSchema.parse(JSON.parse(response.output_text));
  };
};
```

**Step 5: 验证**

Run:

```bash
npm test -- tests/services/openaiClient.test.ts tests/useCases/generatePostUseCase.test.ts
```

Expected: PASS。

**Step 6: Commit**

```bash
git add src/server/services/openaiClient.ts src/server/services/openaiPostGenerator.ts src/server/useCases/generatePostUseCase.ts tests/services/openaiClient.test.ts tests/useCases/generatePostUseCase.test.ts
git commit -m "feat: generate post content with OpenAI boundary"
```

## Task 5: `/api/generate-post` 路由

**Files:**
- Create: `src/server/routes/generatePostRoute.ts`
- Modify: `src/server/app.ts`
- Test: `tests/routes/generatePostRoute.test.ts`

**Step 1: 写失败测试**

`tests/routes/generatePostRoute.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createGeneratePostHandler } from "../../src/server/routes/generatePostRoute";

const validRoute = {
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

const mockHttp = (body: unknown) => {
  const req = { body };
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    json(payload: unknown) { this.body = payload; return this; },
  };
  return { req, res };
};

describe("createGeneratePostHandler", () => {
  it("returns generated post", async () => {
    const generatePost = vi.fn().mockResolvedValue({ body: "ok" });
    const { req, res } = mockHttp(validRoute);
    await createGeneratePostHandler(generatePost as any)(req as any, res as any);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ post: { body: "ok" } });
  });

  it("returns 502 when generation fails", async () => {
    const generatePost = vi.fn().mockRejectedValue(new Error("Billing hard limit has been reached"));
    const { req, res } = mockHttp(validRoute);
    await createGeneratePostHandler(generatePost as any)(req as any, res as any);
    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: "Billing hard limit has been reached" });
  });
});
```

**Step 2: 实现路由**

```ts
import { ZodError } from "zod";
import type { GeneratedPost } from "../domain/generatedPost";
import { parseRouteInput, type RouteInput } from "../domain/routeInput";

export type GeneratePost = (route: RouteInput) => Promise<GeneratedPost>;

export const createGeneratePostHandler =
  (generatePost: GeneratePost) =>
  async (req: { body: unknown }, res: any) => {
    try {
      const route = parseRouteInput(req.body);
      const post = await generatePost(route);
      return res.json({ post });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid route input", issues: error.issues });
      }
      const message = error instanceof Error ? error.message : "Failed to generate post";
      return res.status(502).json({ error: message });
    }
  };
```

**Step 3: 接入 `app.ts`**

`createApp` 接收依赖：

```ts
export type AppDependencies = {
  generatePost?: GeneratePost;
};
```

注册：

```ts
if (dependencies.generatePost) {
  app.post("/api/generate-post", createGeneratePostHandler(dependencies.generatePost));
}
```

**Step 4: 验证**

Run:

```bash
npm test -- tests/routes/generatePostRoute.test.ts
```

Expected: PASS。

**Step 5: Commit**

```bash
git add src/server/routes/generatePostRoute.ts src/server/app.ts tests/routes/generatePostRoute.test.ts
git commit -m "feat: expose generate post API"
```

## Task 6: 封面生成和合成

**Files:**
- Create: `src/server/services/openaiCoverBackgroundGenerator.ts`
- Create: `src/server/services/coverPosterComposer.ts`
- Create: `src/server/useCases/generateCoverUseCase.ts`
- Create: `src/server/routes/generateCoverRoute.ts`
- Modify: `src/server/app.ts`
- Test: `tests/services/coverPosterComposer.test.ts`
- Test: `tests/useCases/generateCoverUseCase.test.ts`
- Test: `tests/routes/generateCoverRoute.test.ts`

**Step 1: 写 composer 测试**

测试创建一张小 PNG 背景，调用 composer 后输出 PNG 文件到临时目录。

Run:

```bash
npm test -- tests/services/coverPosterComposer.test.ts
```

Expected: FAIL，服务不存在。

**Step 2: 实现 composer**

实现要求：

- 使用 `sharp(backgroundPath)`。
- `resize(1080, 1440, { fit: "cover" })`。
- 创建 SVG overlay，包含路线名、里程、爬升、难度、起终点。
- 输出到 `data/images/` 或测试传入的 `outputDir`。

**Step 3: 写 use case 和 route 测试**

覆盖：

- 合法请求返回 `{ coverPath }`。
- route 无效返回 `400`。
- 背景生成失败返回 `502`，响应包含 `detail`。
- 本地合成失败返回 `500`。

**Step 4: 实现 OpenAI 图片背景服务**

要求：

- `OPENAI_API_KEY` 缺失抛错。
- `OPENAI_IMAGE_MODEL` 缺失抛错。
- 调用 `client.images.generate`。
- 请求 prompt 追加“无最终中文文字、无可读标签、无数字”。
- `b64_json` 写入 `data/images/background-*.png`。

**Step 5: 实现 use case 和 route**

`GenerateCoverUseCase` 顺序：

1. 校验 `coverPosterRequestSchema`。
2. 调用 `generateBackground(imagePrompt)`。
3. 调用 `composeCover({ route, backgroundPath, coverTitle, coverSubtitle })`。
4. 返回 `coverPath`。

**Step 6: 验证**

Run:

```bash
npm test -- tests/services/coverPosterComposer.test.ts tests/useCases/generateCoverUseCase.test.ts tests/routes/generateCoverRoute.test.ts
```

Expected: PASS。

**Step 7: Commit**

```bash
git add src/server/services/openaiCoverBackgroundGenerator.ts src/server/services/coverPosterComposer.ts src/server/useCases/generateCoverUseCase.ts src/server/routes/generateCoverRoute.ts src/server/app.ts tests/services/coverPosterComposer.test.ts tests/useCases/generateCoverUseCase.test.ts tests/routes/generateCoverRoute.test.ts
git commit -m "feat: generate and compose cover poster"
```

## Task 7: Markdown 保存

**Files:**
- Create: `src/server/services/markdownPostStore.ts`
- Create: `src/server/useCases/saveMarkdownUseCase.ts`
- Create: `src/server/routes/saveMarkdownRoute.ts`
- Modify: `src/server/app.ts`
- Test: `tests/services/markdownPostStore.test.ts`
- Test: `tests/routes/saveMarkdownRoute.test.ts`

**Step 1: 写服务测试**

测试 Markdown 包含：

- 选定标题。
- 路线信息。
- 小红书正文。
- 攻略。
- 彩蛋。
- 话题标签。
- 封面信息。
- 生成时间。

**Step 2: 实现 `markdownPostStore.ts`**

要求：

- 保存到 `data/posts/`。
- 文件名：`YYYY-MM-DD-HHmm-<route-name-slug>.md`。
- 自动创建目录。
- 返回 `markdownPath`。

**Step 3: 写路由测试**

覆盖：

- 合法请求返回 `{ markdownPath }`。
- 请求体非法返回 `400`。
- 写入失败返回 `500`。

**Step 4: 实现 use case 和 route**

请求体：

```ts
{
  route: RouteInput;
  post: GeneratedPost;
  selectedTitle: string;
  coverPath?: string;
}
```

**Step 5: 验证**

Run:

```bash
npm test -- tests/services/markdownPostStore.test.ts tests/routes/saveMarkdownRoute.test.ts
```

Expected: PASS。

**Step 6: Commit**

```bash
git add src/server/services/markdownPostStore.ts src/server/useCases/saveMarkdownUseCase.ts src/server/routes/saveMarkdownRoute.ts src/server/app.ts tests/services/markdownPostStore.test.ts tests/routes/saveMarkdownRoute.test.ts
git commit -m "feat: save publishing draft as markdown"
```

## Task 8: 小红书辅助发布

**Files:**
- Create: `src/server/services/xiaohongshuPublisher.ts`
- Create: `src/server/useCases/assistPublishUseCase.ts`
- Create: `src/server/routes/assistPublishRoute.ts`
- Modify: `src/server/app.ts`
- Test: `tests/services/xiaohongshuPublisher.test.ts`
- Test: `tests/routes/assistPublishRoute.test.ts`

**Step 1: 写服务测试**

使用 fake page，验证：

- 打开发布 URL。
- 上传封面。
- 填写标题。
- 填写正文和标签。
- 不点击最终发布按钮。

**Step 2: 实现 `xiaohongshuPublisher.ts`**

选择器集中维护：

```ts
const selectors = {
  uploadInput: "input[type='file']",
  titleInput: "[placeholder*='标题'], input[name='title']",
  bodyInput: "[contenteditable='true'], textarea",
};
```

实现要求：

- 生产环境启动 visible Chromium。
- 使用 `data/browser-profile/` 持久目录。
- 停留在最终发布前。

**Step 3: 写并实现 route/use case**

请求体：

```ts
{
  title: string;
  body: string;
  hashtags: string[];
  coverPath: string;
}
```

响应：

```ts
{ ok: true }
```

**Step 4: 验证**

Run:

```bash
npm test -- tests/services/xiaohongshuPublisher.test.ts tests/routes/assistPublishRoute.test.ts
```

Expected: PASS。

**Step 5: Commit**

```bash
git add src/server/services/xiaohongshuPublisher.ts src/server/useCases/assistPublishUseCase.ts src/server/routes/assistPublishRoute.ts src/server/app.ts tests/services/xiaohongshuPublisher.test.ts tests/routes/assistPublishRoute.test.ts
git commit -m "feat: assist Xiaohongshu publishing"
```

## Task 9: 生产依赖装配

**Files:**
- Create: `src/server/dependencies.ts`
- Modify: `src/server/index.ts`
- Test: `tests/server/dependencies.test.ts`

**Step 1: 写依赖装配测试**

验证配置完整时返回所有 API 依赖函数；配置缺失时不在启动阶段崩溃，实际调用时返回配置错误。

**Step 2: 实现 `dependencies.ts`**

装配：

- `generatePost`
- `generateBackground`
- `composeCover`
- `saveMarkdown`
- `assistPublish`

**Step 3: 修改 `index.ts`**

```ts
const app = createApp(createProductionDependencies(config));
```

**Step 4: 验证**

Run:

```bash
npm test -- tests/server/dependencies.test.ts
```

Expected: PASS。

**Step 5: Commit**

```bash
git add src/server/dependencies.ts src/server/index.ts tests/server/dependencies.test.ts
git commit -m "feat: wire production dependencies"
```

## Task 10: 前端 API 客户端和工作台 UI

**Files:**
- Create: `src/client/api/publishingApi.ts`
- Create: `src/client/components/RouteForm.vue`
- Create: `src/client/components/GeneratedPostEditor.vue`
- Create: `src/client/components/CoverPreview.vue`
- Create: `src/client/components/WorkflowActions.vue`
- Modify: `src/client/App.vue`
- Test: `tests/client/publishingApi.test.ts`
- Test: `tests/client/RouteForm.test.ts`

**Step 1: 写 API 客户端测试**

覆盖：

- 成功响应返回 JSON。
- 失败响应包含 `detail` 时抛出带 detail 的错误。

**Step 2: 实现 `publishingApi.ts`**

导出：

- `generatePost(route)`
- `generateCover(payload)`
- `saveMarkdown(payload)`
- `assistPublish(payload)`

统一处理 `{ error, detail, issues }`。

**Step 3: 写 RouteForm 测试**

验证 textarea 每行转换为数组，number input 转为 number。

**Step 4: 实现组件**

组件按 `docs/architecture-redesign.md` 第 8 章：

- 两栏工作台。
- RouteForm 分组。
- GeneratedPostEditor 可编辑所有生成字段。
- CoverPreview 展示状态。
- WorkflowActions 按启用规则禁用按钮。

**Step 5: 验证**

Run:

```bash
npm test -- tests/client/publishingApi.test.ts tests/client/RouteForm.test.ts
npm run build
```

Expected: PASS。

**Step 6: Commit**

```bash
git add src/client tests/client
git commit -m "feat: build publishing workflow UI"
```

## Task 11: 全链路 API 测试

**Files:**
- Test: `tests/server/appRoutes.test.ts`

**Step 1: 写 Express app 路由测试**

使用 `supertest` 覆盖：

- `GET /api/health`
- `POST /api/generate-post`
- `POST /api/generate-cover`
- `POST /api/save-markdown`
- `POST /api/assist-publish`

依赖全部注入 fake 函数。

**Step 2: 运行测试确认失败或补齐**

Run:

```bash
npm test -- tests/server/appRoutes.test.ts
```

Expected: PASS；如失败，修正 app 路由注册。

**Step 3: Commit**

```bash
git add tests/server/appRoutes.test.ts src/server/app.ts
git commit -m "test: cover app API route wiring"
```

## Task 12: README 和手动验证清单

**Files:**
- Modify: `README.md`
- Create: `docs/manual-test.md`

**Step 1: 更新 README**

包含：

- 项目用途。
- 安装依赖。
- `.env` 配置。
- 代理配置。
- 启动命令。
- 测试命令。
- 不自动发布说明。
- OpenAI hard limit 常见错误说明。

**Step 2: 编写手动验证清单**

`docs/manual-test.md` 包含：

- 打开本地页面。
- 填写测试路线。
- 生成文案。
- 编辑标题和正文。
- 生成封面。
- 保存 Markdown。
- 启动辅助发布。
- 确认浏览器停在最终发布前。

**Step 3: 全量验证**

Run:

```bash
npm test
npm run build
```

Expected: 全部通过。

**Step 4: Commit**

```bash
git add README.md docs/manual-test.md
git commit -m "docs: document redesigned workflow"
```

## 最终验证

Run:

```bash
git status --short
npm test
npm run build
```

Expected:

- `npm test` 全部通过。
- `npm run build` 通过。
- 工作区只包含预期变更。

手动启动：

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:5173
```

没有 OpenAI key 或额度不足时，页面必须显示清晰错误；终端必须输出 JSON Lines 日志，包含脱敏后的 headers/body。
