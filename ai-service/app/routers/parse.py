"""Tabular parsing router: /parse/tabular (Section 8.2)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.concurrency import run_in_threadpool

from app.schemas import TabularResponse
from app.security import verify_internal_key
from app.services.file_safety import ROW_CAP_TABULAR, sanitise_filename, validate_upload
from app.services.parser import parse_file

router = APIRouter(dependencies=[Depends(verify_internal_key)])


def _parse_sync(filename: str, data: bytes) -> TabularResponse:
    safe = sanitise_filename(filename)
    validate_upload(safe, data, tabular_only=True)
    units = parse_file(safe, data, row_cap=ROW_CAP_TABULAR)
    if not units:
        return TabularResponse(columns=[], rows=[])

    rows: list[dict[str, str]] = []
    columns: list[str] = []
    for unit in units:
        for line in unit.text.split("\n"):
            record: dict[str, str] = {}
            for part in line.split("; "):
                if ": " in part:
                    key, _, value = part.partition(": ")
                    record[key.strip()] = value.strip()
                    if key.strip() not in columns:
                        columns.append(key.strip())
            if record:
                rows.append(record)
    return TabularResponse(columns=columns, rows=rows)


@router.post("/parse/tabular", response_model=TabularResponse)
async def parse_tabular(file: UploadFile = File(...)) -> TabularResponse:
    data = await file.read()
    return await run_in_threadpool(_parse_sync, file.filename or "upload", data)
