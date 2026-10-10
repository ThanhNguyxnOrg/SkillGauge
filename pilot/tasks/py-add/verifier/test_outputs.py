"""Outcome tests for py-add: model a Python add-function, fully annotated."""
import ast
import os
import pathlib

# Container path is /work; PILOT_WORK_DIR override allows local runs.
SRC = pathlib.Path(os.environ.get("PILOT_WORK_DIR", "/work")) / "output.py"


def _tree():
    return ast.parse(SRC.read_text())


def test_output_exists_and_parses():
    assert SRC.exists(), "output.py missing"
    _tree()


def test_function_defined():
    names = [n.name for n in ast.walk(_tree()) if isinstance(n, ast.FunctionDef)]
    assert len(names) >= 1, "no function defined"


def test_all_args_annotated():
    for node in ast.walk(_tree()):
        if isinstance(node, ast.FunctionDef):
            assert node.args.args, "function has no params to annotate"
            for a in node.args.args:
                assert a.annotation is not None, f"param {a.arg} unannotated"


def test_return_annotated():
    for node in ast.walk(_tree()):
        if isinstance(node, ast.FunctionDef):
            assert node.returns is not None, "missing return annotation"


def test_add_correct():
    ns: dict = {}
    exec(compile(_tree(), "output.py", "exec"), ns)
    fn = next(v for v in ns.values() if callable(v))
    assert fn(2, 3) == 5
