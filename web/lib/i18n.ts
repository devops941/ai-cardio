// Lightweight typed i18n helper (D22).

import { messages } from "@/messages/en";

export function t(path: string, params?: Record<string, string | number>): string {
  const parts = path.split(".");
  let node: unknown = messages;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return path;
    node = (node as Record<string, unknown>)[part];
  }
  const resolved = typeof node === "string" ? node : path;
  if (!params) return resolved;
  return resolved.replace(/\{(\w+)\}/g, (_, key) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}

export { messages };
