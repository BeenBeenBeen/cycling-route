import { describe, expect, it, vi } from "vitest";
import { createMediaRoutesHandler } from "../../src/server/routes/mediaRoutesRoute";

describe("createMediaRoutesHandler", () => {
  it("downloads a GPX file from the routes directory", async () => {
    const handler = createMediaRoutesHandler({ routesDir: "data/routes" });
    const { req, res } = mockHttp("test.gpx");

    await handler(req as any, res as any, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.downloadPath).toBe("data/routes/test.gpx");
    expect(res.downloadFilename).toBe("test.gpx");
  });

  it("rejects path traversal filenames", async () => {
    const handler = createMediaRoutesHandler({ routesDir: "data/routes" });
    const { req, res } = mockHttp("../secret.gpx");

    await handler(req as any, res as any, vi.fn());

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid route filename" });
    expect(res.download).not.toHaveBeenCalled();
  });

  it("rejects non-GPX filenames", async () => {
    const handler = createMediaRoutesHandler({ routesDir: "data/routes" });
    const { req, res } = mockHttp("test.txt");

    await handler(req as any, res as any, vi.fn());

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid route filename" });
    expect(res.download).not.toHaveBeenCalled();
  });

  it("returns 404 when the GPX file does not exist", async () => {
    const handler = createMediaRoutesHandler({ routesDir: "data/routes" });
    const { req, res } = mockHttp("missing.gpx", new Error("not found"));

    await handler(req as any, res as any, vi.fn());

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Route GPX not found" });
  });
});

const mockHttp = (filename: string, downloadError?: Error) => {
  const req = { params: { filename } };
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    downloadPath: undefined as string | undefined,
    downloadFilename: undefined as string | undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    download: vi.fn(function (
      this: any,
      filePath: string,
      filename: string,
      callback?: (error?: Error) => void,
    ) {
      this.downloadPath = filePath;
      this.downloadFilename = filename;
      callback?.(downloadError);
      return this;
    }),
  };

  return { req, res };
};
