"""ML router: /ml/train, /ml/versions, /ml/activate (Section 8.2)."""

from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.concurrency import run_in_threadpool

from app.errors import AppError
from app.schemas import ClinicalResponse  # noqa: F401  (kept for symmetry)
from app.security import verify_internal_key
from app.services import ml_model
from app.services.file_safety import validate_upload

router = APIRouter(prefix="/ml", dependencies=[Depends(verify_internal_key)])


def _train_sync(csv_bytes: bytes | None, filename: str | None) -> dict:
    if csv_bytes is None:
        return ml_model.train()
    safe = validate_upload(filename or "dataset.csv", csv_bytes, tabular_only=False)
    if not safe.endswith(".csv"):
        raise AppError("UNSUPPORTED_FILE_TYPE", "Training data must be a CSV.", 415)
    with tempfile.NamedTemporaryFile("wb", suffix=".csv", delete=False) as tmp:
        tmp.write(csv_bytes)
        tmp_path = Path(tmp.name)
    try:
        return ml_model.train(tmp_path)
    finally:
        tmp_path.unlink(missing_ok=True)


@router.post("/train")
async def train(file: UploadFile | None = File(default=None)) -> dict:
    csv_bytes = await file.read() if file is not None else None
    return await run_in_threadpool(_train_sync, csv_bytes, file.filename if file else None)


@router.get("/versions")
def versions() -> dict:
    return ml_model.list_versions()


@router.post("/activate/{version}")
def activate(version: int) -> dict:
    primary = ml_model.activate(version)
    return {"active_version": primary, "active_versions": ml_model.active_versions()}


@router.post("/deactivate/{version}")
def deactivate(version: int) -> dict:
    primary = ml_model.deactivate(version)  # raises AppError(LAST_ACTIVE_MODEL, 409) if last
    return {"active_version": primary, "active_versions": ml_model.active_versions()}
