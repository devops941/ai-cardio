"""Deterministic mock LLM for LLM_MOCK=true (Section 8.9)."""

from __future__ import annotations

import re

from app import config
from app.constants import (
    DISCLAIMER,
    MOCK_HEART_KEYWORDS,
)
from app.schemas import Condition, SymptomResult

from app.services.llm import LLMFormatError, LLMUnavailable


def classify(text: str) -> bool:
    low = (text or "").lower()
    return any(k in low for k in MOCK_HEART_KEYWORDS)


def _mock_risk(severity: int, risk_factors: int, symptom_labels: list[str]) -> str:
    chest = any(
        word in " ".join(symptom_labels).lower()
        for word in ("chest", "breath", "palpit")
    )
    if severity >= 7 or risk_factors >= 3:
        return "High"
    if chest or risk_factors >= 1:
        return "Moderate"
    return "Low"


def generate_explanation(
    user_block: str, context_block: str, *, severity: int = 1, risk_factors: int = 0
) -> SymptomResult:
    if config.settings.LLM_MOCK_FAIL == "unavailable":
        raise LLMUnavailable("mock: LLM unavailable")
    if config.settings.LLM_MOCK_FAIL == "bad_json":
        raise LLMFormatError("mock: model output failed schema validation twice")

    symptom_labels = re.findall(r"^\s*(.+?)\s*$", user_block, re.MULTILINE)
    severity_match = re.search(r"Severity \(1-10\):\s*(\d+)", user_block)
    if severity_match:
        severity = int(severity_match.group(1))

    sources = re.findall(r'<doc source="([^"]+)"', context_block)
    distinct_sources = list(dict.fromkeys(sources))

    risk = _mock_risk(severity, risk_factors, symptom_labels)

    conditions: list[Condition] = []
    if distinct_sources:
        first = re.split(r"[.\n]", context_block.split(">", 1)[-1])[0]
        snippet = first.strip()[:120]
        conditions.append(
            Condition(
                name="Possible heart-related concern",
                why=snippet or "Based on the retrieved knowledge base passages.",
            )
        )

    explanation = (
        "Based on the symptoms you described and the reference material available, "
        "this may be related to a heart or circulation concern. This is a screening "
        "aid only and not a diagnosis. Please see a cardiologist to have it checked."
    )

    return SymptomResult(
        risk_level=risk,  # type: ignore[arg-type]
        possible_conditions=conditions,
        explanation=explanation,
        recommended_specialist="Cardiologist",
        next_steps=[
            "See a cardiologist within the next few days.",
            "Note when the symptoms happen and how long they last.",
            "Go to an emergency department if symptoms become severe.",
        ],
        lifestyle_tips=[
            "Keep blood pressure and sugar under control.",
            "Avoid smoking and limit salt and fried food.",
        ],
        sources=distinct_sources,
        disclaimer=DISCLAIMER,
    )
