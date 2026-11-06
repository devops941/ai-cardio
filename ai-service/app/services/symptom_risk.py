"""Deterministic symptom-only risk scoring (Section 7.7).

Produces a Low / Moderate / High band from the questionnaire answers alone, so
a screening result exists even when no clinical lab values are supplied and the
knowledge base or LLM cannot help. Red-flag rules stay authoritative for
emergencies; this scorer is the general-purpose baseline that fusion combines
with the LLM and Random Forest estimates.

The weights and thresholds are mirrored in web/lib/symptom-risk.ts and the two
copies must agree on every vector in docs/test-vectors/red_flags.json.
"""

from __future__ import annotations

RiskBand = str  # "Low" | "Moderate" | "High"

SYMPTOM_WEIGHTS: dict[str, int] = {
    "chest_pain": 3,
    "pain_spreading": 3,
    "breathlessness": 2,
    "palpitations": 1,
    "dizziness": 1,
    "fainting": 3,
    "cold_sweat": 2,
    "nausea_chest": 2,
    "fatigue": 1,
    "leg_swelling": 2,
    "reduced_exercise_tolerance": 1,
    "orthopnea": 2,
    "rapid_weight_gain": 1,
    "bluish_skin": 3,
}

RISK_FACTOR_WEIGHTS: dict[str, int] = {
    "diabetes": 2,
    "hypertension": 2,
    "smoking": 2,
    "high_cholesterol": 2,
    "family_history": 1,
    "obesity": 1,
    "sedentary": 1,
}

# Symptoms whose meaning changes once they persist past 15 minutes.
CHEST_RELATED = {"chest_pain", "pain_spreading", "breathlessness"}

SYMPTOM_CAP = 9
FACTOR_CAP = 6

LOW_MAX = 3
MODERATE_MAX = 7


def _severity_points(severity: int) -> int:
    if severity <= 3:
        return 0
    if severity <= 6:
        return 1
    if severity <= 8:
        return 3
    return 5


def _duration_points(symptoms: set[str], duration_min: int | None) -> int:
    if duration_min is None:
        return 0
    if symptoms & CHEST_RELATED and duration_min > 15:
        return 2
    if duration_min > 1440:
        return 1
    return 0


def _age_points(age: int | None) -> int:
    if age is None:
        return 0
    if age >= 60:
        return 2
    if age >= 45:
        return 1
    return 0


def band_from_score(score: int) -> RiskBand:
    if score <= LOW_MAX:
        return "Low"
    if score <= MODERATE_MAX:
        return "Moderate"
    return "High"


def score_symptoms(
    symptoms: set[str] | list[str],
    *,
    severity: int = 1,
    duration_min: int | None = None,
    risk_factors: list[str] | None = None,
    age: int | None = None,
    sudden: bool = False,
) -> dict:
    """Return {"risk_level", "score", "reasons"} for the questionnaire answers."""
    selected = set(symptoms)

    symptom_points = min(
        sum(SYMPTOM_WEIGHTS.get(s, 0) for s in selected), SYMPTOM_CAP
    )
    factor_points = min(
        sum(RISK_FACTOR_WEIGHTS.get(f, 0) for f in (risk_factors or [])), FACTOR_CAP
    )
    severity_points = _severity_points(severity)
    duration_points = _duration_points(selected, duration_min)
    age_points = _age_points(age)
    sudden_points = 1 if sudden else 0

    score = (
        symptom_points
        + factor_points
        + severity_points
        + duration_points
        + age_points
        + sudden_points
    )

    reasons: list[str] = []
    if symptom_points:
        reasons.append(f"symptoms +{symptom_points}")
    if factor_points:
        reasons.append(f"risk factors +{factor_points}")
    if severity_points:
        reasons.append(f"severity +{severity_points}")
    if duration_points:
        reasons.append(f"duration +{duration_points}")
    if age_points:
        reasons.append(f"age +{age_points}")
    if sudden_points:
        reasons.append("sudden onset +1")

    return {
        "risk_level": band_from_score(score),
        "score": score,
        "reasons": reasons,
    }


def band(symptoms: set[str] | list[str], **kwargs) -> RiskBand:
    return score_symptoms(symptoms, **kwargs)["risk_level"]
