import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const generate = vi.fn();
const openAIConstructor = vi.fn();

vi.mock("openai", () => ({
  default: vi.fn(function (this: unknown, config) {
    openAIConstructor(config);
    return {
      images: {
        generate,
      },
    };
  }),
}));

const { createOpenaiCoverBackgroundGenerator } = await import(
  "../../src/server/services/openaiCoverBackgroundGenerator"
);

const logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

let tempDir: string | undefined;

afterEach(async () => {
  vi.clearAllMocks();
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe("createOpenaiCoverBackgroundGenerator", () => {
  it("uses the DuckCoding OpenAI-compatible images API with default image options", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "cover-bg-"));
    generate.mockResolvedValue({
      data: [{ b64_json: Buffer.from("png-data").toString("base64") }],
    });

    const generator = createOpenaiCoverBackgroundGenerator({
      apiKey: "duck-test",
      baseUrl: "https://www.duckcoding.ai/v1",
      outputDir: tempDir,
      logger: logger as any,
    });

    const imagePath = await generator("cycling poster background");

    expect(openAIConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "duck-test",
        baseURL: "https://www.duckcoding.ai/v1",
      }),
    );
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-image-1",
        prompt: expect.stringContaining("cycling poster background"),
        size: "1024x1536",
        n: 1,
      }),
    );
    const request = generate.mock.calls[0][0];
    expect(request.prompt).toContain("large areas of rich visual texture");
    expect(request.prompt).toContain("premium editorial poster background");
    expect(request.prompt).not.toContain("route/map texture");
    expect(await readFile(imagePath, "utf8")).toBe("png-data");
  });

  it("requires DUCKCODING_IMAGE_API_KEY for cover background generation", () => {
    expect(() =>
      createOpenaiCoverBackgroundGenerator({
        apiKey: undefined,
        logger: logger as any,
      }),
    ).toThrow("DUCKCODING_IMAGE_API_KEY is required");
  });
});
