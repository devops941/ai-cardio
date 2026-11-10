"""Deterministic mock LLM for LLM_MOCK=true (Section 8.9).

Constructs structured, symptom-grounded differential conditions and
clinical explanations when external LLM APIs are not in use.
"""

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


def _mock_risk(severity: int, risk_factors: int, symptom_text: str) -> str:
    low = symptom_text.lower()
    has_acute = any(k in low for k in ("crush", "spread", "cold sweat", "faint", "radiat"))
    has_cardiac = any(k in low for k in ("chest", "breath", "palpit", "angina", "shortness"))

    if has_acute or severity >= 8 or (has_cardiac and severity >= 6 and risk_factors >= 2):
        return "High"
    if has_cardiac or severity >= 4 or risk_factors >= 1:
        return "Moderate"
    return "Low"


def generate_explanation(
    user_block: str, context_block: str, *, severity: int = 1, risk_factors: int = 0
) -> SymptomResult:
    if config.settings.LLM_MOCK_FAIL == "unavailable":
        raise LLMUnavailable("mock: LLM unavailable")
    if config.settings.LLM_MOCK_FAIL == "bad_json":
        raise LLMFormatError("mock: model output failed schema validation twice")

    # Extract user input details from user_block
    symptoms_match = re.search(r"Symptoms:\s*(.+)", user_block)
    symptoms_str = symptoms_match.group(1).strip() if symptoms_match else ""

    severity_match = re.search(r"Severity \(1-10\):\s*(\d+)", user_block)
    if severity_match:
        severity = int(severity_match.group(1))

    duration_match = re.search(r"Duration:\s*(.+)", user_block)
    duration_str = duration_match.group(1).strip() if duration_match else ""

    rf_match = re.search(r"Risk factors:\s*(.+)", user_block)
    rf_str = rf_match.group(1).strip() if rf_match else ""
    if rf_str:
        risk_factors = len([r.strip() for r in rf_str.split(",") if r.strip()])

    sources = re.findall(r'<doc source="([^"]+)"', context_block)
    distinct_sources = list(dict.fromkeys(sources))

    low_sym = (symptoms_str + " " + user_block).lower()
    risk = _mock_risk(severity, risk_factors, low_sym)

    conditions: list[Condition] = []

    # Map symptoms to specific clinical cardiac conditions
    if "chest" in low_sym or "pressure" in low_sym or "tightness" in low_sym:
        conditions.append(
            Condition(
                name="Suspected Coronary Artery Disease (CAD) / Angina Pectoris",
                why="Reported chest discomfort or pressure suggests possible transient or fixed narrowing in the coronary arteries, reducing oxygen delivery to the heart muscle.",
            )
        )

    if "fatigue" in low_sym or "tired" in low_sym or "exhaustion" in low_sym or "exercise" in low_sym:
        conditions.append(
            Condition(
                name="Myocardial Perfusion Deficit / Cardiac Exhaustion",
                why="Persistent, unexplained fatigue reflects inability of the heart muscle to supply sufficient oxygenated blood to peripheral muscle tissues under exertion.",
            )
        )

    if "breath" in low_sym or "shortness" in low_sym or "flat" in low_sym:
        conditions.append(
            Condition(
                name="Elevated Ventricular Filling Pressures / Early Heart Failure",
                why="Dyspnea and breathing discomfort correlate with increased left ventricular filling pressures, causing fluid transudation into the pulmonary capillaries.",
            )
        )

    if "palpit" in low_sym or "flutter" in low_sym or "irregular" in low_sym:
        conditions.append(
            Condition(
                name="Cardiac Arrhythmia / Conduction Irregularity",
                why="Awareness of skipped or rapid heartbeats suggests premature ectopic contractions, supraventricular tachycardia, or intermittent atrial dysrhythmia.",
            )
        )

    if "faint" in low_sym or "dizz" in low_sym or "syncope" in low_sym:
        conditions.append(
            Condition(
                name="Hemodynamic Instability / Cerebral Hypoperfusion",
                why="Transient lightheadedness or syncope indicates a momentary sharp drop in cerebral perfusion due to conduction block, arrhythmia, or sudden blood pressure drop.",
            )
        )

    # Fallback condition if none matched
    if not conditions:
        conditions.append(
            Condition(
                name="Atherosclerotic Cardiovascular Strain",
                why="Reported cardiovascular symptoms and clinical biomarkers reflect heightened hemodynamic workload and vascular resistance.",
            )
        )

    # Construct rich, detailed medical paragraph
    primary_name = conditions[0].name
    symptom_display = symptoms_str or "the reported cardiovascular symptoms"

    explanation = (
        f"Based on your evaluation, your clinical presentation points to {primary_name.lower()}. "
        f"You reported {symptom_display} with a severity rating of {severity}/10"
        f"{f' persisting for {duration_str}' if duration_str else ''}. "
        "When coronary blood flow or cardiac pumping efficiency is compromised, the heart muscle "
        "experiences localized oxygen deficit (ischemia), forcing the cardiovascular system to work harder "
        "and triggering persistent symptoms. "
        f"Given the {risk.lower()} risk classification, you should consult an interventional cardiologist "
        "for a 12-lead ECG, 2D Echocardiogram, and cardiac biomarker assessment to formally evaluate coronary "
        "perfusion and initiate appropriate clinical management."
    )

    next_steps = [
        "Schedule an urgent in-person consultation with a cardiologist within 24 to 48 hours.",
        "Undergo a resting 12-lead ECG and 2D Echocardiogram to inspect heart rhythm and chamber pumping capacity.",
        "Request cardiac biomarker testing (High-Sensitivity Troponin I, Lipid Panel, and HbA1c).",
        "If you experience sudden severe chest crushing, radiation to left arm/jaw, or cold sweats, call 108 or 112 immediately.",
    ]

    lifestyle_tips = [
        "Strictly limit dietary sodium (<2,000 mg/day) to prevent fluid overload and high vascular resistance.",
        "Avoid strenuous physical exercise, heavy lifting, or unaccustomed exertion until cleared by cardiology.",
        "Log resting morning and evening blood pressure and pulse readings daily.",
        "Completely refrain from smoking, tobacco products, and excessive caffeine intake.",
    ]

    return SymptomResult(
        risk_level=risk,  # type: ignore[arg-type]
        possible_conditions=conditions,
        explanation=explanation,
        recommended_specialist="Emergency" if risk == "High" else "Cardiologist",
        next_steps=next_steps,
        lifestyle_tips=lifestyle_tips,
        sources=distinct_sources or ["heart_symptoms_kb.xlsx"],
        disclaimer=DISCLAIMER,
    )
