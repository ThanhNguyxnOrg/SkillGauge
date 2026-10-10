# Paired-execution track feasibility — minimal with/without-skill eval (2026-10-10)

Scope: SkillGauge pilot (3–5 skills, same task with vs without skill, containerized,
deterministic verifier). Sources restricted to primaries listed below; every claim
carries its URL. No code or other docs touched.

## 1. How benchmarks isolate runs

- SkillsBench evaluates each task in a fresh sandbox: `--sandbox docker` locally,
  `--sandbox modal` in cloud (Modal is the default cloud provider).
  (https://github.com/benchflow-ai/skillsbench)
- SkillsBench task packages pin their world: `environment/Dockerfile` installs exact
  dependency versions and copies frozen inputs; `environment/network_mode: no-network`
  is a supported frontmatter knob.
  (https://github.com/benchflow-ai/skillsbench/blob/main/CONTRIBUTING.md)
- SWE-bench runs evaluation in containerized Docker images built in three layers
  (base → ~60 environment images → per-instance images) for reproducibility.
  (https://swebench.com/SWE-bench/guides/docker_setup/)
- AgentBench encapsulates complex environments in Docker images and runs each task
  in separate workers so environments stay isolated and conflict-free.
  (https://arxiv.org/html/2308.03688v3, §4.1 "Toolkit")
- AgentBench's OS environment is a genuine interactive Ubuntu Docker container.
  (https://arxiv.org/html/2308.03688v3, §3.1)
- GitHub Actions runs each job on a fresh VM (single-CPU runners excepted), and a job
  can additionally run all steps inside a container via `jobs.<job_id>.container`
  with pinned `image:`, `env:`, `volumes:`, and `options:`.
  (https://docs.github.com/en/actions/using-github-hosted-runners/using-github-hosted-runners/about-github-hosted-runners)
  (https://docs.github.com/en/actions/using-jobs/running-jobs-in-a-container)

## 2. Minimal verifier shape

- SkillsBench verifier = `verifier/test.sh` + `verifier/test_outputs.py`: test.sh runs
  pytest, tees output to `/logs/verifier/output.txt`, writes scalar reward (`1`/`0`)
  to `/logs/verifier/reward.txt`, and itself exits 0.
  (https://github.com/benchflow-ai/skillsbench/blob/main/CONTRIBUTING.md)
- Verifier rules worth copying: test the result not the process; 4–10 focused tests;
  outcome-based with clear failure messages; oracle must score reward 1.0 first.
  (https://github.com/benchflow-ai/skillsbench/blob/main/CONTRIBUTING.md)
- SWE-bench grades by applying the model patch and running the repo's own tests;
  an instance is "resolved" only if the required tests pass, recorded per instance
  in `report.json` beside `test_output.txt`, `run_instance.log`, `eval.sh`.
  (https://swebench.com/SWE-bench/guides/evaluation/)
- AgentBench uses per-environment metrics (mostly success rate) plus a fixed-weight
  overall score, and classifies every finish (complete vs CLE/IF/IA/TLE) so infra
  failures are distinguishable from model failures.
  (https://arxiv.org/html/2308.03688v3, §2 and §4.1)

## 3. Cost: runner minutes and LLM calls

- GitHub billing: Linux 2-core `$0.006`/min, Linux 1-core `$0.002`/min; public repos
  using standard runners are free; private Free-plan quota is 2,000 min/month.
  (https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- SkillsBench caps each task: `agent.timeout_sec: 900`, `verifier.timeout_sec: 900`,
  `cpus: 1, memory_mb: 4096` — i.e. worst case 15 runner-min per arm by construction.
  (https://github.com/benchflow-ai/skillsbench/blob/main/CONTRIBUTING.md)
- LLM-call budget precedent: AgentBench dev+test totals ~269+1,014 samples needing
  ~3k+11k inference calls (≈ MMLU scale), with per-task rounds ranging 5–35 and
  greedy decoding (`temperature=0`) for reproducibility.
  (https://arxiv.org/html/2308.03688v3, §4.1)
- Implication: cost is dominated by agent LLM tokens (~5–15 rounds/run at the pilot's
  difficulty), not by runner minutes, which round to ~zero on a public repo.

## 4. Preventing leakage between with/without arms

- SkillsBench injects skills at runtime (`--skill-mode with-skill/no-skill
  --skills-dir …`) and forbids baking skills into images or agent home dirs.
  (https://github.com/benchflow-ai/skillsbench/blob/main/CONTRIBUTING.md)
- SkillsBench prompts must not name skills or hint which to use, so the no-skill arm
  is a fair control.
  (https://github.com/benchflow-ai/skillsbench/blob/main/CONTRIBUTING.md)
- SWE-bench forces fresh grading state per run: results are cached by
  `run_id`+`instance_id`, so re-grading requires a new `run_id`; `--clean` removes
  instance containers/images afterwards.
  (https://swebench.com/SWE-bench/guides/evaluation/)
- Pilot translation: separate matrix legs (fresh container each), skills volume
  mounted only in the with-skill leg, no shared volumes/caches between legs, and a
  fail-closed check that the skills dir is absent in the no-skill leg.

## 5. How results are published

- SWE-bench publishes `% Resolved` leaderboards plus per-run `results.json` and
  per-instance traces (`test_output.txt`, `run_instance.log`, `patch.diff`).
  (https://www.swebench.com/) (https://swebench.com/SWE-bench/guides/evaluation/)
- SkillsBench requires every task PR to report with-vs-without pass rates, failure
  analysis, and artifacts, and ships a versioned dataset on Hugging Face.
  (https://github.com/benchflow-ai/skillsbench/blob/main/CONTRIBUTING.md)
  (https://huggingface.co/datasets/benchflow/skillsbench)
- Cloud submission precedent (`sb submit`, `sb get-report`) shows traces + verdicts
  can be published without exposing oracle solutions.
  (https://swebench.com/sb-cli/)
- MCP note: no MCP server is needed for the pilot; file-mounted skills match the
  SkillsBench runtime-injection model, so MCP is out of scope.
  (https://github.com/benchflow-ai/skillsbench/blob/main/CONTRIBUTING.md)

## 6. Cheapest pilot design: 3 skills × 2 tasks

- Runner: `ubuntu-latest` standard runner (free on public repo), one job per task
  inside `container: python:3.12-slim` built from the task's pinned Dockerfile.
  (https://docs.github.com/en/actions/using-jobs/running-jobs-in-a-container)
  (https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- Matrix: 6 tasks × 2 arms (with-skill / no-skill) = 12 legs; each leg = agent run
  (cap 900 s) → `test.sh` → pytest verdict → `reward.txt`; fail-closed skill-absence
  check in the no-skill leg.
  (https://github.com/benchflow-ai/skillsbench/blob/main/CONTRIBUTING.md)
- Verifier: copy the SkillsBench `test.sh` verbatim shape (4–10 outcome tests,
  `reward.txt` 1/0, exit 0); publish `output.txt` + trajectory as workflow artifacts
  and a `results.json` with per-leg `{task, arm, reward}` plus fail-to-pass lists.
  (https://swebench.com/SWE-bench/guides/evaluation/)
- Cost estimate: 12 legs × ~5 min typical ≈ 60 runner-min (≈ $0 on public repo;
  ≈ $0.36 on private at $0.006/min); LLM ≈ 12 runs × ~10 rounds ≈ 120 calls at
  `temperature=0`, i.e. single-digit dollars on any frontier-lite model.
  (https://docs.github.com/en/billing/concepts/product-billing/github-actions)
  (https://arxiv.org/html/2308.03688v3, §4.1)
