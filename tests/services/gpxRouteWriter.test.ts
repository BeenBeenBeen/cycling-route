import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { writeGpxRoute } from "../../src/server/services/gpxRouteWriter";

const makeOutputDir = () => mkdtemp(join(tmpdir(), "gpx-route-writer-"));

describe("writeGpxRoute", () => {
  it("writes GPX 1.1 track XML with correct coordinate order and elevation", async () => {
    const outputDir = await makeOutputDir();

    const result = await writeGpxRoute({
      outputDir,
      routeId: "route_1",
      name: "成都东站到青城山",
      points: [
        { distanceM: 0, lng: 104.1, lat: 30.6, ele: 512 },
        { distanceM: 100, lng: 104.2, lat: 30.7, ele: 518.5 },
      ],
    });

    const xml = await readFile(result.gpxPath, "utf8");
    expect(xml).toContain('version="1.1"');
    expect(xml).toContain("<trk>");
    expect(xml).toContain("<name>成都东站到青城山</name>");
    expect(xml).toContain("<trkseg>");
    expect(xml).toContain('<trkpt lat="30.6" lon="104.1">');
    expect(xml).toContain("<ele>512</ele>");
    expect(xml).toContain('<trkpt lat="30.7" lon="104.2">');
    expect(xml).toContain("<ele>518.5</ele>");
    expect(result.gpxUrl).toMatch(/^\/media\/routes\/.+\.gpx$/);
    expect(result.stravaCompatible).toBe(true);
  });

  it("escapes route names and creates a safe slug filename", async () => {
    const outputDir = await makeOutputDir();

    const result = await writeGpxRoute({
      outputDir,
      routeId: "route/../../unsafe id",
      name: 'A&B <Route> "Q"',
      points: [{ distanceM: 0, lng: 104.1, lat: 30.6, ele: 512 }],
    });

    const xml = await readFile(result.gpxPath, "utf8");
    expect(xml).toContain(
      "<name>A&amp;B &lt;Route&gt; &quot;Q&quot;</name>",
    );
    expect(result.gpxPath).toBe(join(outputDir, "route-unsafe-id.gpx"));
    expect(result.gpxUrl).toBe("/media/routes/route-unsafe-id.gpx");
  });

  it("rejects routes without points", async () => {
    await expect(
      writeGpxRoute({
        outputDir: await makeOutputDir(),
        routeId: "route_1",
        name: "Empty",
        points: [],
      }),
    ).rejects.toThrow(/points/i);
  });

  it("rejects missing elevation unless explicitly allowed", async () => {
    await expect(
      writeGpxRoute({
        outputDir: await makeOutputDir(),
        routeId: "route_1",
        name: "Missing elevation",
        points: [{ distanceM: 0, lng: 104.1, lat: 30.6 }],
      }),
    ).rejects.toThrow(/elevation/i);
  });

  it("allows missing elevation when requested and marks the GPX as not strava compatible", async () => {
    const outputDir = await makeOutputDir();

    const result = await writeGpxRoute({
      outputDir,
      routeId: "route_1",
      name: "Partial elevation",
      points: [{ distanceM: 0, lng: 104.1, lat: 30.6 }],
      allowMissingElevation: true,
    });

    const xml = await readFile(result.gpxPath, "utf8");
    expect(xml).toContain('<trkpt lat="30.6" lon="104.1">');
    expect(xml).not.toContain("<ele>");
    expect(result.stravaCompatible).toBe(false);
  });
});
