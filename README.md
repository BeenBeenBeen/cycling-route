# cycling-route

本项目是本地运行的成都周边骑行路线发布工具，用于辅助生成小红书发布素材。应用提供路线录入、AI 文案生成、AI 封面背景生成、本地封面合成、Markdown 保存和小红书辅助发布。

系统不会自动点击小红书最终发布按钮，不保存小红书账号密码，不绕过登录、验证码或平台风控。

## 安装依赖

```bash
npm install
```

## 配置

复制模板并填写配置：

```bash
cp .env.example .env
```

配置项：

```env
PORT=8787
LOG_LEVEL=info
DUCKCODING_BASE_URL=https://www.duckcoding.ai/v1
DUCKCODING_TEXT_API_KEY=
DUCKCODING_TEXT_MODEL=gpt-5.5
DUCKCODING_IMAGE_API_KEY=
DUCKCODING_IMAGE_MODEL=gpt-image-1
DUCKCODING_IMAGE_SIZE=1024x1536
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

## 启动

```bash
npm run dev
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
| `/api/generate-post` | POST | 根据路线生成小红书文案 |
| `/api/generate-cover` | POST | 生成封面背景并本地合成海报 |
| `/api/save-markdown` | POST | 保存最终内容为 Markdown |
| `/api/assist-publish` | POST | 打开小红书发布页并辅助填写 |

生成文件目录：

```text
data/images/
data/posts/
data/browser-profile/
```

## 上游额度错误

如果终端或页面显示：

```text
Billing hard limit has been reached
```

表示上游账号到达当前 billing hard limit。需要在 DuckCoding 控制台调整额度、充值或更换可用 API key。项目会把该错误作为上游服务失败返回，不会自动重试扣费请求。

## 手动验证

见 [docs/manual-test.md](docs/manual-test.md)。
