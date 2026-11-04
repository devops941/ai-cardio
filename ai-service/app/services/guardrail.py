"""Three-layer guardrail: intent, retrieval similarity, output validation."""

from __future__ import annotations

from app.config import settings

from app.services import llm, llm_mock


def classify(text: str) -> bool:
    if settings.LLM_MOCK:
        return llm_mock.classify(text)
    return llm.classify(text)
