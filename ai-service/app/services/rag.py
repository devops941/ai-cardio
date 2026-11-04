"""RAG orchestration for /predict/symptoms (Section 8.7)."""

from __future__ import annotations

from app.config import settings
from app.constants import (
    DISCLAIMER,
    INSUFFICIENT_KNOWLEDGE_MESSAGE,
    LLM_FALLBACK_MESSAGE,
    NON_HEART_MESSAGE,
    RISK_FACTORS,
    SYMPTOMS,
)
from app.schemas import SymptomRequest, SymptomResponse, Retrieved
from app.services import guardrail, llm, llm_mock, vectorstore
from app.services.embedder import embed_one
from app.services.llm import LLMFormatError, LLMUnavailable
from app.services.red_flags import check_red_flags


def _base(
    req: SymptomRequest, fired: list[str], emergency: bool, is_heart: bool
) -> dict:
    return {
        "status": "ok",
        "emergency": emergency,
        "fired_rules": fired,
        "is_heart_related": is_heart,
        "risk_level": None,
        "possible_conditions": [],
        "explanation": "",
        "recommended_specialist": None,
        "next_steps": [],
        "lifestyle_tips": [],
        "sources": [],
        "disclaimer": DISCLAIMER,
        "message": None,
        "retrieved": [],
    }


def _query_string(req: SymptomRequest) -> str:
    labels = req.symptom_labels or [SYMPTOMS.get(s, s) for s in req.symptoms]
    parts = [" ".join(labels)]
    if req.duration_label:
        parts.append(f"duration {req.duration_label}")
    parts.append(f"severity {req.severity}")
    if req.age:
        parts.append(f"age {req.age}")
    if req.gender:
        parts.append(req.gender)
    if req.risk_factors:
        parts.append(" ".join(RISK_FACTORS.get(r, r) for r in req.risk_factors))
    if req.free_text:
        parts.append(req.free_text)
    return " ".join(p for p in parts if p)


def _user_block(req: SymptomRequest) -> str:
    labels = req.symptom_labels or [SYMPTOMS.get(s, s) for s in req.symptoms]
    lines = []
    if req.age:
        lines.append(f"Age: {req.age}")
    if req.gender:
        lines.append(f"Gender: {req.gender.capitalize()}")
    lines.append(f"Symptoms: {'; '.join(labels)}")
    if req.duration_label:
        lines.append(f"Duration: {req.duration_label}")
    lines.append(f"Severity (1-10): {req.severity}")
    if req.risk_factors:
        lines.append(
            "Risk factors: "
            + ", ".join(RISK_FACTORS.get(r, r) for r in req.risk_factors)
        )
    if req.free_text:
        lines.append(f'Additional description: "{req.free_text}"')
    return "\n".join(lines)


def symptom_check(req: SymptomRequest) -> SymptomResponse:
    fired = check_red_flags(
        set(req.symptoms), req.duration_min, req.severity, req.sudden, req.free_text
    )
    emergency = bool(fired)

    classifier_text = " ".join(
        (req.symptom_labels or [SYMPTOMS.get(s, s) for s in req.symptoms])
        + ([req.free_text] if req.free_text else [])
    )
    is_heart = guardrail.classify(classifier_text)

    if not is_heart and not emergency:
        body = _base(req, fired, emergency, is_heart=False)
        body.update(status="non_heart", explanation=NON_HEART_MESSAGE, message=NON_HEART_MESSAGE)
        return SymptomResponse(**body)

    # Layer 2: retrieval similarity.
    try:
        embedding = embed_one(_query_string(req))
        hits = vectorstore.query(embedding, top_k=settings.TOP_K)
    except Exception:  # noqa: BLE001
        hits = []

    retrieved = [
        Retrieved(file_name=h["file_name"], score=round(float(h["score"]), 2))
        for h in hits
    ]
    best = max((h["score"] for h in hits), default=0.0)

    if not hits or best < settings.SIM_THRESHOLD:
        body = _base(req, fired, emergency, is_heart)
        body.update(
            status="insufficient_knowledge",
            explanation=INSUFFICIENT_KNOWLEDGE_MESSAGE,
            message=INSUFFICIENT_KNOWLEDGE_MESSAGE,
            retrieved=retrieved,
        )
        return SymptomResponse(**body)

    context_block = "\n".join(
        f'<doc source="{h["file_name"]}">{h["text"]}</doc>' for h in hits
    )
    user_block = _user_block(req)

    try:
        if settings.LLM_MOCK:
            result = llm_mock.generate_explanation(
                user_block,
                context_block,
                severity=req.severity,
                risk_factors=len(req.risk_factors),
            )
        else:
            result = llm.generate_explanation(user_block, context_block)
    except (LLMUnavailable, LLMFormatError):
        body = _base(req, fired, emergency, is_heart)
        body.update(
            status="llm_unavailable",
            explanation=LLM_FALLBACK_MESSAGE,
            message=LLM_FALLBACK_MESSAGE,
            retrieved=retrieved,
        )
        return SymptomResponse(**body)

    allowed = {h["file_name"] for h in hits}
    sources = [s for s in result.sources if s in allowed]
    specialist = result.recommended_specialist
    if emergency:
        specialist = "Emergency"

    return SymptomResponse(
        status="ok",
        emergency=emergency,
        fired_rules=fired,
        is_heart_related=True,
        risk_level=result.risk_level,
        possible_conditions=result.possible_conditions,
        explanation=result.explanation,
        recommended_specialist=specialist,
        next_steps=result.next_steps,
        lifestyle_tips=result.lifestyle_tips,
        sources=sources,
        disclaimer=DISCLAIMER,
        message=None,
        retrieved=retrieved,
    )
