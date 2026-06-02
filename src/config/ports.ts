export const parsePort = (value: string | undefined): number => {
  const rawPort = value ?? "8787";
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Invalid PORT: must be an integer between 1 and 65535");
  }

  return port;
};

export const resolveApiProxyTarget = (
  env: Record<string, string | undefined>,
) => `http://127.0.0.1:${parsePort(env.PORT)}`;
