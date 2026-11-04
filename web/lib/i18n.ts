// Lightweight typed i18n helper (D22).

import { messages } from "@/messages/en";

export function t(path: string): string {
  const parts = path.split(".");
  let node: unknown = messages;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return path;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : path;
}

export { messages };
