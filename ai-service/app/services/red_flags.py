"""Deterministic emergency rules (Section 7.6) - authoritative copy."""

from __future__ import annotations

from app.constants import EMERGENCY_PHRASES


def check_red_flags(
    symptoms: set[str],
    duration_min: int | None,
    severity: int,
    sudden: bool,
    free_text: str,
) -> list[str]:
    fired: list[str] = []
    chest = "chest_pain" in symptoms

    if chest and duration_min is not None and duration_min > 15:
        fired.append("RF-01")
    if chest and "pain_spreading" in symptoms:
        fired.append("RF-02")
    if chest and "cold_sweat" in symptoms:
        fired.append("RF-03")
    if chest and "breathlessness" in symptoms:
        fired.append("RF-04")
    if "fainting" in symptoms:
        fired.append("RF-05")
    if "breathlessness" in symptoms and (severity >= 8 or sudden):
        fired.append("RF-06")
    if {"nausea_chest", "cold_sweat"} <= symptoms:
        fired.append("RF-07")
    text = (free_text or "").lower()
    if any(p in text for p in EMERGENCY_PHRASES):
        fired.append("RF-08")

    return fired
