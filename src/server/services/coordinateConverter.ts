import type { Coordinate } from "../domain/placeCandidate";

// GCJ-02 transform constants used by Chinese map providers.
const A = 6378245.0;
const EE = 0.00669342162296594323;

const outOfChina = ({ lng, lat }: Coordinate): boolean =>
  lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;

const transformLat = (lng: number, lat: number): number => {
  let result =
    -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat;
  result += 0.2 * Math.sqrt(Math.abs(lng));
  result +=
    ((20.0 * Math.sin(6.0 * lng * Math.PI) +
      20.0 * Math.sin(2.0 * lng * Math.PI)) *
      2.0) /
    3.0;
  result +=
    ((20.0 * Math.sin(lat * Math.PI) +
      40.0 * Math.sin((lat / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  result +=
    ((160.0 * Math.sin((lat / 12.0) * Math.PI) +
      320 * Math.sin((lat * Math.PI) / 30.0)) *
      2.0) /
    3.0;
  return result;
};

const transformLng = (lng: number, lat: number): number => {
  let result =
    300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat;
  result += 0.1 * Math.sqrt(Math.abs(lng));
  result +=
    ((20.0 * Math.sin(6.0 * lng * Math.PI) +
      20.0 * Math.sin(2.0 * lng * Math.PI)) *
      2.0) /
    3.0;
  result +=
    ((20.0 * Math.sin(lng * Math.PI) +
      40.0 * Math.sin((lng / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  result +=
    ((150.0 * Math.sin((lng / 12.0) * Math.PI) +
      300.0 * Math.sin((lng / 30.0) * Math.PI)) *
      2.0) /
    3.0;
  return result;
};

export const gcj02ToWgs84 = (point: Coordinate): Coordinate => {
  if (outOfChina(point)) {
    return point;
  }

  let dLat = transformLat(point.lng - 105.0, point.lat - 35.0);
  let dLng = transformLng(point.lng - 105.0, point.lat - 35.0);
  const radLat = (point.lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * Math.PI);
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * Math.PI);

  return {
    lng: point.lng * 2 - (point.lng + dLng),
    lat: point.lat * 2 - (point.lat + dLat),
  };
};

export const convertPolylineGcj02ToWgs84 = (points: Coordinate[]): Coordinate[] =>
  points.map(gcj02ToWgs84);

export type { Coordinate };
