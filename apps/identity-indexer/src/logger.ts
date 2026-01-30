interface LogPayload {
  event: string;
  data?: unknown;
}

function format(payload: LogPayload): string {
  if (payload.data === undefined) return payload.event;
  return `${payload.event}\n${JSON.stringify(payload.data, null, 2)}`;
}

function write(
  level: "info" | "warn" | "error",
  event: string,
  data?: unknown
): void {
  const message = format({ event, data });
  if (level === "info") console.log(message);
  if (level === "warn") console.warn(message);
  if (level === "error") console.error(message);
}

export const log = {
  info(event: string, data?: unknown) {
    write("info", event, data);
  },
  warn(event: string, data?: unknown) {
    write("warn", event, data);
  },
  error(event: string, data?: unknown) {
    write("error", event, data);
  }
};
