"""FastAPI application entry point (Section 8.1)."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.errors import register_handlers
from app.routers import ingest, ml, parse, predict
from app.security import verify_internal_key
from app.services import vectorstore

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("cardiocare.ai")


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Preload the embedding model and the active ML model so the first request is fast.
    try:
        from app.services import ml_model

        ml_model.load_active()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not load ML model at startup: %s", type(exc).__name__)

    try:
        from app.services.embedder import _model

        _model()
        logger.info("Embedding model loaded")
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Embedding model not loaded yet (it downloads on first use): %s",
            type(exc).__name__,
        )
    yield


app = FastAPI(title="CardioCare AI Service", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["X-Internal-Key", "Content-Type"],
)

register_handlers(app)

app.include_router(ingest.router)
app.include_router(predict.router)
app.include_router(ml.router)
app.include_router(parse.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/stats")
def stats(_: None = Depends(verify_internal_key)) -> dict:
    data = vectorstore.stats()
    return {
        "indexed_chunks": data["total_chunks"],
        "documents": data["documents"],
    }
