"""Ingestion router: /ingest, /documents (Section 8.2)."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.concurrency import run_in_threadpool

from app.errors import AppError
from app.schemas import DeleteResponse, IngestResponse
from app.security import verify_internal_key
from app.services import vectorstore
from app.services.chunker import chunk_rows, chunk_text, clean_text
from app.services.embedder import embed
from app.services.file_safety import sanitise_filename, validate_upload
from app.services.parser import parse_file

logger = logging.getLogger("cardiocare.ai.ingest")

router = APIRouter(dependencies=[Depends(verify_internal_key)])


def _ingest_sync(document_id: str, filename: str, data: bytes) -> IngestResponse:
    safe_name = sanitise_filename(filename)
    ext = validate_upload(safe_name, data)
    units = parse_file(safe_name, data)

    ids: list[str] = []
    documents: list[str] = []
    metadatas: list[dict] = []
    counter = 0

    for unit in units:
        if unit.tabular:
            pieces = chunk_rows(unit.text.split("\n"))
        else:
            pieces = chunk_text(clean_text(unit.text))
        for piece in pieces:
            if not piece.strip():
                continue
            ids.append(f"{document_id}_{counter}")
            documents.append(piece)
            metadatas.append(
                {
                    "document_id": document_id,
                    "file_name": safe_name,
                    "file_type": ext.lstrip("."),
                    "chunk_index": counter,
                    "page_or_sheet": unit.label,
                }
            )
            counter += 1

    if not documents:
        raise AppError("NO_EXTRACTABLE_TEXT", "no extractable text", 422)

    # Re-ingestion is idempotent: clear any chunks for this document first.
    vectorstore.delete_document(document_id)
    vectors = embed(documents)
    vectorstore.add(ids, documents, vectors, metadatas)

    return IngestResponse(
        document_id=document_id, chunks=len(documents), file_type=ext.lstrip(".")
    )


@router.post("/ingest", response_model=IngestResponse)
async def ingest(
    file: UploadFile = File(...), document_id: str = Form(...)
) -> IngestResponse:
    data = await file.read()
    return await run_in_threadpool(
        _ingest_sync, document_id, file.filename or "upload", data
    )


@router.delete("/documents/{document_id}", response_model=DeleteResponse)
def delete_document(document_id: str) -> DeleteResponse:
    deleted = vectorstore.delete_document(document_id)
    return DeleteResponse(deleted_chunks=deleted)


@router.get("/documents/stats")
def document_stats() -> dict:
    return vectorstore.stats()
