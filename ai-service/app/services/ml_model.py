"""Random Forest training, versioning and prediction (Section 8.8)."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

from app.config import settings
from app.errors import AppError

logger = logging.getLogger("cardiocare.ai.ml")

FEATURES = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
]

NUMERIC = ["age", "trestbps", "chol", "thalach", "oldpeak", "ca"]
CATEGORICAL = ["cp", "restecg", "slope", "thal"]
BINARY = ["sex", "fbs", "exang"]

_active: dict | None = None


def _models_dir() -> Path:
    path = Path(settings.MODELS_DIR)
    path.mkdir(parents=True, exist_ok=True)
    return path


def _preprocessor(scale: bool) -> ColumnTransformer:
    numeric_steps = [("impute", SimpleImputer(strategy="most_frequent"))]
    if scale:
        numeric_steps.append(("scale", StandardScaler()))
    return ColumnTransformer(
        transformers=[
            ("num", Pipeline(numeric_steps), NUMERIC),
            (
                "cat",
                Pipeline(
                    [
                        ("impute", SimpleImputer(strategy="most_frequent")),
                        (
                            "onehot",
                            OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                        ),
                    ]
                ),
                CATEGORICAL,
            ),
            ("bin", "passthrough", BINARY),
        ]
    )


def _algorithms() -> dict[str, tuple[object, dict, bool]]:
    return {
        "Logistic Regression": (
            LogisticRegression(max_iter=1000, random_state=42),
            {"clf__C": [0.1, 1, 10]},
            True,
        ),
        "KNN": (
            KNeighborsClassifier(),
            {"clf__n_neighbors": [3, 5, 7, 9]},
            True,
        ),
        "SVM": (
            SVC(probability=True, random_state=42),
            {"clf__C": [0.1, 1, 10], "clf__kernel": ["linear", "rbf"]},
            True,
        ),
        "Decision Tree": (
            DecisionTreeClassifier(random_state=42),
            {"clf__max_depth": [3, 5, 10, None]},
            False,
        ),
        "Random Forest": (
            RandomForestClassifier(random_state=42),
            {
                "clf__n_estimators": [100, 200, 300],
                "clf__max_depth": [None, 5, 10],
                "clf__min_samples_split": [2, 5],
            },
            False,
        ),
        "XGBoost": (
            XGBClassifier(eval_metric="logloss", random_state=42),
            {
                "clf__n_estimators": [100, 200],
                "clf__max_depth": [3, 5],
                "clf__learning_rate": [0.05, 0.1],
            },
            False,
        ),
    }


def load_dataset(path: str | Path | None = None) -> pd.DataFrame:
    csv_path = Path(path or settings.DATASET_PATH)
    if not csv_path.exists():
        raise AppError(
            "DATASET_INVALID",
            f"Dataset not found at {csv_path}. Run datasets/fetch_cleveland.py first.",
            422,
        )
    df = pd.read_csv(csv_path, na_values="?")
    required = FEATURES + ["target"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise AppError(
            "DATASET_INVALID",
            f"Dataset is missing column: {missing[0]}.",
            422,
            details=[{"field": c, "issue": "missing"} for c in missing],
        )
    if len(df) < 50:
        raise AppError("DATASET_INVALID", "Dataset needs at least 50 rows.", 422)
    df = df.dropna(subset=["target"])
    df["target"] = (df["target"].astype(float) > 0).astype(int)
    counts = df["target"].value_counts()
    if counts.get(0, 0) < 10 or counts.get(1, 0) < 10:
        raise AppError(
            "DATASET_INVALID",
            "Dataset needs at least 10 rows in each class.",
            422,
        )
    return df


def _refit(record: dict) -> int:
    n = len(record["mean_test_recall"])
    return max(
        range(n),
        key=lambda i: (round(record["mean_test_recall"][i], 6), record["mean_test_f1"][i]),
    )


def _evaluate(pipeline, x_test, y_test) -> dict:
    pred = pipeline.predict(x_test)
    proba = pipeline.predict_proba(x_test)[:, 1]
    return {
        "accuracy": float(accuracy_score(y_test, pred)),
        "precision": float(precision_score(y_test, pred, zero_division=0)),
        "recall": float(recall_score(y_test, pred, zero_division=0)),
        "f1": float(f1_score(y_test, pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, proba)),
        "confusion_matrix": confusion_matrix(y_test, pred).tolist(),
    }


def train(csv_path: str | Path | None = None) -> dict:
    df = load_dataset(csv_path)
    x = df[FEATURES].astype(float)
    y = df["target"].astype(int)

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, stratify=y, random_state=42
    )

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    comparison: list[dict] = []
    best_rf = None
    best_rf_params: dict = {}
    rf_metrics: dict = {}
    importances: list[dict] = []

    for name, (estimator, grid, scale) in _algorithms().items():
        pipeline = Pipeline([("prep", _preprocessor(scale)), ("clf", estimator)])
        search = GridSearchCV(
            pipeline,
            param_grid=grid,
            cv=cv,
            scoring={"recall": "recall", "f1": "f1"},
            refit=_refit,
            n_jobs=-1,
        )
        search.fit(x_train, y_train)
        metrics = _evaluate(search.best_estimator_, x_test, y_test)
        cv_recall = float(search.cv_results_["mean_test_recall"][search.best_index_])
        comparison.append(
            {
                "algorithm": name,
                "accuracy": round(metrics["accuracy"], 4),
                "precision": round(metrics["precision"], 4),
                "recall": round(metrics["recall"], 4),
                "f1": round(metrics["f1"], 4),
                "roc_auc": round(metrics["roc_auc"], 4),
                "cv_recall_mean": round(cv_recall, 4),
            }
        )
        if name == "Random Forest":
            best_rf = search.best_estimator_
            best_rf_params = {
                k.replace("clf__", ""): (v if v is not None else None)
                for k, v in search.best_params_.items()
            }
            rf_metrics = metrics

    assert best_rf is not None
    version = _next_version()
    model_path = _models_dir() / f"rf_v{version}.joblib"
    joblib.dump(
        {"pipeline": best_rf, "features": FEATURES, "version": version}, model_path
    )

    try:
        names = best_rf.named_steps["prep"].get_feature_names_out()
        clf = best_rf.named_steps["clf"]
        pairs = sorted(
            zip(names, clf.feature_importances_), key=lambda p: p[1], reverse=True
        )[:15]
        importances = [
            {"feature": str(n), "importance": round(float(v), 4)} for n, v in pairs
        ]
    except Exception:  # noqa: BLE001
        importances = []

    _save_plots(best_rf, x_test, y_test, version)

    sidecar = {
        "version": version,
        "algorithm": "RandomForestClassifier",
        "best_params": best_rf_params,
        "metrics": {
            k: round(v, 4) for k, v in rf_metrics.items() if k != "confusion_matrix"
        },
        "comparison": comparison,
        "confusion_matrix": rf_metrics["confusion_matrix"],
        "feature_importances": importances,
        "file_path": str(model_path),
        "train_rows": int(len(x_train)),
        "test_rows": int(len(x_test)),
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }
    (_models_dir() / f"rf_v{version}.metrics.json").write_text(
        json.dumps(sidecar, indent=2)
    )
    logger.info("Trained rf_v%s with recall=%s", version, rf_metrics["recall"])
    return sidecar


def _save_plots(pipeline, x_test, y_test, version: int) -> None:
    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        from sklearn.metrics import ConfusionMatrixDisplay, RocCurveDisplay

        plots = _models_dir() / "plots"
        plots.mkdir(parents=True, exist_ok=True)

        fig, ax = plt.subplots()
        ConfusionMatrixDisplay.from_estimator(pipeline, x_test, y_test, ax=ax)
        fig.savefig(plots / f"rf_v{version}_confusion.png", bbox_inches="tight")
        plt.close(fig)

        fig, ax = plt.subplots()
        RocCurveDisplay.from_estimator(pipeline, x_test, y_test, ax=ax)
        fig.savefig(plots / f"rf_v{version}_roc.png", bbox_inches="tight")
        plt.close(fig)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not save plots: %s", type(exc).__name__)


def _next_version() -> int:
    existing = []
    for path in _models_dir().glob("rf_v*.joblib"):
        try:
            existing.append(int(path.stem.split("_v")[1]))
        except (IndexError, ValueError):
            continue
    return max(existing, default=0) + 1


def list_versions() -> dict:
    versions = []
    for path in sorted(_models_dir().glob("rf_v*.metrics.json")):
        try:
            data = json.loads(path.read_text())
            versions.append(data)
        except Exception:  # noqa: BLE001
            continue
    versions.sort(key=lambda v: v.get("version", 0))
    return {"versions": versions, "active_version": active_version()}


def active_version() -> int | None:
    active_file = _models_dir() / "active.json"
    if not active_file.exists():
        return None
    try:
        return int(json.loads(active_file.read_text())["version"])
    except Exception:  # noqa: BLE001
        return None


def activate(version: int) -> int:
    global _active
    model_path = _models_dir() / f"rf_v{version}.joblib"
    if not model_path.exists():
        raise AppError(
            "MODEL_VERSION_NOT_FOUND", f"Model version {version} was not found.", 404
        )
    _active = joblib.load(model_path)
    (_models_dir() / "active.json").write_text(json.dumps({"version": version}))
    logger.info("Activated model version %s", version)
    return version


def load_active() -> None:
    global _active
    version = active_version()
    if version is None:
        files = []
        for path in _models_dir().glob("rf_v*.joblib"):
            try:
                files.append(int(path.stem.split("_v")[1]))
            except (IndexError, ValueError):
                continue
        version = max(files, default=None)
    if version is not None:
        path = _models_dir() / f"rf_v{version}.joblib"
        if path.exists():
            _active = joblib.load(path)
            logger.info("Loaded model version %s at startup", version)


def band_from_probability(proba: float) -> str:
    """Map a probability to a band using the shared 0.4 / 0.7 thresholds."""
    if proba < 0.4:
        return "Low"
    if proba <= 0.7:
        return "Moderate"
    return "High"


def predict(features: dict) -> dict:
    if _active is None:
        raise AppError("NO_ACTIVE_MODEL", "No active model is available.", 503)
    pipeline = _active["pipeline"]
    row = pd.DataFrame([{f: float(features[f]) for f in FEATURES}])
    proba = float(pipeline.predict_proba(row)[:, 1][0])
    risk = band_from_probability(proba)
    return {
        "probability": round(proba, 4),
        "risk_level": risk,
        "model_version": int(_active["version"]),
    }
