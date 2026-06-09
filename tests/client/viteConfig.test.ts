import { describe, expect, it } from "vitest";
import { resolveApiProxyTarget } from "../../src/config/ports";
import viteConfig from "../../vite.config";

describe("resolveApiProxyTarget", () => {
  it("uses the configured backend port", () => {
    expect(resolveApiProxyTarget({ PORT: "8788" })).toBe("http://127.0.0.1:8788");
  });

  it("uses 8787 by default", () => {
    expect(resolveApiProxyTarget({})).toBe("http://127.0.0.1:8787");
  });

  it("proxies generated media requests to the backend in development", async () => {
    const config =
      typeof viteConfig === "function"
        ? await viteConfig({ mode: "test", command: "serve" } as any)
        : viteConfig;

    expect(config.server?.proxy).toMatchObject({
      "/api": "http://127.0.0.1:8787",
      "/media": "http://127.0.0.1:8787",
    });
  });

  it("binds the dev server to localhost by default", async () => {
    const config =
      typeof viteConfig === "function"
        ? await viteConfig({ mode: "test", command: "serve" } as any)
        : viteConfig;

    expect(config.server?.host).toBe("127.0.0.1");
  });

  it("binds the dev server to all interfaces in deployment mode", async () => {
    const previousEnv = { ...process.env };
    process.env.APP_MODE = "deployment";

    const config =
      typeof viteConfig === "function"
        ? await viteConfig({ mode: "test", command: "serve" } as any)
        : viteConfig;

    expect(config.server?.host).toBe("0.0.0.0");

    process.env = previousEnv;
  });
});
