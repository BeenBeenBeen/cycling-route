import { describe, expect, it, vi, afterEach } from "vitest";

const create = vi.fn();
const openAIConstructor = vi.fn();

vi.mock("openai", () => ({
  default: vi.fn(function (this: unknown, config) {
    openAIConstructor(config);
    return {
      chat: {
        completions: {
          create,
        },
      },
    };
  }),
}));

const { createOpenaiPostGenerator } = await import(
  "../../src/server/services/openaiPostGenerator"
);

const logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

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

const generatedPost = {
  titleCandidates: ["a", "b", "c"],
  body: "正文",
  guide: "攻略",
  easterEgg: "彩蛋",
  hashtags: ["成都骑行", "路线攻略", "周末骑行"],
  coverTitle: "成都到青城山",
  coverSubtitle: "82km / 620m",
  imagePrompt: "no text cycling poster background",
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("createOpenaiPostGenerator", () => {
  it("uses DuckCoding chat completions with default model", async () => {
    create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(generatedPost) } }],
    });

    const generator = createOpenaiPostGenerator({
      apiKey: "duck-test",
      baseUrl: "https://www.duckcoding.ai/v1",
      logger: logger as any,
    });

    await expect(generator(route)).resolves.toEqual(generatedPost);
    expect(openAIConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "duck-test",
        baseURL: "https://www.duckcoding.ai/v1",
      }),
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5.5",
        messages: [
          {
            role: "user",
            content: expect.stringContaining("成都到青城山周末骑行"),
          },
        ],
      }),
    );
  });

  it("requires DUCKCODING_TEXT_API_KEY for post generation", () => {
    expect(() =>
      createOpenaiPostGenerator({
        apiKey: undefined,
        logger: logger as any,
      }),
    ).toThrow("DUCKCODING_TEXT_API_KEY is required");
  });

  it("fails when chat completion returns no message content", async () => {
    create.mockResolvedValue({ choices: [{ message: { content: "" } }] });
    const generator = createOpenaiPostGenerator({
      apiKey: "duck-test",
      logger: logger as any,
    });

    await expect(generator(route)).rejects.toThrow(
      "Chat completion returned no message content",
    );
  });
});
