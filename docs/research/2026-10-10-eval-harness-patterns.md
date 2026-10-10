# Eval-harness patterns: how serious projects test prompt-quality scoring

*Date: 2026-10-10 · Scope: SkillGauge (static skill linter, Jest tests, 390 regex/keyword metrics dimA–dimZ) · Method: primary sources only, one URL per claim.*
*Current shape: `auditSkill` means 390 binary scores into `overallScore`, percentile tiers (P90 44.65 / P50 41.55), single 70% dim bar, plus an LLM `gaming_detected` multiplier fallback.*

## 1 · promptfoo — assertions as the test seam

- Seam is execution-level: `assert` blocks run against live LLM output, split into deterministic checks (`equals`/`contains`/`regex`/`is-json`/levenshtein/ROUGE/BLEU) vs model-assisted graders (`similar`, `llm-rubric`, `factuality`, `g-eval`). (https://www.promptfoo.dev/docs/configuration/expected-outputs/)
- Anti-tautology via independent oracles: `similar` uses a separate embedding provider (default `text-embedding-3-large`) with cosine/dot/euclidean metrics plus an explicit threshold, so the scorer never shares the generator's logic. (https://www.promptfoo.dev/docs/configuration/expected-outputs/similar/)
- Grade-based assertions force the judge to return `{pass, score, reason}` JSON against a written rubric; a `threshold` (e.g. 0.8) must hold *in addition to* `pass:true`, and grader errors never invert to pass under `not-`. (https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/llm-rubric/)
- Negation is first-class: every type has a `not-` form (`not-contains`, `not-llm-rubric`), which is how "must not" requirements (refusals, no-apology, no-secret) get tested without a second harness. (https://www.promptfoo.dev/docs/configuration/expected-outputs/)
- Nondeterminism is tamed by pinning the grader (`provider.config.temperature: 0`; the built-in OpenAI grader already defaults to 0) instead of trusting provider defaults; GPT-5 reasoning judges ignore temperature and need no override. (https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/llm-rubric/)
- Aggregation is the weighted average of assertion scores with per-test `threshold`, `assert-set` quorum thresholds, reusable `metric` tags, `derivedMetrics` (e.g. F1, MAPE via `__count`), and `transform` hooks that normalize output *before* asserting. (https://www.promptfoo.dev/docs/configuration/expected-outputs/)

## 2 · EleutherAI lm-evaluation-harness — Task YAML as executable spec

- Seam is declarative: `TaskConfig` YAML binds `dataset_path` to `doc_to_text`/`doc_to_target` prompts, `output_type` (`generate_until`/`loglikelihood`/`multiple_choice`), `filter_list`, and `metric_list`, shareable with commit hash for exact replication. (https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/task_guide.md)
- Oracle independence: gold targets ship with the dataset and metrics like `exact_match` take independent kwargs (`ignore_case`, `regexes_to_ignore`); filters (regex-extract → `take_first`/`majority_vote`) sit *between* raw output and scoring so answer extraction is tested separately from knowledge. (https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/task_guide.md)
- Nondeterminism becomes a measured variable: `repeats: 64` with temperature sampling plus named filter pipelines (`score-first` vs `maj@64` vs `maj@8`) reports single-sample and majority-vote scores side by side; `generation_kwargs` pins decoding. (https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/task_guide.md)
- Aggregation is explicit per metric (`mean`/`median`/`perplexity`/`bits_per_byte`); group configs aggregate sub-tasks with `weight_by_size` micro- vs macro-averaging (MMLU averages per-document = micro). (https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/task_guide.md)
- Contamination control is a first-class flag: `should_decontaminate` + `doc_to_decontamination_query` keeps train/eval overlap out of scores — the analogue of gamed fixtures leaking into our tier calibration set. (https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/task_guide.md)
- Scale discipline: 60+ benchmarks with hundreds of subtasks run through one `lm_eval` entrypoint with `--limit` smoke runs first — new scorers are validated on 10 samples before full sweeps. (https://github.com/EleutherAI/lm-evaluation-harness)

## 3 · UK AI Safety Institute Inspect — solvers/scorers separation

- Seam split by construction: a `Task` = `dataset` (input/target) + `solver` (produces output: `generate()`, CoT, ReAct agent) + `scorer` (grades output); generation and grading are different components, never the same function. (https://inspect.aisi.org.uk/)
- Scorer ladder runs cheap→semantic→judge: `includes`/`match`/`pattern` (regex-extract)/`exact`/`choice` → `f1` token-overlap, `math` symbolic equivalence → `model_graded_qa`/`model_graded_fact`. (https://inspect.aisi.org.uk/scorers.html)
- Multiple-choice hygiene: `multiple_choice()` solver pairs with the `choice()` scorer, choices are shuffled with a seed, and the scorer unshuffles before grading so position bias can't inflate scores. (https://inspect.aisi.org.uk/solvers.html)
- Anti-tautology: `{criterion}` is populated from per-sample `target`, while fixed-criterion behavioral evals bake the rubric into the template with *no* per-sample target; multi-model panels vote with a `majority` reducer so one judge can't decide alone. (https://inspect.aisi.org.uk/model-graded.html)
- Judge-robustness details worth stealing: grade extraction binds to the *last* `GRADE:` token and `[BEGIN DATA]/[END DATA]` delimiters in model-controlled text are neutralized before prompt formatting, blocking grade-injection via the submission. (https://inspect.aisi.org.uk/model-graded.html)
- Nondeterminism: grader generation is pinned via `get_model(..., GenerateConfig(temperature=0, seed=42))`; multi-`epochs` runs reduce with `mean`/`median`/`mode`/`pass_at_k`/`at_least_k`, and docs warn temp-0 *reduces but does not eliminate* variance — hence epochs. (https://inspect.aisi.org.uk/model-graded.html)
- Aggregation: scorers ship `accuracy`+`stderr` (or `mean`+`stderr`); `grouped(accuracy(), "category")`, clustered stderr, bootstrap/Wilson CIs, and multi-judge `krippendorff_alpha` cover grouping, uncertainty, and judge agreement; one `headline_metric` per task stops metric-shopping. (https://inspect.aisi.org.uk/metrics.html)

## 4 · DSPy — metric functions, assertions, optimization

- Seam is code: `metric(example, pred) -> float` (exact-match, recall, or averaged sub-scores) run by `dspy.Evaluate(devset, metric, num_threads)` reporting `Average Metric: X / N` plus `EvaluationResult(score=...)`. (https://dspy.ai/current/tutorials/gepa_facilitysupportanalyzer)
- `dspy.Assert`/`dspy.Suggest` declare boolean output constraints after module calls; `assert_transform_module` plus a backtrack handler adds retry/backtracking, and the program must explicitly `activate_assertions()` — constraints are runtime rails, not static checks. (https://github.com/stanfordnlp/dspy)
- Metrics double as optimization objectives: MIPROv2/GEPA `compile(program, trainset, valset)` searches prompts/demos against the metric, with per-module textual feedback (`metric_with_feedback` returns `Prediction(score, feedback)`); reflection LMs run hot (`temperature=1.0`) while grading stays strict. (https://dspy.ai/current/tutorials/gepa_facilitysupportanalyzer)

## 5 · guardrails-ai / NeMo Guardrails — rails as tests

- guardrails-ai seam: `Guard().use(Validator, on_fail=OnFailAction.EXCEPTION)` validates LLM inputs/outputs; validators compose in one Guard and failures raise instead of silently averaging away. (https://github.com/guardrails-ai/guardrails)
- NeMo seam: five rail types (input/dialog/retrieval/execution/output) declared in Colang flows + `config.yml`; `nemoguardrails evaluate` runs topical/fact-check/moderation/hallucination evals as a CLI step with sample vulnerability-scan reports. (https://github.com/NVIDIA-NeMo/Guardrails)
- Stealable principle: safety checks are fail-closed gates on the I/O path, kept separate from quality scoring — the precedent for keeping safety dims as blocking bars rather than diluting them into a 390-metric mean. (https://github.com/NVIDIA-NeMo/Guardrails)

## 6 · SWE-bench — fail-to-pass / pass-to-pass discipline

- Oracle discipline: every instance ships `FAIL_TO_PASS` (must flip fail→pass) plus `PASS_TO_PASS` (must stay green); a patch counts only if it fixes without regressing. (https://swebench.com/SWE-bench/guides/datasets/)
- Execution seam: model patches apply to real repos inside Docker and are graded by the repo's own suite; harness crashes are not grading failures, and each instance keeps evidence (`report.json`, `patch.diff`, `test_output.txt`, `eval.sh`). (https://swebench.com/SWE-bench/guides/evaluation/)
- Anti-tautology: tests are the repo's pre-existing suite plus held-out `test_patch`, never authored by the model; result caching keyed by `run_id`+`instance_id` forces a new run id to re-grade changed patches. (https://swebench.com/SWE-bench/guides/evaluation/)
- Quality gate precedent: SWE-bench Verified keeps only the 500 human-confirmed solvable instances — the analogue of pruning un-winnable or gameable fixtures from our calibration set. (https://github.com/SWE-bench/SWE-bench)

## 7 · SkillsBench — oracle-first, outcome-based verifiers

- Package layout per task: `task.md` (outcome-focused prompt, must not name skills) + `environment/` + `oracle/solve.sh` (held-out reference, computed not hardcoded) + `verifier/test.sh` + `test_outputs.py`; the oracle must score reward 1.0 *before* any agent run (`--agent oracle`). (https://www.skillsbench.ai/docs/getting-started)
- Verifier rules: test the result, not the process; 4–10 focused test functions, each checking something distinct, parametrized not duplicated; artifacts copied to `/logs/verifier/`; no paid-API keys in oracle/verifier. (https://raw.githubusercontent.com/benchflow-ai/skillsbench/main/CONTRIBUTING.md)
- Leakage prevention (the anti-gaming playbook): skills must not contain task filenames, exact command sequences, magic constants, or test references; CI runs a leakage-audit agent plus human review on oracle quality and anti-cheat. (https://arxiv.org/html/2602.12670v1)
- Measurement: deterministic pytest verifiers yield binary pass/fail; primary metric averages binary reward over 5 trials per task; all models run at temperature 0; skill efficacy = with-skill minus no-skill delta (+16.2pp mean, yet 16/84 tasks negative — deltas, not raw scores, carry the signal). (https://arxiv.org/html/2602.12670v1)

## 8 · Cross-cutting answers to the four questions

- Test seam: everyone grades *outputs and executions*, not source text — SkillGauge's static regexes are the outlier; the closest analogue is promptfoo's deterministic assertions, but even those run against model output. (https://www.promptfoo.dev/docs/configuration/expected-outputs/)
- Anti-tautology: independent oracle (gold targets / held-out tests / separate judge provider) plus adversarial leakage audits; self-grading and shared-logic scorers are treated as invalid designs. (https://arxiv.org/html/2602.12670v1)
- Nondeterminism: temperature 0 + seed everywhere a judge or sampler runs; residual variance is handled by repeats/epochs with majority/pass@k reducers and reported with stderr/CI, never hidden. (https://inspect.aisi.org.uk/metrics.html)
- Aggregation: mean accuracy over instances is the default; percentile tiers (our P50/P90), micro-vs-macro group averaging, and pass@k-style reducers appear wherever a single mean would mislead. (https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/task_guide.md)

## 9 · Five patterns to steal (file-level mapping)

1. **Oracle-first golden fixtures with F2P/P2P split.** Add `packages/core/src/__tests__/fixtures/` holding known-good skills (must stay green = P2P) and known-gamed skills (keyword stuffing, `shall must` gibberish — must stay red = F2P); every scorer change must keep both sets. Extends `__tests__/engine_all_scorers.test.ts`, consumed via `engine.ts:auditSkill`. (https://swebench.com/SWE-bench/guides/datasets/) (https://www.skillsbench.ai/docs/getting-started)
2. **Split parse-seam from score-seam tests.** Unit-test `parsers/markdown.ts` (frontmatter/headings/text extraction) independently from the pure `(text|parsed) -> 0|1` functions in `scorers/dimA.ts`–`dimZ.ts`; reserve `engine.ts` tests for aggregation (`getSum`), tier cutoffs, and `failedDims` only. Mirrors Inspect's solver/scorer split; harden with `__tests__/markdown.test.ts` plus per-dim cases. (https://inspect.aisi.org.uk/) (https://inspect.aisi.org.uk/scorers.html)
3. **Adversarial negative fixture per metric + judge backstop.** Give each of the 390 metrics at least one must-fail gamed input (the `not-` assertion idea + SkillsBench leakage audit); keep the existing `engine.ts:auditSkillAsync` `gaming_detected` multiplier as the judge-grade backstop, pinned to temperature 0 + seed per Inspect/promptfoo practice. New `__tests__/adversarial.test.ts` gates it. (https://www.promptfoo.dev/docs/configuration/expected-outputs/) (https://inspect.aisi.org.uk/model-graded.html)
4. **Determinism contract + uncertainty reporting.** Keep the default `auditSkill` path fully deterministic (no LLM); for the LLM path take temperature 0, fixed seed, k samples with majority/mean reduction and report mean±stderr beside the tier, per Inspect epochs and lm-eval `repeats` practice; freeze tier recalibration to the documented re-audit-all procedure already noted at `engine.ts` TIER_P90/TIER_P50. Covers `dynamicEngine.ts` and `optimizer.ts` sampling too. (https://inspect.aisi.org.uk/metrics.html) (https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/task_guide.md)
5. **Safety rails as fail-closed gates + weighted named metrics.** Promote `scorers/dimC.ts`/`dimE.ts` safety signals to blocking gates (guardrails-ai `OnFailAction.EXCEPTION` style) instead of diluting them in the 390-mean; attach promptfoo-style `metric` names/weights per assertion family with per-dimension means in `scorers/scientificUtils.ts`, and treat `optimizer.ts`'s objective as a DSPy-style metric to optimize rather than a number to report. Tightens the `failedDims` block in `engine.ts`. (https://github.com/guardrails-ai/guardrails) (https://www.promptfoo.dev/docs/configuration/expected-outputs/)
