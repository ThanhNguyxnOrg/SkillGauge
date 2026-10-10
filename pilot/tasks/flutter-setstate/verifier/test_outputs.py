"""Outcome tests for flutter-setstate: unmounted setState must be flagged."""
import os
import pathlib

OUT = pathlib.Path(os.environ.get("PILOT_WORK_DIR", "/work")) / "output.txt"


def _text():
    assert OUT.exists(), "output.txt missing"
    return OUT.read_text().lower()


def test_mentions_lifecycle():
    t = _text()
    assert "mounted" in t or "dispose" in t


def test_mentions_oracle_fix():
    # Oracle-distinctive: the guard must be named, not just the bug (anti-template).
    assert "!mounted" in _text()


def test_has_severity_tag():
    t = _text()
    assert "[high]" in t or "[critical]" in t


def test_has_summary():
    assert "## review summary" in _text()


def test_has_verdict():
    assert "verdict:" in _text()
