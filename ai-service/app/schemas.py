"""Pydantic request/response models (Section 8.2)."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.constants import CLINICAL_RANGES, SYMPTOMS

RiskLevel = Literal["Low", "Moderate", "High"]
Status = Literal["ok", "non_heart", "insufficient_knowledge", "llm_unavailable"]


class Condition(BaseModel):
    name: str
    why: str


class SymptomResult(BaseModel):
    risk_level: RiskLevel
    possible_conditions: list[Condition] = []
    explanation: str
    recommended_specialist: Literal["Cardiologist", "Emergency"]
    next_steps: list[str]
    lifestyle_tips: list[str] = []
    sources: list[str] = []
    disclaimer: str


class SymptomRequest(BaseModel):
    symptoms: list[str] = []
    symptom_labels: list[str] = []
    free_text: str = ""
    age: int | None = None
    gender: str | None = None
    risk_factors: list[str] = []
    duration_label: str | None = None
    duration_min: int | None = None
    sudden: bool = False
    severity: int = Field(default=1, ge=1, le=10)

    @field_validator("symptoms")
    @classmethod
    def _known_symptoms(cls, v: list[str]) -> list[str]:
        unknown = [s for s in v if s not in SYMPTOMS]
        if unknown:
            raise ValueError(f"unknown symptom id: {unknown[0]}")
        return v

    @field_validator("free_text")
    @classmethod
    def _free_text_len(cls, v: str) -> str:
        if len(v) > 1000:
            raise ValueError("free_text must be at most 1000 characters")
        return v

    @field_validator("age")
    @classmethod
    def _age_range(cls, v: int | None) -> int | None:
        if v is not None and not (1 <= v <= 120):
            raise ValueError("age must be between 1 and 120")
        return v


class Retrieved(BaseModel):
    file_name: str
    score: float


class SymptomResponse(BaseModel):
    status: Status
    emergency: bool
    fired_rules: list[str] = []
    is_heart_related: bool = True
    risk_level: RiskLevel | None = None
    possible_conditions: list[Condition] = []
    explanation: str
    recommended_specialist: str | None = None
    next_steps: list[str] = []
    lifestyle_tips: list[str] = []
    sources: list[str] = []
    disclaimer: str
    message: str | None = None
    retrieved: list[Retrieved] = []


class ClinicalRequest(BaseModel):
    age: int
    sex: int
    cp: int
    trestbps: float
    chol: float
    fbs: int
    restecg: int
    thalach: float
    exang: int
    oldpeak: float
    slope: int
    ca: int
    thal: int

    @field_validator("*")
    @classmethod
    def _in_range(cls, v: float, info) -> float:
        rng = CLINICAL_RANGES.get(info.field_name)
        if rng is not None and not (rng[0] <= v <= rng[1]):
            raise ValueError(
                f"{info.field_name} must be between {rng[0]} and {rng[1]}"
            )
        return v


class ClinicalResponse(BaseModel):
    probability: float
    risk_level: RiskLevel
    model_version: int


class IngestResponse(BaseModel):
    document_id: str
    chunks: int
    file_type: str


class DeleteResponse(BaseModel):
    deleted_chunks: int


class TabularResponse(BaseModel):
    columns: list[str]
    rows: list[dict[str, str]]
