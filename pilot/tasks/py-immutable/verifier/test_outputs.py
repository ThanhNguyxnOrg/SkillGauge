"""Outcome tests for py-immutable: frozen value object with name/email."""
import ast
import os
import pathlib

SRC = pathlib.Path(os.environ.get("PILOT_WORK_DIR", "/work")) / "output.py"


def _tree():
    return ast.parse(SRC.read_text())


def test_output_exists_and_parses():
    assert SRC.exists(), "output.py missing"
    _tree()


def test_immutable_construct():
    src = SRC.read_text()
    assert "frozen=True" in src or "NamedTuple" in src, "no frozen construct"


def test_has_name_and_email_fields():
    src = SRC.read_text()
    assert "name" in src and "email" in src


def test_instantiates():
    ns: dict = {}
    exec(compile(_tree(), "output.py", "exec"), ns)
    cls = next(v for v in ns.values() if isinstance(v, type))
    obj = cls(name="a", email="b@c") if "NamedTuple" not in SRC.read_text() else cls("a", "b@c")
    assert obj is not None


def test_immutable_after_construction():
    ns: dict = {}
    exec(compile(_tree(), "output.py", "exec"), ns)
    cls = next(v for v in ns.values() if isinstance(v, type))
    try:
        obj = cls(name="a", email="b@c")
        obj.name = "changed"
    except Exception:
        return
    if "NamedTuple" in SRC.read_text():
        raise AssertionError("NamedTuple allowed mutation")
    raise AssertionError("frozen object allowed mutation")
