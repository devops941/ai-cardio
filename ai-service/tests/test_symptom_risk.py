"""Deterministic symptom-only risk scoring tests (Section 12.2)."""

from __future__ import annotations

import pytest

from app.services import symptom_risk


def test_band_boundaries():
    assert symptom_risk.band_from_score(0) == "Low"
    assert symptom_risk.band_from_score(3) == "Low"
    assert symptom_risk.band_from_score(4) == "Moderate"
    assert symptom_risk.band_from_score(7) == "Moderate"
    assert symptom_risk.band_from_score(8) == "High"


def test_empty_questionnaire_is_low():
    result = symptom_risk.score_symptoms(set())
    assert result["risk_level"] == "Low"
    assert result["score"] == 0
    assert result["reasons"] == []


def test_shared_vectors(vectors):
    for case in vectors["symptom_risk"]:
        result = symptom_risk.score_symptoms(
            set(case["symptoms"]),
            severity=case.get("severity", 1),
            duration_min=case.get("duration_min"),
            risk_factors=case.get("risk_factors", []),
            age=case.get("age"),
            sudden=case.get("sudden", False),
        )
        assert result["risk_level"].upper() == case["expected"].upper(), case


def test_severity_raises_the_band():
    calm = symptom_risk.band(set(), severity=2)
    severe = symptom_risk.band(set(), severity=10)
    assert calm == "Low"
    assert severe == "Moderate"


def test_severity_with_chest_pain_reaches_high():
    mild = symptom_risk.band({"chest_pain"}, severity=2)
    severe = symptom_risk.band({"chest_pain"}, severity=10)
    assert mild == "Low"
    assert severe == "High"


def test_persistent_chest_pain_outweighs_a_short_episode():
    brief = symptom_risk.score_symptoms({"chest_pain"}, severity=2, duration_min=10)
    persistent = symptom_risk.score_symptoms(
        {"chest_pain"}, severity=2, duration_min=30
    )
    assert brief["score"] < persistent["score"]


def test_reasons_explain_the_contribution():
    result = symptom_risk.score_symptoms(
        {"chest_pain"}, severity=7, risk_factors=["smoking"], age=65
    )
    joined = " ".join(result["reasons"])
    assert "symptoms" in joined
    assert "severity" in joined
    assert "risk factors" in joined
    assert "age" in joined


def test_worst_case_is_high_and_capped():
    result = symptom_risk.score_symptoms(
        {
            "chest_pain",
            "pain_spreading",
            "breathlessness",
            "cold_sweat",
            "bluish_skin",
            "fainting",
        },
        severity=10,
        duration_min=60,
        risk_factors=["diabetes", "smoking", "hypertension", "high_cholesterol"],
        age=70,
        sudden=True,
    )
    assert result["risk_level"] == "High"
    assert result["score"] > symptom_risk.MODERATE_MAX


@pytest.mark.parametrize(
    "age,expected",
    [(30, 0), (44, 0), (45, 1), (59, 1), (60, 2), (80, 2)],
)
def test_age_points(age, expected):
    assert symptom_risk._age_points(age) == expected


def test_unknown_ids_are_ignored():
    result = symptom_risk.score_symptoms({"not_a_symptom"}, severity=1)
    assert result["risk_level"] == "Low"
