import OpenAI from "openai";
import { fetch, ProxyAgent } from "undici";
import type { JsonLogger } from "../logging/jsonLogger";

export type OpenAIProxyConfig = {
  httpProxy?: string;
  httpsProxy?: string;
  allProxy?: string;
};

type Fetch = typeof globalThis.fetch;

const normalizeProxy = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const resolveProxyUrl = ({
  httpProxy,
  httpsProxy,
  allProxy,
}: OpenAIProxyConfig) =>
  normalizeProxy(httpsProxy) ?? normalizeProxy(allProxy) ?? normalizeProxy(httpProxy);

const headersToObject = (headers?: HeadersInit) => {
  if (!headers) {
    return undefined;
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers;
};

const parseBodyForLog = (body?: BodyInit | null) => {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body !== "string") {
    return `[${body.constructor.name} body]`;
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
};

const requestInfo = (input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    input instanceof Request
      ? input.url
      : input instanceof URL
        ? input.toString()
        : input.toString();
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();

  return { method, url: url.split("?")[0] };
};

const errorForLog = (error: unknown) => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  return { name: "Error", message: String(error) };
};

export const createLoggedFetch =
  (baseFetch: Fetch, logger: JsonLogger): Fetch =>
  async (input, init) => {
    const startedAt = Date.now();
    const { method, url } = requestInfo(input, init);

    logger.info("openai.request.started", {
      provider: "openai",
      method,
      url,
      requestHeaders: headersToObject(init?.headers),
      requestBody: parseBodyForLog(init?.body),
    });

    try {
      const response = await baseFetch(input, init);
      logger.info("openai.request.completed", {
        provider: "openai",
        method,
        url,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });
      return response;
    } catch (error) {
      logger.error("openai.request.failed", {
        provider: "openai",
        method,
        url,
        durationMs: Date.now() - startedAt,
        error: errorForLog(error),
      });
      throw error;
    }
  };

export const createOpenAIClient = (
  apiKey: string,
  proxyConfig: OpenAIProxyConfig,
  logger: JsonLogger,
) => {
  const proxyUrl = resolveProxyUrl(proxyConfig);
  const loggedFetch = createLoggedFetch(fetch as unknown as Fetch, logger);

  if (!proxyUrl) {
    return new OpenAI({ apiKey, fetch: loggedFetch });
  }

  const proxyAgent = new ProxyAgent(proxyUrl);

  return new OpenAI({
    apiKey,
    fetch: loggedFetch,
    fetchOptions: {
      dispatcher: proxyAgent,
    } as any,
  });
};
