"""Generate hospital/doctor import templates (D21, Appendix A)."""

from __future__ import annotations

import csv
from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[2]
TEMPLATES_DIR = REPO_ROOT / "web" / "public" / "templates"

HOSPITAL_COLUMNS = [
    "name",
    "address",
    "city",
    "state",
    "pincode",
    "phone",
    "latitude",
    "longitude",
    "emergency24x7",
    "hasCardiology",
    "hasCathLab",
    "rating",
    "beds",
]

HOSPITAL_ROWS = [
    [
        "Sample Heart Hospital, Anna Nagar",
        "12 Sample Main Road, Anna Nagar",
        "Chennai",
        "Tamil Nadu",
        "600040",
        "044-5550-0101",
        13.0850,
        80.2101,
        "Yes",
        "Yes",
        "Yes",
        4.4,
        220,
    ],
    [
        "Sample Cardiac Centre, Adyar",
        "45 Sample Beach Road, Adyar",
        "Chennai",
        "Tamil Nadu",
        "600020",
        "044-5550-0102",
        13.0012,
        80.2565,
        "No",
        "Yes",
        "No",
        4.0,
        90,
    ],
]

DOCTOR_COLUMNS = [
    "name",
    "specialization",
    "qualification",
    "experienceYears",
    "phone",
    "email",
    "hospitalName",
    "availableDays",
    "consultationFee",
]

DOCTOR_ROWS = [
    [
        "Dr. Asha Raman (sample)",
        "Cardiologist",
        "MD, DM (Cardiology)",
        14,
        "98400-00001",
        "asha.raman@example.com",
        "Sample Heart Hospital, Anna Nagar",
        "Mon,Wed,Fri",
        700,
    ],
    [
        "Dr. Karthik Venkat (sample)",
        "Interventional Cardiologist",
        "MD, DM (Cardiology)",
        9,
        "98400-00002",
        "karthik.venkat@example.com",
        "Sample Cardiac Centre, Adyar",
        "Tue,Thu,Sat",
        600,
    ],
]


def _write_csv(path: Path, columns: list[str], rows: list[list]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(columns)
        writer.writerows(rows)
    print(f"Wrote {path}")


def main() -> int:
    TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)

    _write_csv(TEMPLATES_DIR / "hospitals_template.csv", HOSPITAL_COLUMNS, HOSPITAL_ROWS)
    _write_csv(TEMPLATES_DIR / "doctors_template.csv", DOCTOR_COLUMNS, DOCTOR_ROWS)

    pd.DataFrame(HOSPITAL_ROWS, columns=HOSPITAL_COLUMNS).to_excel(
        TEMPLATES_DIR / "hospitals_template.xlsx", index=False, engine="openpyxl"
    )
    pd.DataFrame(DOCTOR_ROWS, columns=DOCTOR_COLUMNS).to_excel(
        TEMPLATES_DIR / "doctors_template.xlsx", index=False, engine="openpyxl"
    )
    print(f"Wrote XLSX templates to {TEMPLATES_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
