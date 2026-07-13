// structured dev logger — silent in production builds so the console stays clean for visitors

type LogData = Record<string, unknown>;

function fmt(data?: LogData): string {
  if (!data) return "";
  return Object.entries(data)
    .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(" ");
}

export function logDebug(event: string, data?: LogData): void {
  if (process.env.NODE_ENV === "production") return;
  console.debug(`[site] ${event} ${fmt(data)}`.trimEnd());
}

export function logError(event: string, error: unknown, data?: LogData): void {
  // errors always log, even in production — they're the diagnostic trail
  console.error(`[site] ${event} ${fmt(data)}`.trimEnd(), error);
}
