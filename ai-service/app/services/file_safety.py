"""Upload safety checks (Section 8.3)."""

from __future__ import annotations

import io
import os
import re
import unicodedata
import zipfile

from app.config import settings
from app.errors import AppError

ALLOWED_EXT = {".pdf", ".docx", ".doc", ".xlsx", ".xls", ".csv", ".txt", ".md"}

_PDF_MAGIC = b"%PDF"
_ZIP_MAGIC = b"PK\x03\x04"
_OLE_MAGIC = b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"

MAX_ZIP_TOTAL = 200 * 1024 * 1024
MAX_ZIP_RATIO = 100
ROW_CAP_KB = 50_000
ROW_CAP_TABULAR = 5_000


def sanitise_filename(name: str) -> str:
    base = os.path.basename(name or "")
    base = base.replace("\\", "/").split("/")[-1]
    base = "".join(c for c in base if unicodedata.category(c)[0] != "C")
    base = re.sub(r"[^\w.\- ]", "_", base).strip()
    return base or "upload"


def extension_of(name: str) -> str:
    return os.path.splitext(name or "")[1].lower()


def validate_upload(filename: str, data: bytes, *, tabular_only: bool = False) -> str:
    ext = extension_of(filename)
    if ext not in ALLOWED_EXT:
        raise AppError(
            "UNSUPPORTED_FILE_TYPE",
            f"File type '{ext or 'unknown'}' is not allowed.",
            415,
        )
    if tabular_only and ext not in {".xlsx", ".xls", ".csv"}:
        raise AppError(
            "UNSUPPORTED_FILE_TYPE",
            "Only .xlsx, .xls and .csv files are accepted here.",
            415,
        )

    limit = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(data) > limit:
        raise AppError(
            "FILE_TOO_LARGE",
            f"File is larger than {settings.MAX_UPLOAD_MB} MB.",
            413,
        )
    if not data:
        raise AppError("FILE_SIGNATURE_MISMATCH", "File is empty.", 415)

    _check_signature(ext, data)
    if ext in {".docx", ".xlsx"}:
        _check_zip_safety(data)
    return ext


def _check_signature(ext: str, data: bytes) -> None:
    if ext == ".pdf":
        ok = data.startswith(_PDF_MAGIC)
    elif ext in {".docx", ".xlsx"}:
        ok = data.startswith(_ZIP_MAGIC)
    elif ext in {".doc", ".xls"}:
        ok = data.startswith(_OLE_MAGIC)
    else:  # txt, md, csv
        ok = b"\x00" not in data[:8192]
    if not ok:
        raise AppError(
            "FILE_SIGNATURE_MISMATCH",
            "The file content does not match its extension.",
            415,
        )


def _check_zip_safety(data: bytes) -> None:
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            total = 0
            for info in zf.infolist():
                total += info.file_size
                if total > MAX_ZIP_TOTAL:
                    raise AppError(
                        "FILE_TOO_LARGE",
                        "The archive expands to an unsafe size.",
                        413,
                    )
                if info.compress_size > 0:
                    ratio = info.file_size / info.compress_size
                    if ratio > MAX_ZIP_RATIO:
                        raise AppError(
                            "FILE_SIGNATURE_MISMATCH",
                            "The archive looks like a decompression bomb.",
                            415,
                        )
    except zipfile.BadZipFile as exc:
        raise AppError(
            "FILE_SIGNATURE_MISMATCH", "The archive is corrupt.", 415
        ) from exc
