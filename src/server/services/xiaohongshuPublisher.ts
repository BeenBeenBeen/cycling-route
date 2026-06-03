import path from "node:path";
import { chromium } from "playwright";
import type { PublishDraft } from "../domain/publishDraft";

export type AssistPublishResult = {
  ok: true;
};

type PageLike = {
  goto(url: string, options?: Record<string, unknown>): Promise<unknown>;
  setInputFiles(selector: string, files: string): Promise<unknown>;
  fill(selector: string, value: string): Promise<unknown>;
};

type BrowserContextLike = {
  newPage(): Promise<PageLike>;
};

type LaunchContext = (
  userDataDir: string,
  options: { headless: false },
) => Promise<BrowserContextLike>;

export type XiaohongshuPublisherConfig = {
  publishUrl: string;
  userDataDir?: string;
  launchContext?: LaunchContext;
};

const selectors = {
  uploadInput: "input[type='file']",
  titleInput: "[placeholder*='标题'], input[name='title']",
  bodyInput: "[contenteditable='true'], textarea",
};

const defaultLaunchContext: LaunchContext = async (userDataDir, options) =>
  chromium.launchPersistentContext(userDataDir, options);

const formatBody = ({ body, hashtags }: Pick<PublishDraft, "body" | "hashtags">) =>
  `${body}\n\n${hashtags.map((tag) => `#${tag}`).join(" ")}`;

export const createXiaohongshuPublisher = ({
  publishUrl,
  userDataDir = path.join(process.cwd(), "data", "browser-profile"),
  launchContext = defaultLaunchContext,
}: XiaohongshuPublisherConfig) => {
  if (!publishUrl.trim()) {
    throw new Error("XIAOHONGSHU_PUBLISH_URL is required");
  }

  return async (draft: PublishDraft): Promise<AssistPublishResult> => {
    const context = await launchContext(userDataDir, { headless: false });
    const page = await context.newPage();

    await page.goto(publishUrl, { waitUntil: "domcontentloaded" });
    await page.setInputFiles(selectors.uploadInput, draft.coverPath);
    await page.fill(selectors.titleInput, draft.title);
    await page.fill(selectors.bodyInput, formatBody(draft));

    return { ok: true };
  };
};
