// Thin client-side fetch helper for the JSON API envelope.

export interface ApiError {
  code: string;
  message: string;
  details?: { field: string; issue: string }[];
}

export class ApiRequestError extends Error {
  code: string;
  status: number;
  details?: { field: string; issue: string }[];

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...(init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      body?.error ?? { code: "UNKNOWN", message: "Request failed" },
    );
  }
  return body as T;
}
