# Skill Evaluation Landscape: Primary-Source Findings (2026-10-09)

> Scope: how real projects evaluate agent skills/prompts, what real
> leaderboards do, and whether static-only keyword/regex scoring is valid.

## 1. Agent Skills format is real and narrow

- A skill is a directory with required `SKILL.md` (YAML frontmatter +
  Markdown body) plus optional `scripts/`, `references/`, `assets/`.
  (Owner: Agent Skills spec, https://agentskills.io/specification)
- Frontmatter requires only `name` (1–64 chars, lowercase alnum+hyphen,
  matches directory) and `description` (1–1024 chars, what + when-to-use).
  (Owner: anthropics/skills spec, https://github.com/anthropics/skills/blob/main/spec/agent-skills-spec.md)
- Body has no format restrictions; progressive loading applies: metadata
  (~100 tokens) always in context, body on activation (<5000 tokens /
  <500 lines), resources as needed.
  (Owner: Anthropic docs, https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview)
- Implication: most of SkillGauge's 26 A–Z dims sit outside the normative
  spec; only Dim G checks spec requirements. (Inference from above.)

## 2. SkillsBench (arXiv:2602.12670) is REAL — and dynamic, not static

- Paper exists: Li et al. 2026, "SkillsBench: Benchmarking How Well Agent
  Skills Work Across Diverse Tasks". (Owner: arXiv, https://arxiv.org/abs/2602.12670)
- Method is paired execution (same task with vs. without skill) in containers
  with deterministic pytest verifiers and leakage audits.
  (Owner: paper PDF, https://www.skillsbench.ai/skillsbench.pdf)
- Scale: v1 = 84 tasks/11 domains/7 configs/7,308 trajectories; v1.1 = 87
  tasks/8 domains/18 configs. (Owner: https://www.skillsbench.ai/blogs/skillsbench-1-1)
- Result: curated skills +16.2pp (v1), +16.6pp 33.9%→50.5% (v1.1); focused
  ≤3-module skills beat exhaustive bundles; self-made skills ≈ −1.3pp.
  (Owner: arXiv abstract, https://arxiv.org/abs/2602.12670)
- Citing it to justify static-only regex scoring misrepresents it: its whole
  contribution is execution-based paired evaluation.
  (Owner: repo, https://github.com/benchflow-ai/skillsbench)

## 3. Real leaderboards execute; registries do not score

- SWE-bench: real GitHub issues (12 Python repos); patch passes only if
  fail-to-pass tests pass and pass-to-pass tests hold; Verified = 500
  human-filtered instances; traces required. (Owner: https://www.swebench.com/)
- HumanEval: 164 Python docstring→code problems judged by execution pass@k
  (Codex 28.8% pass@1). (Owner: Chen et al. 2021, https://github.com/openai/human-eval)
- AgentBench: 8 interactive environments (OS, DB, KG, games, household, web),
  per-environment success/reward/F1 — agent acts, text isn't pattern-matched.
  (Owner: Liu et al. 2023, https://arxiv.org/abs/2308.03688)
- MCP Registry is a metadata directory (`server.json`, reverse-DNS namespace,
  Registry API), not a scored leaderboard. (Owner: https://modelcontextprotocol.io/registry/about)
- MCP wire spec: JSON-RPC 2.0; TypeScript `schema.ts` is source of truth; no
  prompt-quality score defined. (Owner: https://modelcontextprotocol.io/specification/2026-07-28)
- Tradeoff: dynamic eval has construct validity but costs compute/sandboxing;
  static audit is cheap/deterministic but measures proxies. (Synthesis.)

## 4. Security/context literature does not validate static scoring

- OWASP LLM01 (2025/2026) defines direct + indirect prompt injection, incl.
  non-human-readable and multimodal vectors. (Owner: https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- OWASP: no foolproof prevention ("stochastic" models, no instruction/data
  boundary); defense must be architectural — least privilege, HITL, output
  validation, adversarial testing. (Owner: OWASP PDF, https://owasp.org/www-project-top-10-for-large-language-model-applications/assets/PDF/OWASP-Top-10-for-LLMs-v2025.pdf)
- A regex detects *mentions* of guardrails, never effectiveness; OWASP controls
  are mostly runtime-observable. (Inference from above.)
- "Lost in the Middle" is real (Liu et al., arXiv:2307.03172, TACL 2024):
  U-shaped accuracy (best at start/end, worst in middle); reader gains saturate
  after ~20 docs — supports concise skills, not a 390-metric formula.
  (Owner: https://arxiv.org/abs/2307.03172)
- Flesch-Kincaid, TTR (length-biased; MATTR is the fix), Shannon entropy are
  descriptive readability/diversity stats, not validated prompt-effectiveness
  measures. (Owner: https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests)

## 5. Static-only keyword scoring is gameable (Goodhart)

- Goodhart's law: "when a measure becomes a target, it ceases to be a good
  measure" (Goodhart 1975; Hoskin 1996). (Owner: https://en.wikipedia.org/wiki/Goodhart%27s_law)
- RLHF overoptimization follows a Goodhart curve (proxy↑ past a point → gold↓);
  larger reward models only soften it. (Owner: Gao et al. ICML 2023, https://proceedings.mlr.press/v202/gao23h/gao23h.pdf)
- Four variants (regressional, extremal, causal, adversarial); deterministic
  static benchmarks are "Goodhart-vulnerable by construction" — fix via
  randomization, refresh, holdouts. (Owner: Manheim & Garrabrant 2018 via
  Stanford AIMS Ch.8, https://aimslab.stanford.edu/textbook/src/chap8.html)
- Keyword/regex metrics (imperative lists, per-letter TTR-of-X, "density of
  shell terms") are trivially stuffable — textbook adversarial Goodhart. (Inference.)

## 6. SkillGauge internal inconsistencies (repo evidence)

- `README.md:5,22` + `CONTRIBUTING.md:13` claim "100 criteria / 7 dims (A–G)",
  but `packages/core/src/scorers/` has `dimA.ts`–`dimZ.ts` (26 files) and CLI
  advertises 390 metrics (`packages/cli/src/index.ts:143`). Docs stale; code is 390/26.
- `docs/scientific_metrics.md:1` titles "390 Scored Metrics" yet `:3` says "all
  100 criteria" — self-contradiction; `100/390·ΣMᵢ` conflates count with scale.
- Citation hygiene: SkillsBench ref real but misapplied (§2); `(arXiv:2502)`,
  `(arXiv:2501)`, bare `(arXiv)`, `(ACL)/(NeurIPS)/(EMNLP)` without IDs are
  unverifiable, several look fabricated — real cites need full IDs.
- Bottom line: keep static audit as a cheap linter with honest labels; don't
  present it as a validated scientific leaderboard without paired-execution evidence.
