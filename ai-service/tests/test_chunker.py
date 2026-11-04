"""Red-flag and chunker tests (Section 12.2)."""

from __future__ import annotations

from app.services.chunker import chunk_rows, chunk_text, clean_text
from app.services.red_flags import check_red_flags


def test_red_flag_vectors(vectors):
    for case in vectors["red_flags"]:
        fired = check_red_flags(
            set(case["symptoms"]),
            case["duration_min"],
            case["severity"],
            case["sudden"],
            case["free_text"],
        )
        assert fired == case["expected"], case


def test_chunk_text_size_and_overlap():
    text = ("The heart pumps blood around the body. " * 200).strip()
    chunks = chunk_text(text, 800, 120)
    assert chunks
    assert all(len(c) <= 800 for c in chunks)
    assert all(c.strip() for c in chunks)
    assert len(chunks) > 1


def test_chunk_text_prefers_sentence_boundary():
    text = "First sentence here. Second sentence here. Third sentence here. " * 40
    chunks = chunk_text(text, 100, 20)
    assert chunks
    assert all(len(c) <= 100 for c in chunks)


def test_chunk_rows_keeps_rows_intact():
    rows = ["row number one", "row number two", "row number three"]
    chunks = chunk_rows(rows, 30)
    for chunk in chunks:
        for row in chunk.split("\n"):
            assert row in rows


def test_chunk_rows_splits_long_row():
    long_row = "x" * 2000
    chunks = chunk_rows([long_row], 800)
    assert len(chunks) >= 3
    assert all(len(c) <= 800 for c in chunks)


def test_clean_text_drops_page_numbers_and_joins_hyphens():
    raw = "A word split hy-\nphen. \n12\n\nAnother line."
    cleaned = clean_text(raw)
    assert "12" not in cleaned.split("\n")
    assert "hyphen" in cleaned
    assert "Another line." in cleaned
