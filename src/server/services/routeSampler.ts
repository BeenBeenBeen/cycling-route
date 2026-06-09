import type { Coordinate } from "../domain/placeCandidate";

export type RouteSample = Coordinate & {
  distanceM: number;
};

const EARTH_RADIUS_M = 6_371_000;
const EPSILON_M = 1e-9;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const haversineDistanceM = (from: Coordinate, to: Coordinate): number => {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const interpolate = (
  from: Coordinate,
  to: Coordinate,
  ratio: number,
): Coordinate => ({
  lng: from.lng + (to.lng - from.lng) * ratio,
  lat: from.lat + (to.lat - from.lat) * ratio,
});

export const sampleRouteEveryMeters = (
  points: Coordinate[],
  intervalM: number,
): RouteSample[] => {
  if (intervalM <= 0) {
    throw new Error("Sample interval must be greater than 0 meters.");
  }

  if (points.length < 1) {
    throw new Error("Route must contain at least one point.");
  }

  if (points.length === 1) {
    return [{ distanceM: 0, ...points[0] }];
  }

  const samples: RouteSample[] = [{ distanceM: 0, ...points[0] }];
  let distanceAtSegmentStartM = 0;
  let nextSampleDistanceM = intervalM;

  for (let index = 1; index < points.length; index += 1) {
    const segmentStart = points[index - 1];
    const segmentEnd = points[index];
    const segmentDistanceM = haversineDistanceM(segmentStart, segmentEnd);
    const distanceAtSegmentEndM = distanceAtSegmentStartM + segmentDistanceM;

    if (segmentDistanceM <= EPSILON_M) {
      distanceAtSegmentStartM = distanceAtSegmentEndM;
      continue;
    }

    while (nextSampleDistanceM <= distanceAtSegmentStartM + EPSILON_M) {
      nextSampleDistanceM += intervalM;
    }

    while (nextSampleDistanceM < distanceAtSegmentEndM - EPSILON_M) {
      const ratio =
        (nextSampleDistanceM - distanceAtSegmentStartM) / segmentDistanceM;
      // Interpolate along short route segments; this is accurate enough for 100m elevation samples.
      const point = interpolate(segmentStart, segmentEnd, ratio);

      samples.push({ distanceM: nextSampleDistanceM, ...point });
      nextSampleDistanceM += intervalM;
    }

    distanceAtSegmentStartM = distanceAtSegmentEndM;
  }

  const finalPoint = points.at(-1);
  if (!finalPoint) {
    return samples;
  }

  samples.push({ distanceM: distanceAtSegmentStartM, ...finalPoint });

  return samples;
};
