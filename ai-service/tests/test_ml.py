"""ML training and prediction tests (Section 12.2)."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
import pytest

from app.errors import AppError

DATASET = Path(__file__).resolve().parents[1] / "datasets" / "heart_cleveland.csv"


@pytest.fixture()
def trained(temp_models_dir):
    module = temp_models_dir
    sidecar = module.train(DATASET)
    module.activate(sidecar["version"])
    return module, sidecar


def test_dataset_present():
    assert DATASET.exists(), "Run datasets/fetch_cleveland.py first"


def test_training_outputs_sidecar(trained):
    _, sidecar = trained
    assert sidecar["version"] >= 1
    assert sidecar["metrics"]["recall"] > 0
    assert 0.0 <= sidecar["metrics"]["accuracy"] <= 1.0
    assert len(sidecar["comparison"]) == 6
    assert {"accuracy", "precision", "recall", "f1", "roc_auc"} <= set(
        sidecar["metrics"]
    )
    assert sidecar["confusion_matrix"]
    assert sidecar["feature_importances"]
    assert sidecar["algorithm"] == "RandomForestClassifier"


def test_metrics_sidecar_written(trained, temp_models_dir):
    _, sidecar = trained
    path = Path(temp_models_dir.settings.MODELS_DIR) / f"rf_v{sidecar['version']}.metrics.json"
    assert path.exists()
    data = json.loads(path.read_text())
    assert data["version"] == sidecar["version"]


def test_banding_from_probability(trained):
    module, _ = trained
    low = module.predict(
        {
            "age": 40, "sex": 0, "cp": 4, "trestbps": 110, "chol": 160, "fbs": 0,
            "restecg": 0, "thalach": 180, "exang": 0, "oldpeak": 0.0,
            "slope": 1, "ca": 0, "thal": 3,
        }
    )
    assert low["risk_level"] in {"Low", "Moderate", "High"}
    assert 0.0 <= low["probability"] <= 1.0
    assert low["model_version"] >= 1


def test_band_boundaries_match_shared_vectors(trained, vectors):
    module, _ = trained
    for case in vectors["bands"]:
        band = module.band_from_probability(case["probability"])
        assert band.upper() == case["expected"].upper(), case


def test_activate_missing_version_raises(trained):
    module, _ = trained
    with pytest.raises(AppError) as exc:
        module.activate(9999)
    assert exc.value.code == "MODEL_VERSION_NOT_FOUND"


def test_dataset_validation_rejects_missing_file(temp_models_dir):
    module = temp_models_dir
    with pytest.raises(AppError) as exc:
        module.load_dataset("/tmp/does-not-exist-xyz.csv")
    assert exc.value.code == "DATASET_INVALID"


def test_dataset_validation_rejects_bad_columns(temp_models_dir, tmp_path):
    module = temp_models_dir
    bad = tmp_path / "bad.csv"
    pd.DataFrame({"a": range(60), "target": [0, 1] * 30}).to_csv(bad, index=False)
    with pytest.raises(AppError) as exc:
        module.load_dataset(bad)
    assert exc.value.code == "DATASET_INVALID"


def test_no_active_model_raises(temp_models_dir):
    module = temp_models_dir
    module._active = None
    with pytest.raises(AppError) as exc:
        module.predict(
            {
                "age": 50, "sex": 1, "cp": 1, "trestbps": 130, "chol": 200, "fbs": 0,
                "restecg": 0, "thalach": 150, "exang": 0, "oldpeak": 1.0,
                "slope": 2, "ca": 0, "thal": 3,
            }
        )
    assert exc.value.code == "NO_ACTIVE_MODEL"
