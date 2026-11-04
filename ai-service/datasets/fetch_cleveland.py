"""Download the UCI Cleveland heart-disease dataset (Section 8.8)."""

from __future__ import annotations

import sys
import urllib.request
from pathlib import Path

URL = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases/"
    "heart-disease/processed.cleveland.data"
)
HEADER = (
    "age,sex,cp,trestbps,chol,fbs,restecg,thalach,exang,oldpeak,"
    "slope,ca,thal,target"
)
OUT = Path(__file__).resolve().parent / "heart_cleveland.csv"


def _from_ucimlrepo() -> str:
    from ucimlrepo import fetch_ucirepo

    data = fetch_ucirepo(id=45)
    df = data.data.features.copy()
    df["target"] = data.data.targets.iloc[:, 0]
    df.columns = HEADER.split(",")
    return df.to_csv(index=False)


def main() -> int:
    if OUT.exists():
        print(f"Dataset already present at {OUT}")
        return 0

    try:
        with urllib.request.urlopen(URL, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
        rows = [line.strip() for line in raw.splitlines() if line.strip()]
        OUT.write_text(HEADER + "\n" + "\n".join(rows) + "\n")
        print(f"Wrote {len(rows)} rows to {OUT}")
        return 0
    except Exception as exc:  # noqa: BLE001
        print(f"Direct download failed: {exc}")

    try:
        OUT.write_text(_from_ucimlrepo())
        print(f"Wrote dataset via ucimlrepo to {OUT}")
        return 0
    except Exception as exc:  # noqa: BLE001
        print(f"ucimlrepo fallback failed: {exc}")

    print(
        "Could not download the Cleveland dataset. Please place "
        f"processed.cleveland.data content at {OUT} with the header "
        f"'{HEADER}'."
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
