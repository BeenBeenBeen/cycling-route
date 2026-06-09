# cycling-route

一个本地运行的成都周边骑行路线发布工具，用于辅助生成小红书发布素材。应用支持起终点地点搜索、骑行路线生成、累计爬升计算、GPX 路书下载、路线录入、AI 文案生成、AI 封面背景生成、本地封面合成、Markdown 保存和小红书辅助发布。

系统不会自动点击小红书最终发布按钮，不保存小红书账号密码，不绕过登录、验证码或平台风控。

## 项目说明

- 前端使用 Vue 3 + Vite
- 后端使用 Express + TypeScript
- 通过本地服务同时提供页面和 API
- 不会自动点击小红书最终发布按钮，不保存小红书账号密码，不绕过登录、验证码或平台风控

## 安装依赖

```bash
npm install
```

## 配置环境

复制模板并填写配置：

```bash
cp .env.example .env
```

配置项：

```env
PORT=8787
APP_MODE=development
LOG_LEVEL=info
DUCKCODING_BASE_URL=https://www.duckcoding.ai/v1
DUCKCODING_TEXT_API_KEY=
DUCKCODING_TEXT_MODEL=gpt-5.5
DUCKCODING_IMAGE_API_KEY=
DUCKCODING_IMAGE_MODEL=gpt-image-1
DUCKCODING_IMAGE_SIZE=1024x1536
AMAP_API_KEY=
AMAP_JS_API_KEY=
OPEN_ELEVATION_BASE_URL=https://api.open-elevation.com/api/v1/lookup
ELEVATION_SAMPLE_INTERVAL_M=100
ELEVATION_BATCH_SIZE=100
ELEVATION_GAIN_NOISE_THRESHOLD_M=3
HTTP_PROXY=
HTTPS_PROXY=
ALL_PROXY=
XIAOHONGSHU_PUBLISH_URL=https://creator.xiaohongshu.com/publish/publish
```

常用模型示例：

```env
DUCKCODING_TEXT_MODEL=gpt-5.5
DUCKCODING_IMAGE_MODEL=gpt-image-1
```

查看请求头、请求 body 和 DuckCoding 请求 body：

```env
LOG_LEVEL=debug
```

模式说明：

```env
APP_MODE=development
APP_MODE=deployment
```

- `development`：默认值，前端和后端都只监听本机地址
- `deployment`：部署模式，前端开发服务器和后端都会监听 `0.0.0.0`，便于通过公网 IP 访问

## 代理配置

OpenAI 请求支持代理，优先级如下：

```text
HTTPS_PROXY > ALL_PROXY > HTTP_PROXY
```

常见本地代理配置：

```env
HTTPS_PROXY=http://127.0.0.1:7890
ALL_PROXY=
HTTP_PROXY=
```

或：

```env
ALL_PROXY=socks5://127.0.0.1:7890
```

## 启动方法

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：

```bash
cp .env.example .env
```

3. 启动开发服务：

```bash
npm run dev
```

如果要在服务器上直接用公网 IP 访问开发服务，先设置：

```env
APP_MODE=deployment
```

前端地址：

```text
http://127.0.0.1:5173
```

后端 API：

```text
http://127.0.0.1:8787
```

## 测试和构建

```bash
npm test
npm run build
```

## API

| API | 方法 | 作用 |
|---|---:|---|
| `/api/health` | GET | 健康检查 |
| `/api/search-places` | POST | 使用高德地图搜索起终点候选地点 |
| `/api/generate-route` | POST | 使用高德生成骑行路线，并通过 Open-Elevation 计算累计爬升 |
| `/api/generate-gpx` | POST | 生成可导入 Strava 的 GPX 路书 |
| `/media/routes/:filename` | GET | 下载本地 GPX 路书 |
| `/api/generate-post` | POST | 根据路线生成小红书文案 |
| `/api/generate-cover` | POST | 生成封面背景并本地合成海报 |
| `/api/save-markdown` | POST | 保存最终内容为 Markdown |
| `/api/assist-publish` | POST | 打开小红书发布页并辅助填写 |

生成文件目录：

```text
data/images/
data/posts/
data/routes/
data/browser-profile/
```

## V2.0 路线和 GPX

V2.0 推荐流程：

1. 输入起点和终点。
2. 从高德候选地点中人工确认起点和终点。
3. 生成骑行路线。
4. 系统按路线采样并调用 Open-Elevation 计算累计爬升。
5. 生成 GPX 路书并下载，可导入 Strava。
6. 继续生成小红书文案、封面和 Markdown。

如果 Open-Elevation 不可用，路线仍可返回，但海拔状态会标记失败，需要人工确认累计爬升。

## 上游额度错误

如果终端或页面显示：

```text
Billing hard limit has been reached
```

表示上游账号到达当前 billing hard limit。需要在 DuckCoding 控制台调整额度、充值或更换可用 API key。项目会把该错误作为上游服务失败返回，不会自动重试扣费请求。

## 手动验证

见 [docs/manual-test.md](docs/manual-test.md)。

## V2.0 需求

见 [docs/requirements-v2.md](docs/requirements-v2.md)。
