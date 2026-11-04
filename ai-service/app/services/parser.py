"""Text extraction for every supported file type (Section 8.3)."""

from __future__ import annotations

import csv
import io
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from app.errors import AppError
from app.services.file_safety import ROW_CAP_KB, ROW_CAP_TABULAR


@dataclass
class ParsedUnit:
    label: str
    text: str
    tabular: bool


def parse_file(name: str, data: bytes, *, row_cap: int = ROW_CAP_KB) -> list[ParsedUnit]:
    ext = Path(name).suffix.lower()
    if ext == ".pdf":
        return _parse_pdf(data)
    if ext == ".docx":
        return _parse_docx(data)
    if ext == ".doc":
        return _parse_doc(data)
    if ext in {".xlsx", ".xls"}:
        return _parse_excel(data, ext, row_cap)
    if ext == ".csv":
        return _parse_csv(data, row_cap)
    if ext in {".txt", ".md"}:
        return _parse_text(data)
    raise AppError("UNSUPPORTED_FILE_TYPE", f"Unsupported file type '{ext}'.", 415)


def _rows_to_units(frames: dict[str, pd.DataFrame], row_cap: int) -> list[ParsedUnit]:
    units: list[ParsedUnit] = []
    for label, df in frames.items():
        if len(df) > row_cap:
            raise AppError(
                "VALIDATION_FAILED",
                f"Sheet '{label}' has more than {row_cap} rows.",
                422,
            )
        lines: list[str] = []
        columns = [str(c) for c in df.columns]
        for _, row in df.iterrows():
            parts = []
            for col in columns:
                val = row[col]
                if pd.isna(val) or str(val).strip() == "":
                    continue
                parts.append(f"{col}: {str(val).strip()}")
            if parts:
                lines.append("; ".join(parts))
        if lines:
            units.append(ParsedUnit(label=label, text="\n".join(lines), tabular=True))
    return units


def _parse_excel(data: bytes, ext: str, row_cap: int) -> list[ParsedUnit]:
    engine = "openpyxl" if ext == ".xlsx" else "xlrd"
    try:
        sheets = pd.read_excel(
            io.BytesIO(data), sheet_name=None, dtype=str, engine=engine
        )
    except Exception as exc:  # noqa: BLE001
        raise AppError("VALIDATION_FAILED", "Could not read the spreadsheet.", 422) from exc
    return _rows_to_units(sheets, row_cap)


def _parse_csv(data: bytes, row_cap: int) -> list[ParsedUnit]:
    text = data.decode("utf-8", errors="replace")
    try:
        df = pd.read_csv(
            io.StringIO(text), dtype=str, keep_default_na=False, engine="python"
        )
    except Exception as exc:  # noqa: BLE001
        raise AppError("VALIDATION_FAILED", "Could not read the CSV file.", 422) from exc
    return _rows_to_units({"csv": df}, row_cap)


def _parse_text(data: bytes) -> list[ParsedUnit]:
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        text = data.decode("latin-1", errors="replace")
    if not text.strip():
        raise AppError("NO_EXTRACTABLE_TEXT", "no extractable text", 422)
    return [ParsedUnit(label="1", text=text, tabular=False)]


def _parse_pdf(data: bytes) -> list[ParsedUnit]:
    from pypdf import PdfReader

    units: list[ParsedUnit] = []
    try:
        reader = PdfReader(io.BytesIO(data))
    except Exception as exc:  # noqa: BLE001
        raise AppError("VALIDATION_FAILED", "Could not read the PDF.", 422) from exc

    page_texts: list[str] = []
    for page in reader.pages:
        try:
            page_texts.append(page.extract_text() or "")
        except Exception:  # noqa: BLE001
            page_texts.append("")

    # pdfplumber tables (best-effort; pdfplumber is optional at runtime).
    table_units: dict[int, list[str]] = {}
    try:
        import pdfplumber

        with pdfplumber.open(io.BytesIO(data)) as pdf:
            for idx, page in enumerate(pdf.pages):
                for table in page.extract_tables() or []:
                    if not table or len(table) < 2:
                        continue
                    header = [str(c or "").strip() for c in table[0]]
                    rows = []
                    for raw in table[1:]:
                        parts = []
                        for col, cell in zip(header, raw):
                            if cell is None or str(cell).strip() == "":
                                continue
                            parts.append(f"{col}: {str(cell).strip()}")
                        if parts:
                            rows.append("; ".join(parts))
                    if rows:
                        table_units.setdefault(idx, []).extend(rows)
    except Exception:  # noqa: BLE001
        table_units = {}

    for idx, text in enumerate(page_texts):
        cleaned = text.strip()
        if cleaned:
            units.append(ParsedUnit(label=str(idx + 1), text=cleaned, tabular=False))
        for rows in [table_units.get(idx, [])]:
            if rows:
                units.append(
                    ParsedUnit(label=str(idx + 1), text="\n".join(rows), tabular=True)
                )

    if not units:
        raise AppError("NO_EXTRACTABLE_TEXT", "no extractable text", 422)
    return units


def _parse_docx(data: bytes) -> list[ParsedUnit]:
    import docx

    try:
        document = docx.Document(io.BytesIO(data))
    except Exception as exc:  # noqa: BLE001
        raise AppError("VALIDATION_FAILED", "Could not read the DOCX file.", 422) from exc

    lines: list[str] = []
    for para in document.paragraphs:
        if para.text.strip():
            lines.append(para.text.strip())
    for table in document.tables:
        header = [cell.text.strip() for cell in table.rows[0].cells] if table.rows else []
        for row in table.rows[1:] if header else table.rows:
            parts = []
            for col, cell in zip(header, [c.text.strip() for c in row.cells]):
                if cell:
                    parts.append(f"{col}: {cell}")
            if parts:
                lines.append("; ".join(parts))
    if not lines:
        raise AppError("NO_EXTRACTABLE_TEXT", "no extractable text", 422)
    return [ParsedUnit(label="1", text="\n".join(lines), tabular=False)]


def _parse_doc(data: bytes) -> list[ParsedUnit]:
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        raise AppError(
            "DOC_CONVERSION_UNAVAILABLE",
            "Legacy .doc files need LibreOffice installed. Please upload a .docx.",
            422,
        )
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "input.doc"
        src.write_bytes(data)
        try:
            subprocess.run(
                [
                    soffice,
                    "--headless",
                    "--convert-to",
                    "docx",
                    "--outdir",
                    tmp,
                    str(src),
                ],
                timeout=60,
                check=True,
                capture_output=True,
            )
        except Exception as exc:  # noqa: BLE001
            raise AppError(
                "DOC_CONVERSION_UNAVAILABLE", "Could not convert the .doc file.", 422
            ) from exc
        converted = Path(tmp) / "input.docx"
        if not converted.exists():
            raise AppError(
                "DOC_CONVERSION_UNAVAILABLE", "Could not convert the .doc file.", 422
            )
        return _parse_docx(converted.read_bytes())
