export type AppMode = "development" | "deployment";

export const parsePort = (value: string | undefined): number => {
  const rawPort = value ?? "8787";
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Invalid PORT: must be an integer between 1 and 65535");
  }

  return port;
};

export const parseAppMode = (value: string | undefined): AppMode => {
  const normalized = value?.trim();

  if (normalized === undefined || normalized === "") {
    return "development";
  }

  if (normalized === "development" || normalized === "deployment") {
    return normalized;
  }

  throw new Error(
    "Invalid APP_MODE: must be development or deployment",
  );
};

export const resolveListenHost = (appMode: AppMode): string =>
  appMode === "deployment" ? "0.0.0.0" : "127.0.0.1";

export const resolveApiProxyTarget = (
  env: Record<string, string | undefined>,
) => `http://127.0.0.1:${parsePort(env.PORT)}`;
