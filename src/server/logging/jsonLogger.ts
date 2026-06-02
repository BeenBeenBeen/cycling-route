type LogLevel = "debug" | "info" | "warn" | "error";
type Sink = (line: string) => void;

const sensitivePattern =
  /authorization|cookie|set-cookie|x-api-key|apikey|openaiapikey|password|token|secret|code/i;
const omittedBinaryPattern = /b64json|base64|imagebase64|imagedata/i;

type RedactOptions = {
  maxSerializedBytes?: number;
};

const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, "");

const truncateSerializedValue = (value: unknown, maxSerializedBytes?: number) => {
  if (!maxSerializedBytes) {
    return value;
  }

  const serialized = JSON.stringify(value);
  if (Buffer.byteLength(serialized) <= maxSerializedBytes) {
    return value;
  }

  return {
    truncated: true,
    preview: serialized.slice(0, maxSerializedBytes),
  };
};

export const redactValue = (
  value: unknown,
  options: RedactOptions = {},
): unknown => {
  const redact = (item: unknown): unknown => {
    if (Array.isArray(item)) {
      return item.map(redact);
    }

    if (item && typeof item === "object") {
      return Object.fromEntries(
        Object.entries(item).map(([key, child]) => {
          const normalizedKey = normalizeKey(key);

          if (sensitivePattern.test(normalizedKey)) {
            return [key, "[redacted]"];
          }

          if (omittedBinaryPattern.test(normalizedKey)) {
            return [key, "[omitted]"];
          }

          return [key, redact(child)];
        }),
      );
    }

    if (typeof item === "string" && item.length > 512) {
      return `${item.slice(0, 512)}...`;
    }

    return item;
  };

  return truncateSerializedValue(redact(value), options.maxSerializedBytes);
};

export const createJsonLogger = ({
  sink = console.log,
}: { sink?: Sink } = {}) => {
  const write = (
    level: LogLevel,
    event: string,
    fields: Record<string, unknown> = {},
  ) => {
    const redactedFields = redactValue(fields, {
      maxSerializedBytes: 8 * 1024,
    }) as Record<string, unknown>;

    sink(
      JSON.stringify({
        ...redactedFields,
        time: new Date().toISOString(),
        level,
        event,
      }),
    );
  };

  return {
    debug: (event: string, fields?: Record<string, unknown>) =>
      write("debug", event, fields),
    info: (event: string, fields?: Record<string, unknown>) =>
      write("info", event, fields),
    warn: (event: string, fields?: Record<string, unknown>) =>
      write("warn", event, fields),
    error: (event: string, fields?: Record<string, unknown>) =>
      write("error", event, fields),
  };
};

export type JsonLogger = ReturnType<typeof createJsonLogger>;
