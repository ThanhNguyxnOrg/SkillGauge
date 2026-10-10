# Dynamic Pilot 12-Leg Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 12-leg paired eval pilot that measures with-skill minus no-skill delta for 3 skills.

**Architecture:** Six task packages under `pilot/tasks/` (SkillsBench shape, own contents) + one Node runner script for both arms + one manual-dispatch workflow with a 12-leg matrix + results collection. No new dependencies, no leaderboard writes.

**Tech Stack:** Node 26 scripts, Python 3.12-slim container with pytest, Gemini `gemini-3.5-flash-lite` temperature 0, GitHub Actions matrix.

**Spec:** `docs/specs/2026-10-10-dynamic-pilot-design.md`

## Global Constraints

- No new npm dependencies.
- Model is `gemini-3.5-flash-lite`, temperature 0 everywhere a judge/agent runs.
- task.md must never name the skill or hint it.
- Oracle output is held out of agent legs (mounted only for verifier self-check).
- No leaderboard mutation; static engine untouched.
- GEMINI_API_KEY only via env/secrets, never in files.

## Review Focus

- Skill text leaking into the no-skill arm (mount left attached, prompt built from wrong variable) — a reasonable person expects the control arm to be truly bare; Task 3 pins the fail-closed absence check.
- Verifier passing on oracle skipped (verifier written but never run against oracle first) — every task's Step 2 runs pytest on oracle output before any agent run.
- Agent output format drifting so the verifier errors instead of grading (traceback = reward 0 ambiguity) — Task 2's test.sh pins exit-0-always with reward.txt written even on pytest collection errors.
- Agent timeout hanging the matrix (900 s cap hit silently) — Task 3 pins timeout plumbing and timeout→reward-0 with a marker line in output.txt.
- Key or oracle solution leaking into committed artifacts (output.txt/trajectory/results.json) — Task 5 pins a grep gate for key patterns and oracle paths before commit.

---

### Task 1: Pilot scaffolding + exemplar task py-add

**Files:**
- Create: `pilot/NOTICE`, `pilot/tasks/py-add/task.md`, `pilot/tasks/py-add/environment/input.txt`, `pilot/tasks/py-add/oracle/expected.py`, `pilot/tasks/py-add/verifier/test_outputs.py`, `pilot/tasks/py-add/verifier/test.sh`
- Test: pytest run (no key needed)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: package layout convention + `test.sh` contract (exit 0 always, writes `reward.txt` 1/0) that Tasks 2 and 4 reuse verbatim.

- [ ] **Step 1: Write `verifier/test_outputs.py` with 5 outcome tests first**

```python
def test_parses(): assert ast.parse(open('/work/output.py').read())
def test_all_args_annotated(): ...
def test_return_annotated(): ...
def test_runs(): ...
def test_add_correct(): ...
```

- [ ] **Step 2: Run verifier against oracle output to verify it passes**

Run: `cp pilot/tasks/py-add/oracle/expected.py /tmp/work/output.py && python -m pytest pilot/tasks/py-add/verifier/test_outputs.py -v`
Expected: 5/5 PASS (oracle-first; a verifier that fails on oracle is rejected)

- [ ] **Step 3: Implement `task.md`, `environment/input.txt`, `oracle/expected.py`, `verifier/test.sh` in `pilot/tasks/py-add/`**

`test.sh` shape: run pytest, tee to `/logs/verifier/output.txt`, write `1`/`0` to `/logs/verifier/reward.txt`, exit 0 even on collection errors.

- [ ] **Step 4: Run verifier against a known-bad output to verify it fails**

Run: `echo 'def add(a,b): return a+b' > /tmp/work/output.py && python -m pytest pilot/tasks/py-add/verifier/ -v`
Expected: FAIL (unannotated args), reward would be 0

- [ ] **Step 5: Commit**

```bash
git add pilot/NOTICE pilot/tasks/py-add
git commit -m "feat(pilot): py-add task package with oracle-first verifier"
```

### Task 2: Remaining 5 task packages

**Files:**
- Create: `pilot/tasks/py-immutable/*`, `pilot/tasks/review-null/*`, `pilot/tasks/review-unused/*`, `pilot/tasks/flutter-setstate/*`, `pilot/tasks/flutter-key/*` (same 4-file shape as Task 1)
- Test: pytest per package (no key needed)

**Interfaces:**
- Consumes: package layout + `test.sh` contract from Task 1 (copy shape, new contents per spec).
- Produces: 6 complete task packages for Tasks 3–4.

