import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { RouteInput } from "../domain/routeInput";

export type ComposeCoverPosterInput = {
  backgroundPath: string;
  route: RouteInput;
  coverTitle: string;
  coverSubtitle: string;
  outputDir?: string;
};

export type ComposeCoverPosterResult = {
  coverPath: string;
  coverUrl: string;
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const slugify = (value: string) =>
  value
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const createOverlaySvg = ({
  route,
  coverTitle,
  coverSubtitle,
}: Pick<ComposeCoverPosterInput, "route" | "coverTitle" | "coverSubtitle">) => {
  const facts = [
    `${route.distanceKm} km`,
    `${route.elevationGainM} m`,
    route.difficulty,
  ];

  return `
<svg width="1080" height="1440" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.08"/>
      <stop offset="72%" stop-color="#000" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.72"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1440" fill="url(#shade)"/>
  <rect x="72" y="988" width="936" height="294" rx="0" fill="#101828" fill-opacity="0.72"/>
  <text x="96" y="1085" fill="#ffffff" font-size="72" font-weight="800" font-family="Arial, sans-serif">${escapeXml(coverTitle)}</text>
  <text x="96" y="1145" fill="#f2f4f7" font-size="34" font-weight="600" font-family="Arial, sans-serif">${escapeXml(coverSubtitle)}</text>
  <text x="96" y="1218" fill="#ffffff" font-size="42" font-weight="700" font-family="Arial, sans-serif">${facts.map(escapeXml).join("  /  ")}</text>
  <text x="96" y="1274" fill="#f2f4f7" font-size="32" font-weight="600" font-family="Arial, sans-serif">${escapeXml(route.startPoint)} → ${escapeXml(route.endPoint)}</text>
  <text x="96" y="1340" fill="#ff6b2c" font-size="28" font-weight="700" font-family="Arial, sans-serif">${escapeXml(route.routeName)}</text>
</svg>`;
};

export const composeCoverPoster = async ({
  backgroundPath,
  route,
  coverTitle,
  coverSubtitle,
  outputDir = path.join(process.cwd(), "data", "images"),
}: ComposeCoverPosterInput): Promise<ComposeCoverPosterResult> => {
  await mkdir(outputDir, { recursive: true });

  const overlay = Buffer.from(createOverlaySvg({ route, coverTitle, coverSubtitle }));
  const filename = `cover-${Date.now()}-${slugify(route.routeName) || "route"}.png`;
  const coverPath = path.join(outputDir, filename);

  await sharp(backgroundPath)
    .resize(1080, 1440, { fit: "cover" })
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toFile(coverPath);

  return { coverPath, coverUrl: `/media/images/${filename}` };
};
