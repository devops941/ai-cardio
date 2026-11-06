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
    # New contract: model_versions must be a non-empty sorted list
    assert isinstance(low["model_versions"], list)
    assert len(low["model_versions"]) >= 1
    assert low["model_versions"] == sorted(low["model_versions"])


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
    # New store is a dict; clear it to simulate no active model
    module._active_models = {}
    with pytest.raises(AppError) as exc:
        module.predict(
            {
                "age": 50, "sex": 1, "cp": 1, "trestbps": 130, "chol": 200, "fbs": 0,
                "restecg": 0, "thalach": 150, "exang": 0, "oldpeak": 1.0,
                "slope": 2, "ca": 0, "thal": 3,
            }
        )
    assert exc.value.code == "NO_ACTIVE_MODEL"


# ---------------------------------------------------------------------------
# Multi-active ensemble tests
# ---------------------------------------------------------------------------

@pytest.fixture()
def two_trained(temp_models_dir):
    """Train two separate model versions and return (module, v1, v2)."""
    module = temp_models_dir
    s1 = module.train(DATASET)
    s2 = module.train(DATASET)
    return module, s1["version"], s2["version"]


def test_activate_second_keeps_both_active(two_trained):
    module, v1, v2 = two_trained
    module.activate(v1)
    module.activate(v2)
    av = module.active_versions()
    assert v1 in av
    assert v2 in av
    assert len(av) == 2


def test_predict_ensemble_mean(two_trained):
    """Ensemble probability must equal the mean of the two models' probas."""
    import numpy as np

    module, v1, v2 = two_trained
    module.activate(v1)
    module.activate(v2)

    features = {
        "age": 55, "sex": 1, "cp": 2, "trestbps": 140, "chol": 220, "fbs": 0,
        "restecg": 1, "thalach": 160, "exang": 1, "oldpeak": 1.5,
        "slope": 2, "ca": 1, "thal": 7,
    }

    result = module.predict(features)

    # model_versions must be sorted and have both versions
    assert result["model_versions"] == sorted([v1, v2])
    assert result["model_version"] == max(v1, v2)
    assert len(result["model_versions"]) == 2

    # Recompute expected mean independently
    import pandas as pd
    row = pd.DataFrame([{f: float(features[f]) for f in module.FEATURES}])
    probas = [
        float(module._active_models[v]["pipeline"].predict_proba(row)[:, 1][0])
        for v in [v1, v2]
    ]
    expected_mean = round(float(np.mean(probas)), 4)
    assert result["probability"] == expected_mean


def test_deactivate_last_raises(two_trained):
    """Deactivating the sole active model must raise LAST_ACTIVE_MODEL (409)."""
    module, v1, _v2 = two_trained
    module.activate(v1)
    # Ensure only v1 is active by writing active.json directly
    module._write_active([v1])
    module._active_models = {v1: module._active_models.get(v1) or
                              __import__("joblib").load(
                                  __import__("pathlib").Path(module.settings.MODELS_DIR) /
                                  f"rf_v{v1}.joblib")}

    with pytest.raises(AppError) as exc:
        module.deactivate(v1)
    assert exc.value.code == "LAST_ACTIVE_MODEL"
    assert exc.value.status == 409


def test_deactivate_removes_one_keeps_other(two_trained):
    """Deactivating one of two active versions removes it and keeps the other."""
    module, v1, v2 = two_trained
    module.activate(v1)
    module.activate(v2)

    new_primary = module.deactivate(v1)
    assert new_primary == v2
    av = module.active_versions()
    assert v1 not in av
    assert v2 in av
    # In-memory store must also reflect the removal
    assert v1 not in module._active_models


def test_deactivate_nonactive_is_noop(two_trained):
    """Deactivating a version that is not active is a silent no-op."""
    module, v1, v2 = two_trained
    module.activate(v1)
    # v2 is NOT activated
    result = module.deactivate(v2)
    # primary unchanged
    assert result == v1
    assert module.active_versions() == [v1]


def test_legacy_active_json_read(temp_models_dir, tmp_path):
    """active.json in legacy {"version": N} format must be parsed correctly."""
    module = temp_models_dir
    models_dir = __import__("pathlib").Path(module.settings.MODELS_DIR)
    models_dir.mkdir(parents=True, exist_ok=True)
    active_file = models_dir / "active.json"
    active_file.write_text(json.dumps({"version": 42}))

    result = module.active_versions()
    assert result == [42]

    primary = module.active_version()
    assert primary == 42


def test_new_active_json_format_written_on_activate(trained):
    """After activate(), active.json must use the new {"versions": [...]} format."""
    module, sidecar = trained
    models_dir = __import__("pathlib").Path(module.settings.MODELS_DIR)
    data = json.loads((models_dir / "active.json").read_text())
    assert "versions" in data
    assert isinstance(data["versions"], list)
    assert sidecar["version"] in data["versions"]


def test_list_versions_includes_active_versions(trained):
    """list_versions() must include active_versions as a list."""
    module, sidecar = trained
    result = module.list_versions()
    assert "active_versions" in result
    assert isinstance(result["active_versions"], list)
    assert sidecar["version"] in result["active_versions"]
    assert result["active_version"] == sidecar["version"]
