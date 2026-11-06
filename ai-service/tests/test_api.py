"""API integration tests for the FastAPI service (Section 12.2)."""

from __future__ import annotations

import io
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

KEY = "test-internal-key"

DATASET = Path(__file__).resolve().parents[1] / "datasets" / "heart_cleveland.csv"


@pytest.fixture()
def client(monkeypatch, tmp_path):
    monkeypatch.setenv("INTERNAL_API_KEY", KEY)
    monkeypatch.setenv("LLM_MOCK", "true")
    monkeypatch.setenv("CHROMA_PATH", str(tmp_path / "chroma"))
    monkeypatch.setenv("MODELS_DIR", str(tmp_path / "models"))

    import importlib

    from app import config

    config.get_settings.cache_clear()
    importlib.reload(config)

    from app.services import ml_model, vectorstore

    importlib.reload(vectorstore)
    importlib.reload(ml_model)
    ml_model.activate(ml_model.train(DATASET)["version"])

    from app import main

    importlib.reload(main)
    with TestClient(main.app) as test_client:
        yield test_client


def auth() -> dict:
    return {"X-Internal-Key": KEY}


def test_health_is_public(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_missing_key_is_401(client):
    resp = client.post("/predict/clinical", json={})
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "UNAUTHORISED"


def test_wrong_key_is_401(client):
    resp = client.get("/ml/versions", headers={"X-Internal-Key": "nope"})
    assert resp.status_code == 401


def test_ingest_and_query_round_trip(client, tmp_path):
    content = (
        "Chest pain lasting more than fifteen minutes with sweating and "
        "breathlessness may be a heart attack. Call 108 or 112 immediately. "
    ) * 6
    files = {"file": ("heart_notes.txt", content.encode(), "text/plain")}
    data = {"document_id": "doc-1"}
    resp = client.post("/ingest", files=files, data=data, headers=auth())
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["document_id"] == "doc-1"
    assert body["chunks"] >= 1

    payload = {
        "symptoms": ["chest_pain", "breathlessness", "cold_sweat"],
        "symptom_labels": ["Chest pain", "Shortness of breath", "Cold sweat"],
        "duration_min": 30,
        "duration_label": "15 to 60 minutes",
        "severity": 8,
    }
    resp = client.post("/predict/symptoms", json=payload, headers=auth())
    assert resp.status_code == 200, resp.text
    result = resp.json()
    assert result["emergency"] is True
    assert result["status"] in {"ok", "insufficient_knowledge"}
    assert "RF-01" in result["fired_rules"]


def test_insufficient_knowledge_when_empty_store(client):
    payload = {"symptoms": ["palpitations"], "symptom_labels": ["Palpitations"]}
    resp = client.post("/predict/symptoms", json=payload, headers=auth())
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "insufficient_knowledge"
    # The deterministic questionnaire baseline still yields a band.
    assert body["risk_level"] in {"Low", "Moderate", "High"}


def test_insufficient_knowledge_keeps_a_high_band_for_severe_symptoms(client):
    payload = {
        "symptoms": ["chest_pain", "pain_spreading"],
        "symptom_labels": ["Chest pain", "Pain spreading"],
        "severity": 7,
    }
    resp = client.post("/predict/symptoms", json=payload, headers=auth())
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "insufficient_knowledge"
    assert body["risk_level"] == "High"


def test_non_heart_text(client):
    payload = {
        "symptoms": [],
        "symptom_labels": [],
        "free_text": "my knee hurts when I climb stairs",
    }
    resp = client.post("/predict/symptoms", json=payload, headers=auth())
    assert resp.status_code == 200
    assert resp.json()["status"] == "non_heart"


def test_llm_unavailable_fallback(client, monkeypatch):
    content = "Angina is chest tightness on effort relieved by rest. " * 20
    client.post(
        "/ingest",
        files={"file": ("kb.txt", content.encode(), "text/plain")},
        data={"document_id": "doc-2"},
        headers=auth(),
    )
    monkeypatch.setenv("LLM_MOCK_FAIL", "unavailable")
    from app import config

    config.get_settings.cache_clear()
    import importlib

    importlib.reload(config)

    payload = {
        "symptoms": ["chest_pain"],
        "symptom_labels": ["Chest pain"],
        "free_text": "angina chest tightness on effort",
        "severity": 4,
    }
    resp = client.post("/predict/symptoms", json=payload, headers=auth())
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "llm_unavailable"
    assert body["risk_level"] in {"Low", "Moderate", "High"}


def test_llm_bad_json_fallback(client, monkeypatch):
    content = "Palpitations are an awareness of a fast or irregular heartbeat. " * 20
    client.post(
        "/ingest",
        files={"file": ("kb2.txt", content.encode(), "text/plain")},
        data={"document_id": "doc-3"},
        headers=auth(),
    )
    monkeypatch.setenv("LLM_MOCK_FAIL", "bad_json")
    from app import config

    config.get_settings.cache_clear()
    import importlib

    importlib.reload(config)

    payload = {
        "symptoms": ["palpitations"],
        "symptom_labels": ["Palpitations"],
        "free_text": "fast irregular heartbeat awareness",
        "severity": 4,
    }
    resp = client.post("/predict/symptoms", json=payload, headers=auth())
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "llm_unavailable"
    assert body["risk_level"] in {"Low", "Moderate", "High"}


def test_delete_document(client):
    content = "Heart failure causes leg swelling and breathlessness. " * 20
    client.post(
        "/ingest",
        files={"file": ("kb3.txt", content.encode(), "text/plain")},
        data={"document_id": "doc-4"},
        headers=auth(),
    )
    resp = client.delete("/documents/doc-4", headers=auth())
    assert resp.status_code == 200
    assert resp.json()["deleted_chunks"] >= 1


def test_predict_clinical(client):
    payload = {
        "age": 63, "sex": 1, "cp": 1, "trestbps": 145, "chol": 233, "fbs": 1,
        "restecg": 2, "thalach": 150, "exang": 0, "oldpeak": 2.3, "slope": 3,
        "ca": 0, "thal": 6,
    }
    resp = client.post("/predict/clinical", json=payload, headers=auth())
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert 0.0 <= body["probability"] <= 1.0
    assert body["risk_level"] in {"Low", "Moderate", "High"}
    assert body["model_version"] >= 1


def test_predict_clinical_validation_error(client):
    payload = {
        "age": 500, "sex": 1, "cp": 1, "trestbps": 145, "chol": 233, "fbs": 1,
        "restecg": 2, "thalach": 150, "exang": 0, "oldpeak": 2.3, "slope": 3,
        "ca": 0, "thal": 6,
    }
    resp = client.post("/predict/clinical", json=payload, headers=auth())
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "VALIDATION_FAILED"


def test_ml_versions_and_activate(client):
    resp = client.get("/ml/versions", headers=auth())
    assert resp.status_code == 200
    body = resp.json()
    assert body["active_version"] >= 1
    assert len(body["versions"]) >= 1

    resp = client.post(f"/ml/activate/{body['active_version']}", headers=auth())
    assert resp.status_code == 200
    assert resp.json()["active_version"] == body["active_version"]


def test_parse_tabular(client):
    csv_bytes = b"name,age\nAsha,44\nRavi,51\n"
    resp = client.post(
        "/parse/tabular",
        files={"file": ("people.csv", csv_bytes, "text/csv")},
        headers=auth(),
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "name" in body["columns"]
    assert body["rows"][0]["name"] == "Asha"


def test_parse_tabular_rejects_pdf(client):
    resp = client.post(
        "/parse/tabular",
        files={"file": ("x.pdf", b"%PDF-1.4\n", "application/pdf")},
        headers=auth(),
    )
    assert resp.status_code == 415


def test_ingest_rejects_bad_signature(client):
    resp = client.post(
        "/ingest",
        files={"file": ("fake.pdf", b"not a pdf", "application/pdf")},
        data={"document_id": "bad"},
        headers=auth(),
    )
    assert resp.status_code == 415
    assert resp.json()["error"]["code"] == "FILE_SIGNATURE_MISMATCH"


def test_ingest_rejects_empty_text(client):
    resp = client.post(
        "/ingest",
        files={"file": ("blank.txt", b"   \n\n  ", "text/plain")},
        data={"document_id": "blank"},
        headers=auth(),
    )
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "NO_EXTRACTABLE_TEXT"


def test_unknown_symptom_rejected(client):
    payload = {"symptoms": ["not_a_symptom"], "symptom_labels": ["x"]}
    resp = client.post("/predict/symptoms", json=payload, headers=auth())
    assert resp.status_code == 422
