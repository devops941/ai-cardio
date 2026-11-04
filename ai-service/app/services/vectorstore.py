"""ChromaDB vector store (Section 8.5)."""

from __future__ import annotations

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import settings

_client = chromadb.PersistentClient(
    path=settings.CHROMA_PATH, settings=ChromaSettings(anonymized_telemetry=False)
)

try:
    _collection = _client.get_or_create_collection(
        name="heart_knowledge", metadata={"hnsw:space": "cosine"}
    )
except Exception:  # noqa: BLE001 - older/newer Chroma config API
    _collection = _client.get_or_create_collection(
        name="heart_knowledge",
        configuration={"hnsw": {"space": "cosine"}},
    )


def add(ids, documents, embeddings, metadatas, batch: int = 500) -> None:
    for i in range(0, len(ids), batch):
        _collection.add(
            ids=ids[i : i + batch],
            documents=documents[i : i + batch],
            embeddings=embeddings[i : i + batch],
            metadatas=metadatas[i : i + batch],
        )


def query(embedding: list[float], top_k: int = 5) -> list[dict]:
    count = _collection.count()
    if count == 0:
        return []
    res = _collection.query(
        query_embeddings=[embedding],
        n_results=min(top_k, count),
        include=["documents", "metadatas", "distances"],
    )
    docs = res.get("documents") or [[]]
    metas = res.get("metadatas") or [[]]
    dists = res.get("distances") or [[]]
    return [
        {
            "text": d,
            "file_name": m["file_name"],
            "page_or_sheet": m.get("page_or_sheet"),
            "score": 1.0 - dist,
        }
        for d, m, dist in zip(docs[0], metas[0], dists[0])
    ]


def delete_document(document_id: str) -> int:
    before = _collection.count()
    _collection.delete(where={"document_id": document_id})
    return before - _collection.count()


def stats() -> dict:
    metas = _collection.get(include=["metadatas"])["metadatas"] or []
    return {
        "total_chunks": _collection.count(),
        "documents": len({m["document_id"] for m in metas}),
    }
