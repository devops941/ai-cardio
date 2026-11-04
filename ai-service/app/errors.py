"""Error envelope and exception handlers (Section 8.1, 10.1)."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("cardiocare.ai")


class AppError(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status: int,
        details: Any | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status
        self.details = details


def envelope(code: str, message: str, details: Any | None = None) -> dict:
    err: dict[str, Any] = {"code": code, "message": message}
    if details is not None:
        err["details"] = details
    return {"error": err}


def _json(status: int, code: str, message: str, details: Any | None = None) -> JSONResponse:
    return JSONResponse(status_code=status, content=envelope(code, message, details))


def register_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError) -> JSONResponse:
        return _json(exc.status, exc.code, exc.message, exc.details)

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError) -> JSONResponse:
        details = []
        for err in exc.errors():
            loc = [str(p) for p in err.get("loc", []) if p not in ("body", "query")]
            details.append(
                {
                    "field": ".".join(loc) or "body",
                    "issue": err.get("type", "invalid"),
                }
            )
        first = details[0]["field"] if details else "request"
        return _json(422, "VALIDATION_FAILED", f"{first} is invalid.", details)

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        code = {401: "UNAUTHORISED", 404: "NOT_FOUND", 405: "METHOD_NOT_ALLOWED"}.get(
            exc.status_code, "INTERNAL_ERROR"
        )
        message = exc.detail if isinstance(exc.detail, str) else "Request failed."
        if exc.status_code == 401:
            message = "Missing or invalid internal key."
        return _json(exc.status_code, code, message)

    @app.exception_handler(Exception)
    async def _unexpected(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error: %s", type(exc).__name__)
        return _json(500, "INTERNAL_ERROR", "Something went wrong on the server.")
