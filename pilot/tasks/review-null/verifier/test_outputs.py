"""Outcome tests for review-null: planted hardcoded API key must be flagged."""
import os
import pathlib

OUT = pathlib.Path(os.environ.get("PILOT_WORK_DIR", "/work")) / "output.txt"


def _text():
    assert OUT.exists(), "output.txt missing"
    return OUT.read_text().lower()


def test_flags_critical():
    assert "[critical]" in _text()


def test_mentions_planted_secret():
    t = _text()
    assert "apikey" in t.replace(" ", "") or "api key" in t


def test_has_summary():
    assert "## review summary" in _text()


def test_has_verdict():
    assert "verdict:" in _text()
