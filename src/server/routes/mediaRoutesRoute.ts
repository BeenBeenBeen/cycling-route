import { join } from "node:path";
import type { RequestHandler } from "express";

type MediaRoutesOptions = {
  routesDir?: string;
};

const isSafeGpxFilename = (filename: string): boolean =>
  /^[A-Za-z0-9][A-Za-z0-9._-]*\.gpx$/.test(filename);

export const createMediaRoutesHandler =
  ({ routesDir = "data/routes" }: MediaRoutesOptions = {}): RequestHandler<{
    filename: string;
  }> =>
  async (req, res) => {
    const filename = req.params.filename ?? "";
    if (!isSafeGpxFilename(filename)) {
      res.status(400).json({ error: "Invalid route filename" });
      return;
    }

    const filePath = join(routesDir, filename);
    res.download(filePath, filename, (error?: Error) => {
      if (!error || res.headersSent) {
        return;
      }

      res.status(404).json({ error: "Route GPX not found" });
    });
  };
