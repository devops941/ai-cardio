// Error envelope and helpers (Section 10.4).

import { NextResponse } from "next/server";

export type ErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHORISED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "AI_SERVICE_UNAVAILABLE"
  | "LLM_UNAVAILABLE"
  | "DATABASE_UNAVAILABLE"
  | "NO_ACTIVE_MODEL"
  | "MODEL_VERSION_NOT_FOUND"
  | "DATASET_INVALID"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FILE_TYPE"
  | "FILE_SIGNATURE_MISMATCH"
  | "DOC_CONVERSION_UNAVAILABLE"
  | "NO_EXTRACTABLE_TEXT"
  | "CONFLICT"
  | "LAST_ACTIVE_MODEL"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  code: ErrorCode;
  status: number;
  details?: unknown;

  constructor(code: ErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  const error: Record<string, unknown> = { code, message };
  if (details !== undefined) error.details = details;
  return NextResponse.json({ error }, { status });
}

export function fromAppError(err: AppError): NextResponse {
  return errorResponse(err.code, err.message, err.status, err.details);
}

export function jsonError(
  err: unknown,
  fallbackMessage = "Something went wrong on the server.",
): NextResponse {
  if (err instanceof AppError) return fromAppError(err);
  if (err instanceof Error) {
    if (/PrismaClientInitializationError|PrismaClientKnownRequestError/.test(err.name)) {
      return errorResponse(
        "DATABASE_UNAVAILABLE",
        "The database is not reachable. Please try again shortly.",
        503,
      );
    }
  }
  console.error("Unhandled route error:", err);
  return errorResponse("INTERNAL_ERROR", fallbackMessage, 500);
}

export function isDatabaseError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    typeof (err as { name: unknown }).name === "string" &&
    /PrismaClientInitializationError|PrismaClientKnownRequestError/.test(
      (err as { name: string }).name,
    )
  );
}
