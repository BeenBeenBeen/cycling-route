import { describe, expect, it } from "vitest";
import { wgs84ToGcj02 } from "../../src/client/coordinateConverter";
import { gcj02ToWgs84 } from "../../src/server/services/coordinateConverter";

describe("wgs84ToGcj02", () => {
  it("round-trips a Chengdu coordinate with the existing GCJ-02 converter", () => {
    const gcj02 = { lng: 104.141, lat: 30.63 };
    const converted = wgs84ToGcj02(gcj02ToWgs84(gcj02));

    expect(converted.lng).toBeCloseTo(gcj02.lng, 5);
    expect(converted.lat).toBeCloseTo(gcj02.lat, 5);
  });

  it("leaves coordinates outside China unchanged", () => {
    expect(wgs84ToGcj02({ lng: 2.3522, lat: 48.8566 })).toEqual({
      lng: 2.3522,
      lat: 48.8566,
    });
  });
});
