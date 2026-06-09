import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ElevationPoint } from "../domain/elevationProfile";

export type WriteGpxRouteInput = {
  outputDir: string;
  routeId: string;
  name: string;
  points: ElevationPoint[];
  allowMissingElevation?: boolean;
};

export type WriteGpxRouteResult = {
  gpxPath: string;
  gpxUrl: string;
  stravaCompatible: boolean;
};

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const slugifyFilename = (value: string): string => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "route";
};

const formatPoint = (
  point: ElevationPoint,
  allowMissingElevation: boolean,
): string => {
  const elevationXml =
    point.ele === undefined ? "" : `\n        <ele>${point.ele}</ele>`;

  if (point.ele === undefined && allowMissingElevation) {
    return `      <trkpt lat="${point.lat}" lon="${point.lng}"></trkpt>`;
  }

  return `      <trkpt lat="${point.lat}" lon="${point.lng}">${elevationXml}\n      </trkpt>`;
};

const buildGpxXml = (input: WriteGpxRouteInput): string => {
  const allowMissingElevation = input.allowMissingElevation === true;
  const trackPoints = input.points
    .map((point) => formatPoint(point, allowMissingElevation))
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="cycling-route" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${escapeXml(input.name)}</name>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>
`;
};

export const writeGpxRoute = async (
  input: WriteGpxRouteInput,
): Promise<WriteGpxRouteResult> => {
  if (input.points.length === 0) {
    throw new Error("Cannot write GPX route without points.");
  }

  const hasMissingElevation = input.points.some((point) => point.ele === undefined);
  if (hasMissingElevation && input.allowMissingElevation !== true) {
    throw new Error("Cannot write Strava-compatible GPX with missing elevation.");
  }

  const filename = `${slugifyFilename(input.routeId)}.gpx`;
  const gpxPath = join(input.outputDir, filename);
  const xml = buildGpxXml(input);

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(gpxPath, xml, "utf8");

  return {
    gpxPath,
    gpxUrl: `/media/routes/${filename}`,
    stravaCompatible: !hasMissingElevation,
  };
};
