"""Upload safety and parser tests (Section 12.2)."""

from __future__ import annotations

import io
import zipfile

import pytest

from app.errors import AppError
from app.services.file_safety import sanitise_filename, validate_upload
from app.services.parser import parse_file


def _make_zip(entries: dict[str, bytes]) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, content in entries.items():
            zf.writestr(name, content)
    return buffer.getvalue()


def test_sanitise_filename_strips_paths():
    assert sanitise_filename("../../etc/passwd") == "passwd"
    assert sanitise_filename("C:\\Users\\x\\report.pdf") == "report.pdf"
    assert sanitise_filename("my file (1).pdf") == "my file _1_.pdf"


def test_rejects_disallowed_extension():
    with pytest.raises(AppError) as exc:
        validate_upload("evil.exe", b"MZ\x90\x00")
    assert exc.value.code == "UNSUPPORTED_FILE_TYPE"


def test_rejects_signature_mismatch():
    with pytest.raises(AppError) as exc:
        validate_upload("fake.pdf", b"this is not a pdf at all")
    assert exc.value.code == "FILE_SIGNATURE_MISMATCH"


def test_rejects_empty_file():
    with pytest.raises(AppError) as exc:
        validate_upload("empty.txt", b"")
    assert exc.value.code == "FILE_SIGNATURE_MISMATCH"


def test_accepts_valid_pdf_signature():
    assert validate_upload("doc.pdf", b"%PDF-1.4\nrest") == ".pdf"


def test_accepts_valid_docx_zip():
    data = _make_zip({"word/document.xml": b"<xml/>"})
    assert validate_upload("doc.docx", data) == ".docx"


def test_tabular_only_rejects_pdf():
    with pytest.raises(AppError) as exc:
        validate_upload("doc.pdf", b"%PDF-1.4\n", tabular_only=True)
    assert exc.value.code == "UNSUPPORTED_FILE_TYPE"


def test_rejects_decompression_bomb():
    payload = b"0" * (5 * 1024 * 1024)
    data = _make_zip({"bomb.xml": payload})
    with pytest.raises(AppError) as exc:
        validate_upload("bomb.docx", data)
    assert exc.value.code == "FILE_SIGNATURE_MISMATCH"


def test_rejects_oversize_file(monkeypatch):
    monkeypatch.setenv("MAX_UPLOAD_MB", "1")
    from app import config

    config.get_settings.cache_clear()
    import importlib

    importlib.reload(config)

    from app.services import file_safety

    importlib.reload(file_safety)

    big = b"%PDF-1.4\n" + b"x" * (2 * 1024 * 1024)
    with pytest.raises(AppError) as exc:
        file_safety.validate_upload("big.pdf", big)
    assert exc.value.code == "FILE_TOO_LARGE"


def test_parse_csv_to_units():
    csv_bytes = b"name,city\nAsha,Chennai\nRavi,Madurai\n"
    units = parse_file("data.csv", csv_bytes)
    assert len(units) == 1
    assert units[0].tabular is True
    assert "name: Asha" in units[0].text
    assert "city: Madurai" in units[0].text


def test_parse_csv_row_cap_enforced():
    rows = "n\n" + "\n".join(str(i) for i in range(20))
    with pytest.raises(AppError) as exc:
        parse_file("data.csv", rows.encode(), row_cap=10)
    assert exc.value.code == "VALIDATION_FAILED"


def test_parse_txt_to_unit():
    units = parse_file("notes.txt", b"Heart basics for patients.")
    assert len(units) == 1
    assert units[0].tabular is False
    assert "Heart basics" in units[0].text


def test_parse_rejects_empty_text():
    with pytest.raises(AppError) as exc:
        parse_file("notes.txt", b"   \n  \n")
    assert exc.value.code == "NO_EXTRACTABLE_TEXT"


def test_parse_pdf_page_split():
    reportlab = pytest.importorskip("reportlab.pdfgen.canvas")
    from reportlab.lib.pagesizes import A4

    buffer = io.BytesIO()
    canvas = reportlab.Canvas(buffer, pagesize=A4)
    for page in range(2):
        canvas.drawString(72, 720, f"Page {page + 1} about the heart")
        canvas.showPage()
    canvas.save()

    units = parse_file("report.pdf", buffer.getvalue())
    assert len(units) >= 2
    assert all(unit.tabular is False for unit in units)
