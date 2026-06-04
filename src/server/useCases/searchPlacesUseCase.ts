import { z } from "zod";
import { placeCandidateSchema, type PlaceCandidate } from "../domain/placeCandidate";

export type SearchPlaces = (input: {
  query: string;
  city?: string;
  limit: number;
}) => Promise<PlaceCandidate[]>;

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

export const searchPlacesInputSchema = z.object({
  startQuery: z.string().trim().min(1),
  endQuery: z.string().trim().min(1),
  city: optionalText,
  limit: z.number().int().positive().max(10).default(5),
});

export const searchPlacesResultSchema = z.object({
  startCandidates: z.array(placeCandidateSchema),
  endCandidates: z.array(placeCandidateSchema),
});

export type SearchPlacesInput = z.input<typeof searchPlacesInputSchema>;
export type SearchPlacesResult = z.infer<typeof searchPlacesResultSchema>;
export type SearchPlacesUseCase = (
  input: SearchPlacesInput,
) => Promise<SearchPlacesResult>;

export const createSearchPlacesUseCase =
  ({ searchPlaces }: { searchPlaces: SearchPlaces }): SearchPlacesUseCase =>
  async (input) => {
    const request = searchPlacesInputSchema.parse(input);
    const [startCandidates, endCandidates] = await Promise.all([
      searchPlaces({
        query: request.startQuery,
        city: request.city,
        limit: request.limit,
      }),
      searchPlaces({
        query: request.endQuery,
        city: request.city,
        limit: request.limit,
      }),
    ]);

    return searchPlacesResultSchema.parse({ startCandidates, endCandidates });
  };
