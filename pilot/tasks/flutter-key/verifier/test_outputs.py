"""Outcome tests for flutter-key: index-based keys must be flagged."""
import os
import pathlib

OUT = pathlib.Path(os.environ.get("PILOT_WORK_DIR", "/work")) / "output.txt"


def _text():
    assert OUT.exists(), "output.txt missing"
    return OUT.read_text().lower()


def test_mentions_keys():
    assert "key" in _text()


def test_mentions_oracle_fix():
    # Oracle-distinctive: the fix must be named, not just the bug (anti-template).
    assert "stable" in _text()


def test_has_severity_tag():
    t = _text()
    assert "[high]" in t or "[critical]" in t


def test_has_summary():
    assert "## review summary" in _text()


def test_has_verdict():
    assert "verdict:" in _text()
