# Spec: Dynamic Pilot Track — 12-leg paired eval (2026-10-10)

> Approach A (approved): native mini-track in-repo, SkillsBench shape, Gemini direct. No BenchFlow CLI, no new deps.

## Goal

Produce a credible with-skill minus no-skill delta for 3 skills (6 tasks × 2 arms = 12 legs) that tells us whether static Tier predicts execution success.

## Non-goals

Reproducing the SkillsBench paper; multi-model comparison; MCP integration; touching static scoring.

## Task packages

`pilot/tasks/<task-id>/` per task, mirroring SkillsBench (Apache 2.0, attribution in `pilot/NOTICE`):
- `task.md` — outcome-focused prompt, must NOT name the skill or hint it.
- `environment/` — pinned inputs (code snippets to review, function specs).
- `oracle/` — reference solution that scores reward 1.0 (run first, `--agent oracle` equivalent: a checked-in expected-output file + the verifier passing on it).
- `verifier/test_outputs.py` — 4–8 pytest outcome tests (result not process); `test.sh` runs pytest, writes `reward.txt` (1/0), always exits 0.

## The 6 tasks (concrete)

python-coding-style (skill: `skills/ecc/python-coding-style.md`):
- `py-add`: "Write a Python function adding two numbers, code only." Verifier: AST parse OK, all args annotated, return annotated (ast module).
- `py-immutable`: "Model a user with name/email, immutable." Verifier: source contains `frozen=True` or `NamedTuple`, instantiation works.

code-reviewer (skill: `skills/ecc/code-reviewer.md`):
- `review-null`: snippet with planted null-deref. Verifier: output contains the skill's report section headers + the planted-bug keyword, no section missing.
- `review-unused`: snippet with unused import + wrong verdict trap. Verifier: flags unused import, verdict line present.

flutter-reviewer (skill: `skills/ecc/flutter-reviewer.md`):
- `flutter-setstate`: snippet calling setState after dispose. Verifier: flags `mounted`/dispose issue keyword + format sections present.
- `flutter-key`: list-view without keys snippet. Verifier: mentions `key`, sections present.

## Runner

`.github/workflows/pilot-eval.yml` (manual dispatch only): matrix 6 tasks × 2 arms = 12 legs, each in `container: python:3.12-slim` built from a pinned base + task inputs copied in. Agent step: single Gemini call (`gemini-3.5-flash-lite`, temperature 0) with `systemInstruction` = skill body (with-arm) or bare assistant sentence (no-arm); skills volume mounted ONLY in with-arm; no-arm leg fail-closed checks the mount is absent. Output saved to `output.txt`. Then `test.sh` → pytest → `reward.txt`. Timeouts: agent 900 s, verifier 300 s (pilot tasks are single-call; caps are ceilings, typical leg < 2 min).

## Leakage controls

Prompts never name skills; no shared volumes/caches between legs; fresh `run_id` per grading; oracle output held out of task.md (kept in `oracle/`, never mounted in agent legs).

## Results

Each leg uploads `output.txt` + trajectory JSON as workflow artifacts; a collect job writes `pilot/results.json` (`{task, arm, reward}` per leg) plus with-minus-without delta per skill, committed to the branch (not main) for review. No leaderboard mutation: static tiers stay the only ranked signal until a follow-up decision.

## Cost

12 legs × ~2 min ≈ 24 runner-min ($0 public) + ~12–24 LLM calls, single-digit dollars worst case.

## Attribution

`pilot/NOTICE`: task package shape + verifier conventions adapted from SkillsBench (Apache 2.0, benchflow-ai/skillsbench).

## Risks

n=2 tasks/skill is indicative, not conclusive; single model; single temperature; keyword verifiers can be gamed by a model that echoes format without reasoning (accepted for pilot; human reads the 12 outputs before any follow-up).

## Self-review

Placeholders: none (all 6 tasks concrete, model pinned, timeouts set). Consistency: no leaderboard writes; static engine untouched. Scope: one pilot, no framework generalization. Ambiguity: "checked-in expected-output" means oracle/expected.txt + verifier green on it before agent runs — explicit.
