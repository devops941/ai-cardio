"""Cleaning and chunking (Section 8.4)."""

from __future__ import annotations

import re

_PAGE_NUMBER = re.compile(r"^\s*[-–—]?\s*\d{1,4}\s*[-–—]?\s*$")
_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")


def clean_text(text: str) -> str:
    text = _CONTROL.sub("", text)
    text = re.sub(r"-\n", "", text)
    lines = []
    for raw in text.splitlines():
        line = re.sub(r"\s+", " ", raw).strip()
        if not line or _PAGE_NUMBER.match(line):
            continue
        lines.append(line)
    return "\n".join(lines)


def chunk_text(text: str, size: int = 800, overlap: int = 120) -> list[str]:
    text = " ".join(text.split())
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        if end < len(text):
            cut = text.rfind(". ", start + size // 2, end)
            if cut != -1:
                end = cut + 1
        chunks.append(text[start:end].strip())
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return [c for c in chunks if c]


def chunk_rows(rows: list[str], size: int = 800) -> list[str]:
    chunks: list[str] = []
    cur = ""
    for row in rows:
        if len(row) > size:
            if cur:
                chunks.append(cur.strip())
                cur = ""
            chunks.extend(chunk_text(row, size, 120))
            continue
        if cur and len(cur) + 1 + len(row) > size:
            chunks.append(cur.strip())
            cur = ""
        cur = f"{cur}\n{row}" if cur else row
    if cur:
        chunks.append(cur.strip())
    return chunks
