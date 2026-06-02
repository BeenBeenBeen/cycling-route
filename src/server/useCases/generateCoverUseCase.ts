import {
  coverPosterRequestSchema,
  type CoverPosterRequest,
} from "../domain/coverPoster";
import type {
  ComposeCoverPosterInput,
  ComposeCoverPosterResult,
} from "../services/coverPosterComposer";

export type GenerateBackground = (imagePrompt: string) => Promise<string>;
export type ComposeCover = (
  input: Omit<ComposeCoverPosterInput, "outputDir">,
) => Promise<ComposeCoverPosterResult>;

export type GenerateCoverDependencies = {
  generateBackground: GenerateBackground;
  composeCover: ComposeCover;
};

export const createGenerateCoverUseCase =
  ({ generateBackground, composeCover }: GenerateCoverDependencies) =>
  async (input: unknown): Promise<ComposeCoverPosterResult> => {
    const request: CoverPosterRequest = coverPosterRequestSchema.parse(input);

    let backgroundPath: string;
    try {
      backgroundPath = await generateBackground(request.imagePrompt);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate cover background: ${message}`);
    }

    try {
      return await composeCover({
        backgroundPath,
        route: request.route,
        coverTitle: request.coverTitle,
        coverSubtitle: request.coverSubtitle,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to compose cover poster: ${message}`);
    }
  };