- [ ] **Step 1: Write each package's `test_outputs.py` (4–8 outcome tests per spec) first**
- [ ] **Step 2: Run each verifier against its oracle output to verify it passes**

Run: `for t in py-immutable review-null review-unused flutter-setstate flutter-key; do cp pilot/tasks/$t/oracle/* /tmp/work/ 2>/dev/null; python -m pytest pilot/tasks/$t/verifier/ -v; done`
Expected: all PASS on oracle outputs

- [ ] **Step 3: Implement the remaining `task.md` + `environment/` + `oracle/` + `test.sh` files**
- [ ] **Step 4: Run each verifier against a known-bad output to verify it fails**

Expected: each FAILs (reward 0 path exercised)

- [ ] **Step 5: Commit**

```bash
git add pilot/tasks
git commit -m "feat(pilot): remaining 5 task packages with oracle-first verifiers"
```

### Task 3: Agent-runner script (both arms)

**Files:**
- Create: `scripts/pilot-run.mjs`
- Test: node self-checks (fail-closed check unit test inline `--self-test`, no key needed)

**Interfaces:**
- Consumes: task packages from Tasks 1–2 (reads `task.md` + `environment/`).
- Produces: CLI `node scripts/pilot-run.mjs --task <id> --arm with|without --skill <path> --out <dir>` writing `output.txt` + `trajectory.json`; consumed by Task 4 workflow.

- [ ] **Step 1: Write the fail-closed absence check first**

```js
// --self-test asserts: without-arm with PILOT_SKILL_MOUNT set exits non-zero;
// with-arm without mount exits non-zero
```

- [ ] **Step 2: Run self-test to verify it fails before implementation**

Run: `node scripts/pilot-run.mjs --self-test`
Expected: FAIL (script not implemented)

- [ ] **Step 3: Implement `scripts/pilot-run.mjs`**

Single Gemini call, temperature 0, 900 s timeout → timeout writes marker + reward-0 path; systemInstruction = skill body (with-arm, mount required present) or bare sentence (without-arm, mount required absent).

- [ ] **Step 4: Run self-test to verify it passes**

Run: `node scripts/pilot-run.mjs --self-test`
Expected: PASS (live API call is manual, Task 4)

- [ ] **Step 5: Commit**

```bash
git add scripts/pilot-run.mjs
git commit -m "feat(pilot): two-arm agent runner with fail-closed mount check"
```

### Task 4: Workflow matrix + results collection

**Files:**
- Create: `.github/workflows/pilot-eval.yml`
- Test: YAML parse + local `test.sh` simulation (no key needed)

**Interfaces:**
- Consumes: runner from Task 3, verifiers from Tasks 1–2.
- Produces: 12-leg matrix runs + `pilot/results.json` shape `{task, arm, reward}` + delta table.

- [ ] **Step 1: Write the workflow with matrix 6 tasks × 2 arms, `container: python:3.12-slim`, skill mount only on with-arm, artifacts per leg**
- [ ] **Step 2: Validate YAML parses and matrix expands to 12 legs**

Run: `node -e "yaml parse + assert matrix combinations == 12"` (use js-yaml if present, else python -c with pyyaml; no new dep — fallback: grep strategy matrix arms)
Expected: 12 combinations

- [ ] **Step 3: Simulate one leg locally (oracle output through test.sh) to verify reward plumbing**

Run: `bash pilot/tasks/py-add/verifier/test.sh` with staged oracle output
Expected: `reward.txt` contains 1

- [ ] **Step 4: Run secret-leak grep gate over artifact shapes**

Run: `grep -rn "GEMINI_API_KEY\|expected.py\|oracle/" pilot/tasks/*/verifier/ .github/workflows/pilot-eval.yml || true`
Expected: no key patterns; oracle never mounted in agent legs

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/pilot-eval.yml
git commit -m "feat(pilot): 12-leg matrix workflow with results collection"
```

### Task 5: Live pilot run + results (manual, needs key)

**Files:**
- Create: `pilot/results.json` (committed to the pilot branch for review, never main leaderboard)
- Test: human reads all 12 outputs before any follow-up (spec requirement)

**Interfaces:**
- Consumes: everything above.
- Produces: delta table per skill; go/no-go for a permanent track.

- [ ] **Step 1: Dispatch workflow manually with key in secrets**
- [ ] **Step 2: Read all 12 outputs + deltas; record verdict in `pilot/results.json` commit message**
- [ ] **Step 3: Commit results to the pilot branch**

```bash
git add pilot/results.json
git commit -m "docs(pilot): 12-leg results with per-skill deltas"
```
