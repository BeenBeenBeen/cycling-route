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
  const routeLine = `${route.startPoint} TO ${route.endPoint}`.toUpperCase();

  return `
<svg width="1080" height="1440" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.20"/>
      <stop offset="38%" stop-color="#000" stop-opacity="0.06"/>
      <stop offset="72%" stop-color="#000" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.42"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1440" fill="url(#shade)"/>
  <path d="M86 865 C290 785 420 962 612 874 S856 780 1016 848" fill="none" stroke="#f6c46b" stroke-width="10" stroke-linecap="round" stroke-opacity="0.82"/>
  <path d="M96 890 C306 812 430 984 626 900 S842 818 982 878" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-opacity="0.72"/>

  <text x="72" y="118" fill="#ffffff" font-size="34" font-weight="800" font-family="Arial, sans-serif" letter-spacing="0">CHENGDU CYCLING</text>
  <text x="72" y="158" fill="#ffffff" font-size="24" font-weight="700" font-family="Arial, sans-serif" letter-spacing="0">ROUTE POSTER</text>

  <text x="72" y="352" fill="#ffffff" font-size="104" font-weight="900" font-family="Arial, 'Microsoft YaHei', sans-serif" letter-spacing="0">${escapeXml(coverTitle)}</text>
  <text x="76" y="430" fill="#ffffff" font-size="42" font-weight="700" font-family="Arial, 'Microsoft YaHei', sans-serif" letter-spacing="0">${escapeXml(coverSubtitle)}</text>

  <text x="72" y="1048" fill="#ffffff" font-size="54" font-weight="900" font-family="Arial, sans-serif" letter-spacing="0">${facts.map(escapeXml).join("  /  ")}</text>
  <line x1="72" y1="1084" x2="560" y2="1084" stroke="#ffffff" stroke-width="4" stroke-opacity="0.8"/>
  <text x="72" y="1150" fill="#ffffff" font-size="36" font-weight="800" font-family="Arial, sans-serif" letter-spacing="0">${escapeXml(routeLine)}</text>
  <text x="72" y="1214" fill="#ffffff" font-size="32" font-weight="700" font-family="Arial, 'Microsoft YaHei', sans-serif" letter-spacing="0">${escapeXml(route.routeName)}</text>
  <text x="72" y="1346" fill="#ffffff" font-size="28" font-weight="700" font-family="Arial, sans-serif" letter-spacing="0">THE CYCLES CLUB STYLE / RIDE CHENGDU</text>
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
