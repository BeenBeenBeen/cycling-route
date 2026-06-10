import { describe, expect, it } from "vitest";
import {
  calculateElevationGrades,
  calculateMaxElevationGrade,
} from "../../src/client/elevationGrade";

const noisyFivePercentClimb = [
  { distanceM: 0, lng: 104.01, lat: 30.75, ele: 500 },
  { distanceM: 100, lng: 104.02, lat: 30.76, ele: 505 },
  { distanceM: 200, lng: 104.03, lat: 30.77, ele: 520 },
  { distanceM: 300, lng: 104.04, lat: 30.78, ele: 515 },
  { distanceM: 400, lng: 104.05, lat: 30.79, ele: 520 },
  { distanceM: 500, lng: 104.06, lat: 30.8, ele: 525 },
];

describe("elevation grade", () => {
  it("uses a regression window to suppress single-sample elevation noise", () => {
    const grades = calculateElevationGrades(noisyFivePercentClimb);

    expect(grades).toHaveLength(noisyFivePercentClimb.length);
    grades.forEach((point) => expect(point.gradePercent).toBeCloseTo(4.7, 1));
  });

  it("uses surrounding samples for sparse points and ignores invalid samples", () => {
    const sparsePoints = [
      { distanceM: 0, lng: 104.01, lat: 30.75, ele: 480 },
      { distanceM: 5_000, lng: 104.02, lat: 30.76, ele: 620 },
      { distanceM: 7_500, lng: 104.025, lat: 30.765 },
      { distanceM: 10_000, lng: 104.03, lat: 30.77, ele: 540 },
    ];

    expect(calculateElevationGrades(sparsePoints)[1].gradePercent).toBeCloseTo(0.6, 5);
    expect(calculateMaxElevationGrade(sparsePoints)).toBeCloseTo(2.8, 5);
  });

  it("returns null when there are not enough valid samples", () => {
    expect(calculateMaxElevationGrade([
      { distanceM: 0, lng: 104.01, lat: 30.75, ele: 480 },
      { distanceM: 100, lng: 104.02, lat: 30.76 },
    ])).toBeNull();
  });
});
