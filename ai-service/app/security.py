"""Internal-key auth dependency (Section 8.1)."""

from __future__ import annotations

import secrets

from fastapi import Header

from app.config import settings
from app.errors import AppError


def verify_internal_key(x_internal_key: str | None = Header(default=None)) -> None:
    expected = settings.INTERNAL_API_KEY
    if not x_internal_key or not secrets.compare_digest(x_internal_key, expected):
        raise AppError("UNAUTHORISED", "Missing or invalid internal key.", 401)
