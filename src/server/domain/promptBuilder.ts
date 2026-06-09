import type { RouteInput } from "./routeInput";

const list = (items?: string[]) =>
  items && items.length > 0
    ? items.map((item) => `- ${item}`).join("\n")
    : "未提供";

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
