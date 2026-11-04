"""Train the initial Random Forest model (Section 8.8).

Usage: python -m app.ml.train_initial [--force]
"""

from __future__ import annotations

import sys

from app.services import ml_model


def main(argv: list[str]) -> int:
    force = "--force" in argv
    existing = ml_model.active_version()

    if existing is not None and not force:
        print(f"An active model (rf_v{existing}) already exists; skipping training.")
        print("Pass --force to retrain.")
        return 0

    sidecar = ml_model.train()
    version = sidecar["version"]
    print(f"Trained rf_v{version}")
    metrics = sidecar["metrics"]
    print(
        "accuracy={accuracy} precision={precision} recall={recall} "
        "f1={f1} roc_auc={roc_auc}".format(**metrics)
    )

    if ml_model.active_version() is None or force:
        ml_model.activate(version)
        print(f"Activated rf_v{version}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
