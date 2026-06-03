import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GeneratedPost } from "../domain/generatedPost";
import type { RouteInput } from "../domain/routeInput";

export type SaveMarkdownPostInput = {
  route: RouteInput;
  post: GeneratedPost;
  selectedTitle: string;
  coverPath?: string;
  outputDir?: string;
  now?: Date;
};

export type SaveMarkdownPostResult = {
  markdownPath: string;
};

const slugify = (value: string) =>
  value
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const timestampForFilename = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `-${pad(date.getHours())}${pad(date.getMinutes())}`;
};

const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

const renderMarkdown = ({
  route,
  post,
  selectedTitle,
  coverPath,
  now,
}: Required<Pick<SaveMarkdownPostInput, "route" | "post" | "selectedTitle" | "now">> &
  Pick<SaveMarkdownPostInput, "coverPath">) => `# ${selectedTitle}

生成时间：${now.toISOString()}

## 路线信息

- 路线名称：${route.routeName}
- 起点：${route.startPoint}
- 终点：${route.endPoint}
- 总里程：${route.distanceKm} km
- 累计爬升：${route.elevationGainM} m
- 难度：${route.difficulty}
- 路况：${route.roadType}

## 小红书正文

${post.body}

## 攻略

${post.guide}

## 彩蛋

${post.easterEgg}

## 话题标签

${post.hashtags.map((tag) => `#${tag}`).join(" ")}

## 封面信息

- 封面标题：${post.coverTitle}
- 封面副标题：${post.coverSubtitle}
- 封面路径：${coverPath ?? "未生成"}
- 背景提示词：${post.imagePrompt}

## 备选标题

${list(post.titleCandidates)}
`;

export const saveMarkdownPost = async ({
  route,
  post,
  selectedTitle,
  coverPath,
  outputDir = path.join(process.cwd(), "data", "posts"),
  now = new Date(),
}: SaveMarkdownPostInput): Promise<SaveMarkdownPostResult> => {
  await mkdir(outputDir, { recursive: true });
  const filename = `${timestampForFilename(now)}-${slugify(route.routeName) || "route"}.md`;
  const markdownPath = path.join(outputDir, filename);

  await writeFile(
    markdownPath,
    renderMarkdown({ route, post, selectedTitle, coverPath, now }),
    "utf8",
  );

  return { markdownPath };
};
