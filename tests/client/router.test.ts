// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { routes } from "../../src/client/router";

describe("client router", () => {
  it("defines route planner, publisher, and default redirect", () => {
    expect(routes.map((route) => route.path)).toEqual(["/", "/route-planner", "/publisher"]);
    expect(routes[0]).toMatchObject({ path: "/", redirect: "/route-planner" });
  });
});
