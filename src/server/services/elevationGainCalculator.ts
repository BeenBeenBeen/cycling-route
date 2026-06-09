import type { ElevationPoint } from "../domain/elevationProfile";

export const calculateElevationGainM = (
  points: Partial<ElevationPoint>[],
  thresholdM: number,
): number => {
  if (thresholdM < 0) {
    throw new Error("Elevation gain threshold must be greater than or equal to 0 meters.");
  }

  const elevations = points
    .map((point) => point.ele)
    .filter((ele): ele is number => typeof ele === "number" && Number.isFinite(ele));

  let gainM = 0;

  for (let index = 1; index < elevations.length; index += 1) {
    const deltaM = elevations[index] - elevations[index - 1];

    if (deltaM > 0 && deltaM >= thresholdM) {
      gainM += deltaM;
    }
  }

  return Math.round(gainM);
};
