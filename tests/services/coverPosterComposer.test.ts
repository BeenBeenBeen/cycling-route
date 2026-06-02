import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { composeCoverPoster } from "../../src/server/services/coverPosterComposer";

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

describe("composeCoverPoster", () => {
  it("composes a PNG cover poster into the output directory", async () => {
    const dir = path.join(tmpdir(), `cover-poster-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const backgroundPath = path.join(dir, "background.png");
    await sharp({
      create: {
        width: 48,
        height: 64,
        channels: 3,
        background: "#ecfdf3",
      },
    })
      .png()
      .toFile(backgroundPath);

    const result = await composeCoverPoster({
      backgroundPath,
      route,
      coverTitle: "成都到青城山",
      coverSubtitle: "82km / 620m",
      outputDir: dir,
    });

    expect(result.coverPath).toMatch(/cover-.*\.png$/);
    const file = await stat(result.coverPath);
    expect(file.size).toBeGreaterThan(0);

    const metadata = await sharp(result.coverPath).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(1440);
  });

  it("fails when the background file is missing", async () => {
    await expect(
      composeCoverPoster({
        backgroundPath: "/missing/background.png",
        route,
        coverTitle: "成都到青城山",
        coverSubtitle: "82km / 620m",
      }),
    ).rejects.toThrow();
  });
});
