"""Shared pytest fixtures."""

from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path

import pytest

# Force mock mode and an isolated Chroma path before app modules import settings.
os.environ.setdefault("LLM_MOCK", "true")

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

VECTORS_PATH = (
    Path(__file__).resolve().parents[2] / "docs" / "test-vectors" / "red_flags.json"
)


@pytest.fixture(scope="session")
def vectors() -> dict:
    return json.loads(VECTORS_PATH.read_text())


@pytest.fixture()
def isolated_chroma(monkeypatch, tmp_path):
    """Point the vector store at a throwaway Chroma folder for one test."""
    chroma_dir = tmp_path / "chroma"
    monkeypatch.setenv("CHROMA_PATH", str(chroma_dir))

    import importlib

    from app import config

    config.get_settings.cache_clear()
    importlib.reload(config)

    from app.services import vectorstore

    importlib.reload(vectorstore)
    yield vectorstore
    importlib.reload(vectorstore)


@pytest.fixture()
def temp_models_dir(monkeypatch, tmp_path):
    monkeypatch.setenv("MODELS_DIR", str(tmp_path / "models"))
    import importlib

    from app import config

    config.get_settings.cache_clear()
    importlib.reload(config)
    from app.services import ml_model

    importlib.reload(ml_model)
    yield ml_model
