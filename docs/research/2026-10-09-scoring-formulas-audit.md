# SkillGauge Scoring Formulas Audit (2026-10-09)

> Scope: formulas only. Leaderboard positioning covered in
> `docs/research/2026-10-09-skill-eval-landscape.md` — not rewritten here. No code edited.

## 1. A–G verdict (per-family, against primary owner)

- **A5 mislabels Reading Ease as "Flesch-Kincaid".** Code (`dimA.ts:83`) computes RE;
  FK Grade Level is `0.39·(w/s)+11.8·(syl/w)−15.59`. (Owner: Kincaid et al. 1975 via https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests)
- **A5 docs-vs-code disagree on every constant.** Docs: 70/15/0.025/0.8 (`scientific_metrics.md:77`);
  code: 67.5/17.5/0.02/0.2 (`dimA.ts:86-87`). One is wrong.
- **A5 syllable counter is off-owner.** Vowel-group regex (`dimA.ts:77-81`) miscounts silent-e,
  diphthongs, acronyms, code tokens before the band check runs.
- **A2 passive regex is a fragment.** `be + -ed` (`dimA.ts:32`) misses get-/bare passives,
  fires on adjectives ("be set"); decay `e^−0.25N` is uncited.
- **A4 `-ly` regex is not an adverb measure.** Suffix match (`dimA.ts:59`) + 15-word stoplist
  still counts nouns/adjectives; `e^−0.15N` has no owner.
- **A10 conflates anaphora with vagueness.** Counting `it/they/them` (`dimA.ts:154`) penalizes
  cohesion; docs claims `e^−0.1N`, code uses `e^−0.05N` — undocumented 2× softer.
