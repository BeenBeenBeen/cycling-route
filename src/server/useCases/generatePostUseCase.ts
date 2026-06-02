import { generatedPostSchema, type GeneratedPost } from "../domain/generatedPost";
import { parseRouteInput, type RouteInput } from "../domain/routeInput";

export type GeneratePost = (route: RouteInput) => Promise<GeneratedPost>;

export const createGeneratePostUseCase =
  ({ generatePost }: { generatePost: GeneratePost }) =>
  async (input: unknown): Promise<GeneratedPost> => {
    const route = parseRouteInput(input);
    const post = await generatePost(route);
    return generatedPostSchema.parse(post);
  };
