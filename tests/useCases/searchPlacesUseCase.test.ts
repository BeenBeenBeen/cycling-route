import { describe, expect, it, vi } from "vitest";
import type { PlaceCandidate } from "../../src/server/domain/placeCandidate";
import { createSearchPlacesUseCase } from "../../src/server/useCases/searchPlacesUseCase";

const place = (id: string, name: string): PlaceCandidate => ({
  id,
  name,
  address: "成都市",
  city: "成都市",
  district: "郫都区",
  location: { gcj02: { lng: 104.01, lat: 30.67 } },
  source: "amap",
});

describe("createSearchPlacesUseCase", () => {
  it("searches start and end places with the default limit", async () => {
    const start = place("B001", "犀浦");
    const end = place("B002", "青城山");
    const searchPlaces = vi
      .fn()
      .mockResolvedValueOnce([start])
      .mockResolvedValueOnce([end]);
    const useCase = createSearchPlacesUseCase({ searchPlaces });

    await expect(
      useCase({ startQuery: "犀浦", endQuery: "青城山", city: "成都" }),
    ).resolves.toEqual({
      startCandidates: [start],
      endCandidates: [end],
    });

    expect(searchPlaces).toHaveBeenNthCalledWith(1, {
      query: "犀浦",
      city: "成都",
      limit: 5,
    });
    expect(searchPlaces).toHaveBeenNthCalledWith(2, {
      query: "青城山",
      city: "成都",
      limit: 5,
    });
  });

  it("accepts a custom limit up to ten", async () => {
    const searchPlaces = vi.fn().mockResolvedValue([]);
    const useCase = createSearchPlacesUseCase({ searchPlaces });

    await useCase({ startQuery: "犀浦", endQuery: "青城山", limit: 10 });

    expect(searchPlaces).toHaveBeenCalledWith({
      query: "犀浦",
      city: undefined,
      limit: 10,
    });
  });

  it("rejects invalid input before searching", async () => {
    const searchPlaces = vi.fn();
    const useCase = createSearchPlacesUseCase({ searchPlaces });

    await expect(
      useCase({ startQuery: "", endQuery: "青城山", limit: 11 }),
    ).rejects.toThrow();
    expect(searchPlaces).not.toHaveBeenCalled();
  });
});