- **A6 rewards variance as quality.** `min(1,Var/25)` (`dimA.ts:101`): uniform scores 0, any jitter up.
  Variance is descriptive, not normative. (Owner: https://en.wikipedia.org/wiki/Standard_deviation)
- **A3/A13 double-count modals.** A3 weights weak 2× (`dimA.ts:52`); A13 re-scores `must/never`
  (`dimA.ts:211`) — stuffing "must" inflates both.
- **A9/A14/A15 punish absence with three floors.** 0.3/0.5/0.4 (`dimA.ts:148,219,227`), no rationale.
- **B3 contradicts its cited owner.** Docs: parabolic `1−avg(|0.5−p|²·w)`; code: ±0.15 sentence window,
  linear decay (`dimB.ts:56-65`). (Owner: Liu et al. 2023 via https://arxiv.org/abs/2307.03172 — U-curve observation, not a formula.)
- **C1–C3/E2 zero-score missing magic phrases.** C3→0.0 without "never change your role" (`dimC.ts:43-47`);
  E2→0.0 without "abort/terminate" (`dimE.ts:17-22`). Word detection ≠ effectiveness.
- **G over-claims vs the frontmatter spec.** Spec requires only `name`+`description`
  (Owner: https://agentskills.io/specification; https://github.com/anthropics/skills/blob/main/spec/agent-skills-spec.md).
  G11 invents a `tests`-array schema (`dimG.ts:149-155`); G1/G2 zero-score on parsing alone.
- **Docs-vs-code mismatches are systematic.** B6/B7/B10/C1-C2/E10/F1/F11 formulas differ from code
  (binary-vs-tiered, other constants); floors (`max(0.1/0.2/0.5…)`) undocumented. Doc can't reproduce scores.

## 2. H–Z template verdict (19 dims × 15 metrics)

- **One template stamped 19×.** H and J share shapes + ladders (×1.3/1.4/1.5; /24/34/44; ×13/18/23;
  /19/24/29; /4/3/2) — only literals differ (`dimH.ts` vs `dimJ.ts`, verified programmatically).
- **TTR inputs are degenerate.** Raw TTR is length-biased; fix is MATTR/MTLD
  (Owner: https://en.wikipedia.org/wiki/Type%E2%80%93token_distinction; Covington & McFall 2010).
  One "approval" ⇒ TTR=1.0 ⇒ H1≈1.0 for a single word (`dimH.ts:7-11`).
- **Entropy inputs cap at 1 bit, then divided.** ≤2-type sets ⇒ max H=1; ÷4/3/2 (`dimH.ts:32-36,63-67,94-98`)
  ⇒ ≈0 realistically. Entropy ≠ quality. (Owner: Shannon 1948 via https://en.wikipedia.org/wiki/Entropy_(information_theory))
- **"Dependency distance" is forward-only regex token-gap** (`scientificUtils.ts:55-85`), not parse-tree distance.
  (Owner: Futrell et al. via https://en.wikipedia.org/wiki/Dependency_length_minimization) Same pair uses /24, /34, /44 (`dimH.ts:16,46,78`).
- **Same input, different score.** H1/H11: same TTR, ×1.3 vs ×1.5 (`dimH.ts:7-11,69-73`); H3/H13: ×13 vs ×23
  (`dimH.ts:19-22,81-84`); H5/H15: ÷4 vs ÷2 (`dimH.ts:32-36,94-98`). No owner for the ladder.
- **TTR wants diversity, density wants repetition — contradictory.** H1 pays unique "approval" contexts;
  H3 pays repeating "escalate". Stuffing is the only joint maximizer.
- **Missing-keyword defaults punish ordinary skills.** No pair ⇒ 0.2 (`dimH.ts:14,46,76`); empty set ⇒ 0;
  single block ⇒ 0.5 (`dimH.ts:28`). Off-topic skill ≈ 1.6/15 per dim by construction.
- **Ceiling proof: Tier 2 unreachable.** A–G perfect (105) + realistic H–Z (1.6×19=30.4) ⇒ ≈34.7;
  even H–Z=5/dim ⇒ 51.3<60. Required avg/dim: 9.0 (T2), 12.75 (T1) (`engine.ts:221,240-245`) — matches zero Tier 1/2 in 411 skills.

## 3. Aggregation/tier verdict (`engine.ts:47-289`)

- **Flat mean over 390 incommensurable proxies is undefended.** `(ΣMᵢ/390)·100` (`engine.ts:221`)
  lets 285 near-zero H–Z defaults drown A–G signal.
- **`failedDims` uses three bars.** C<7.5 (50%), E<9.0 (60%), rest<10.5 (70%) (`engine.ts:249-274`) —
  the "Needs improvements" explanation is arbitrary.
- **`auditSkillAsync` silently redefines the score.** ×`coherence·depth·(0.15 if gaming)` (`engine.ts:346-347`):
  same file scores down to 15% when `GEMINI_API_KEY` exists.
- **Compat aliases mislabel.** `friction=B1`, `compactness=B4`, `memory=B11` (`engine.ts:224-238`)
  borrow established names for unrelated keyword checks.

## 4. Package / optimizer / CLI verdict

- **`packageScore` (unbounded sum) contradicts tier (mean)** (`packageEngine.ts:72-77`): adding mediocre
  skills raises the headline while lowering the tier.
- **`redundancyPenalty = 1−dup²` is misnamed, near-inert** (`packageEngine.ts:69`): squaring shrinks
  realistic penalties to ≈1.0 — a retention factor, not a penalty.
- **`integrityScore` counts prose as references** (`packageEngine.ts:36`): mentioning "package.json"
  without bundling it breaks integrity.
- **Optimizer blind-replaces modals** (`optimizer.ts:27-45`): `usually→required`, strips `just/simply` in code;
  LLM path keeps only non-score-lowering results (`optimizer.ts:120`) — optimizing the proxy.
- **CLI uses different engines by path.** File ⇒ `auditSkillAsync` (`cli/src/index.ts:253`); directory ⇒ sync
  (`index.ts:173` + `packageEngine.ts:26`). `check-duplicate` flags only cross-repo hashes (`index.ts:382-388`),
  missing same-repo/near-dupes; whitespace-stripped hashing collides (`index.ts:21-27`).

## 5. Must-fix list (severity-ordered)

1. Recalibrate/remove 85/60 tiers — provably unreachable (§2); headline claim is false.
2. Deduplicate H1/H11, H3/H13, H5/H15 triple-counting before any reweighting.
3. Unify audit engines + CLI paths; disclose the LLM multiplier, end silent rescale.
4. Fix packageScore sum-vs-mean; drop/rename redundancyPenalty.
5. Neutralize missing-keyword defaults; remove G11's invented `tests` schema first.
6. Reconcile docs formulas with code (A5, A10, B3, B6, B7, B10, C1/C2, E10, F1, F11) or delete unverifiable cites.
7. Constrain optimizer: never rewrite code blocks; no global modal replacement.
8. Resolve TTR-vs-density contradiction per dim (repetition or diversity, not both).
9. Correct A5 label to Reading Ease (or implement FK grade level) + real syllables.
10. Fix check-duplicate: same-repo + similarity-based near-dupe detection.
