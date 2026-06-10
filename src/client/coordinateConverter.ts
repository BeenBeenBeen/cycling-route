import type { Coordinate } from "./api/publishingApi";

const A = 6378245.0;
const EE = 0.00669342162296594323;

const outOfChina = ({ lng, lat }: Coordinate): boolean =>
  lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;

const transformLat = (lng: number, lat: number): number => {
  let result = -100 + 2 * lng + 3 * lat + 0.2 * lat ** 2 + 0.1 * lng * lat;
  result += 0.2 * Math.sqrt(Math.abs(lng));
  result += ((20 * Math.sin(6 * lng * Math.PI) + 20 * Math.sin(2 * lng * Math.PI)) * 2) / 3;
  result += ((20 * Math.sin(lat * Math.PI) + 40 * Math.sin((lat / 3) * Math.PI)) * 2) / 3;
  result += ((160 * Math.sin((lat / 12) * Math.PI) + 320 * Math.sin((lat * Math.PI) / 30)) * 2) / 3;
  return result;
};

const transformLng = (lng: number, lat: number): number => {
  let result = 300 + lng + 2 * lat + 0.1 * lng ** 2 + 0.1 * lng * lat;
  result += 0.1 * Math.sqrt(Math.abs(lng));
  result += ((20 * Math.sin(6 * lng * Math.PI) + 20 * Math.sin(2 * lng * Math.PI)) * 2) / 3;
  result += ((20 * Math.sin(lng * Math.PI) + 40 * Math.sin((lng / 3) * Math.PI)) * 2) / 3;
  result += ((150 * Math.sin((lng / 12) * Math.PI) + 300 * Math.sin((lng / 30) * Math.PI)) * 2) / 3;
  return result;
};

export const wgs84ToGcj02 = (point: Coordinate): Coordinate => {
  if (outOfChina(point)) {
    return point;
  }

  let dLat = transformLat(point.lng - 105, point.lat - 35);
  let dLng = transformLng(point.lng - 105, point.lat - 35);
  const radLat = (point.lat / 180) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic ** 2;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180) / (((A * (1 - EE)) / (magic * sqrtMagic)) * Math.PI);
  dLng = (dLng * 180) / ((A / sqrtMagic) * Math.cos(radLat) * Math.PI);

  return { lng: point.lng + dLng, lat: point.lat + dLat };
};
