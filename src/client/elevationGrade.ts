import type { ElevationPoint } from "./api/publishingApi";

export type ElevationPointWithGrade = ElevationPoint & {
  ele: number;
  gradePercent: number;
};

const GRADE_WINDOW_M = 500;

const calculateRegressionGrade = (
  points: Array<ElevationPoint & { ele: number }>,
): number | null => {
  if (points.length < 2) {
    return null;
  }

  const meanDistance = points.reduce((sum, point) => sum + point.distanceM, 0) / points.length;
  const meanElevation = points.reduce((sum, point) => sum + point.ele, 0) / points.length;
  const { covariance, distanceVariance } = points.reduce(
    (result, point) => {
      const distanceDelta = point.distanceM - meanDistance;
      return {
        covariance: result.covariance + distanceDelta * (point.ele - meanElevation),
        distanceVariance: result.distanceVariance + distanceDelta ** 2,
      };
    },
    { covariance: 0, distanceVariance: 0 },
  );

  return distanceVariance === 0 ? null : (covariance / distanceVariance) * 100;
};

const calculateFallbackGrade = (
  points: Array<ElevationPoint & { ele: number }>,
  index: number,
): number => {
  const from = points[Math.max(0, index - 1)];
  const to = points[Math.min(points.length - 1, index + 1)];
  const distanceDelta = to.distanceM - from.distanceM;
  return distanceDelta <= 0 ? 0 : ((to.ele - from.ele) / distanceDelta) * 100;
};

export const calculateElevationGrades = (
  points: ElevationPoint[],
): ElevationPointWithGrade[] => {
  const validPoints = points
    .filter(
      (point): point is ElevationPoint & { ele: number } =>
        typeof point.ele === "number" && Number.isFinite(point.ele),
    )
    .slice()
    .sort((left, right) => left.distanceM - right.distanceM);

  if (validPoints.length === 0) {
    return [];
  }

  const routeStartM = validPoints[0].distanceM;
  const routeEndM = validPoints[validPoints.length - 1].distanceM;
  const routeSpanM = routeEndM - routeStartM;

  return validPoints.map((point, index) => {
    const windowLengthM = Math.min(GRADE_WINDOW_M, routeSpanM);
    const centeredStartM = point.distanceM - windowLengthM / 2;
    const windowStartM = Math.min(
      Math.max(centeredStartM, routeStartM),
      routeEndM - windowLengthM,
    );
    const windowEndM = windowStartM + windowLengthM;
    const windowPoints = validPoints.filter(
      (candidate) => candidate.distanceM >= windowStartM && candidate.distanceM <= windowEndM,
    );
    const regressionGrade = calculateRegressionGrade(windowPoints);

    return { ...point, gradePercent: regressionGrade ?? calculateFallbackGrade(validPoints, index) };
  });
};

export const calculateMaxElevationGrade = (points: ElevationPoint[]): number | null => {
  const grades = calculateElevationGrades(points);
  if (grades.length < 2) {
    return null;
  }

  return Math.max(0, ...grades.map((point) => point.gradePercent));
};

export const formatGrade = (gradePercent: number): string =>
  `${gradePercent.toFixed(1)}%`;
