"""Outcome tests for review-unused: dead code must be flagged."""
import os
import pathlib

OUT = pathlib.Path(os.environ.get("PILOT_WORK_DIR", "/work")) / "output.txt"


def _text():
    assert OUT.exists(), "output.txt missing"
    return OUT.read_text().lower()


def test_mentions_dead_code():
    t = _text()
    assert "console" in t or "unused" in t or "dead code" in t


def test_has_summary():
    assert "## review summary" in _text()


def test_has_verdict():
    assert "verdict:" in _text()
