import { describe, expect, it } from "vitest";
import {
  convertPolylineGcj02ToWgs84,
  gcj02ToWgs84,
} from "../../src/server/services/coordinateConverter";

describe("gcj02ToWgs84", () => {
  it("converts Chengdu GCJ-02 coordinates to nearby WGS84 coordinates", () => {
    const result = gcj02ToWgs84({ lng: 104.141, lat: 30.63 });

    expect(result.lng).toBeGreaterThan(104.13);
    expect(result.lng).toBeLessThan(104.15);
    expect(result.lat).toBeGreaterThan(30.62);
    expect(result.lat).toBeLessThan(30.64);
    expect(result).not.toEqual({ lng: 104.141, lat: 30.63 });
  });

  it("leaves coordinates outside China unchanged", () => {
    expect(gcj02ToWgs84({ lng: 2.3522, lat: 48.8566 })).toEqual({
      lng: 2.3522,
      lat: 48.8566,
    });
  });
});

describe("convertPolylineGcj02ToWgs84", () => {
  it("converts each coordinate while preserving polyline order", () => {
    const result = convertPolylineGcj02ToWgs84([
      { lng: 104.141, lat: 30.63 },
      { lng: 2.3522, lat: 48.8566 },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).not.toEqual({ lng: 104.141, lat: 30.63 });
    expect(result[1]).toEqual({ lng: 2.3522, lat: 48.8566 });
  });
});
