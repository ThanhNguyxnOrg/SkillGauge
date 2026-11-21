# Scientific Specification: 105 Weighted Static Signals + Anti-Gaming Integrity (v2)

This document details the mathematical formulations, evaluation dimensions, and heuristic references for the **105 static signals (7 weighted dimensions A–G)** and **static anti-gaming integrity guard** used to lint agent process instruction files (`SKILL.md` or `.agent/skills/**/*.md`).

> Honesty note: scores are unvalidated static proxies, not task-success measures. Tiers are population percentiles over the live 630-skill corpus (`Tier 1 >= 86.65 [P90]`, `Tier 2 >= 80.35 [P50]`, `Tier 3 < 80.35`), not absolute task-success bars. `Reference` lines below are heuristic labels, not verified citations — do not quote them as literature support. Formulas here mirror `packages/core/src/scorers/*.ts`; on any conflict the code wins.

---

## 📐 Mathematical Formulation

SkillGauge v2 computes the static score from **7 real, weighted dimensions** (15 metrics each = 105 signals), scaled to `[0, 100]`, then multiplied by the static **Anti-Gaming Integrity Multiplier** ($M_{\text{integrity}} \in [0.35, 1.0]$):

$$S_{\text{weighted}} = 100.0 \times \sum_{d \in \{A..G\}} w_d \cdot \frac{\text{Dim}_d}{15.0}$$

$$S_{\text{static}} = \text{clamp}_{[0, 100]}\!\left(S_{\text{weighted}} \times M_{\text{integrity}}\right)$$

Where:
- Each dimension $\text{Dim}_d = \sum_{k=1}^{15} M_{d,k} \in [0.0, 15.0]$
- Prose NLP metrics (`Dim A`, `Dim B` prose checks, `Dim G` syntax checks) operate on **prose-only text** (YAML frontmatter and fenced code blocks stripped) so code snippets do not skew readability, passive voice, or jargon density.
- $M_{\text{integrity}} = \text{clamp}_{[0.35, 1.0]}\!\left(S_{\text{stuffing}} \times S_{\text{coherence}} \times S_{\text{structure}}\right)$ detects keyword-stuffing runs, stacked modal gibberish, excessive 3-gram repetition, and unstructured walls of text (`packages/core/src/scorers/antiGaming.ts`).

---

## 📊 Evaluation Matrix Summary

The 105 criteria are structured into 7 weighted dimensions (`A` through `G`), 15 signals each:

| ID | Dimension Name | Criteria | Weight | Max Raw | Core Focus |
| --- | --- | --- | --- | --- | --- |
| **Dim A** | Instruction Quality & Clarity | 15 Metrics | **22%** | 15.00 | Prose imperatives, length-normalized passive/adverb/pronoun checks, readability, directive balance, scope boundaries. |
| **Dim B** | Context & Memory Management | 15 Metrics | **16%** | 15.00 | Token sweet spot (80–2000), information density, Lost-in-the-Middle guard, true list nesting depth, XML tag matching, variable documentation. |
| **Dim C** | Safety, Alignment & Security | 15 Metrics | **14%** | 15.00 | Untrusted input shielding, secret/prompt protection, role integrity, least privilege, sanitization, log redaction. |
| **Dim D** | Tool-Use & MCP Clarity | 15 Metrics | **10%** | 15.00 | Parameter specs, parallel/sequential execution, rate limits, error handling, output parsing, resource clean-up. |
| **Dim E** | Robustness & Exception Handling | 15 Metrics | **14%** | 15.00 | Exit/abort strategies, retry budgets, fallback plans, diagnostics, timeouts, graceful degradation, loop limits. |
| **Dim F** | Operational & Inference Economy | 15 Metrics | **10%** | 15.00 | CoT loop blockers, verbosity control, context pruning, caching, batching, model tier routing, lazy loading. |
| **Dim G** | Syntax, Structure & Metadata | 15 Metrics | **14%** | 15.00 | YAML frontmatter, heading hierarchy, code-fence languages & closure, section completeness, UTF-8 & URL safety. |

*Note: Legacy synthetic dimensions `H–Z` (285 templated keyword metrics) were removed in v2 because they diluted 73% of the score with domain-irrelevant noise and compressed all real skills into 38–48/100.*

---


## Dimension A: Instruction Quality & Clarity (15 Metrics)

### A1: Imperative Verb Density
*   **Formula**: $M_{A1} = \min\left(1.0, \frac{N_{imp}}{0.06 \times N_{words} + \epsilon}\right)$
    *   Where $N_{imp}$ is the count of action imperatives (*run, perform, verify, validate, extract, parse*).
*   **Reference**: heuristic.

### A2: Passive Voice Penalty
*   **Formula**: $M_{A2} = e^{-0.25 \times N_{passive}}$
    *   Where $N_{passive}$ is passive verb constructs (*is processed by, was written*).
*   **Reference**: heuristic.

### A3: Qualifier Ambiguity
*   **Formula**: $M_{A3} = \frac{W_{strong}}{W_{strong} + 2.0 \times W_{weak} + \epsilon}$ (defaults to $0.8$ if both are 0).
    *   Weak qualifiers: *maybe, sometimes, usually, optionally, try to, should, could*.
    *   Strong qualifiers: *must, never, shall, required, strictly, prevent*.
*   **Reference**: heuristic.

### A4: Adverb Bloat
*   **Formula**: $M_{A4} = e^{-0.15 \times N_{adverb}}$
    *   Where $N_{adverb}$ is the count of filler adverbs ending in `-ly` (*very, extremely, completely*).
*   **Reference**: heuristic.

### A5: Readability (Flesch Reading Ease; mislabeled “Flesch-Kincaid” before 2026-10-10)
*   **Formula (code)**: $M_{A5} = 1.0$ if $RE \in [50, 85]$, else $\max(0.2, 1.0 - 0.02 \times \max(0, |RE - 67.5| - 17.5))$
    *   Where $RE = 206.835 - 1.015 \left(\frac{\text{words}}{\text{sentences}}\right) - 84.6 \left(\frac{\text{syllables}}{\text{words}}\right)$ (syllables by vowel-group heuristic).
*   **Reference**: heuristic readability proxy, not a validated prompt-effectiveness measure.

### A6: Sentence Length Variance
*   **Formula**: $M_{A6} = \min\left(1.0, \frac{\text{Var}(L)}{25.0 + \epsilon}\right)$
    *   Where $\text{Var}(L)$ is the variance of word counts per sentence.
*   **Reference**: heuristic.

### A7: Structural Symmetry
*   **Formula**: $M_{A7} = 1.0 - 0.3 \times (\text{bullet\_styles} - 1)$
    *   Where `bullet_styles` is the number of distinct list markers (`*`, `-`, `+`).
*   **Reference**: heuristic.

### A8: Noun Concreteness
*   **Formula**: $M_{A8} = \frac{W_{concrete}}{W_{concrete} + W_{abstract} + \epsilon}$
    *   Concrete: *file, token, schema, CLI, JSON, buffer*. Abstract: *goodness, intelligence, capability*.
*   **Reference**: heuristic.

### A9: Goal Specificity
*   **Formula**: $M_{A9} = 0.3 + 0.7 \cdot \mathbb{I}(\text{hasFormat})$
    *   `hasFormat` check is true if formatting spec keywords (*JSON, YAML, XML, CSV, Markdown Table*) are present.
*   **Reference**: heuristic.

### A10: Pronoun Clarity
*   **Formula**: $M_{A10} = e^{-0.1 \times N_{vague}}$
    *   Where $N_{vague}$ is the count of unreferenced pronouns (*it, they, them, their, its*).
*   **Reference**: heuristic.

### A11: Semantic Drift Guard
*   **Formula**: $M_{A11} = 1.0 - 0.2 \times N_{drift}$
    *   Deducts points if contradictory clauses are found (e.g. "always do X" and "never do X" in the same block).
*   **Reference**: heuristic.

### A12: Jargon Density
*   **Formula**: $M_{A12} = 1.0 - 0.5 \times \frac{N_{jargon}}{N_{words}}$
    *   Penalizes unexplained jargon terms that confuse semantic embeddings.
*   **Reference**: heuristic.

### A13: Positive Directive Balance
*   **Formula**: $M_{A13} = \frac{N_{positive\_do}}{N_{positive\_do} + N_{negative\_dont} + \epsilon}$
*   **Reference**: heuristic.

### A14: Scope Boundary Clarity
*   **Formula**: $M_{A14} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasBoundary})$
    *   Requires keywords like *prohibited, outside scope, out of bounds*.
*   **Reference**: heuristic.

### A15: Temporal Consistency
*   **Formula**: $M_{A15} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasOrdering})$
    *   Requires sequential transition terms (*firstly, secondly, step 1, step 2*).
*   **Reference**: heuristic.

---

## Dimension B: Context & Memory Management (15 Metrics)

### B1: Token Friction Weight
*   **Formula**: $M_{B1} = \max\left(0.1, 1.0 - 0.9 \times \left( \frac{T - 600}{2000 - 600} \right)^2\right)$ if $T > 600$, else $1.0$.
*   **Reference**: related work *SkillsBench* (arXiv:2602.12670, paired-execution benchmark) — does not support this formula; formula itself is heuristic.

### B2: Information Density
*   **Formula**: $M_{B2} = \frac{W_{content}}{W_{total} + \epsilon}$
    *   Excludes English stop words (*the, a, of, and*).
*   **Reference**: heuristic.

### B3: Lost-in-the-Middle Parabolic Curve
*   **Formula**: $M_{B3} = 1.0 - \text{average}(|0.5 - p_i|^2 \times \text{importance}_i)$
    *   Penalizes crucial instructions placed near the relative middle ($p_i \approx 0.5$) of the prompt.
*   **Reference**: observation only — *Lost in the Middle* (arXiv:2307.03172, Liu et al., TACL 2024, U-curve); the parabolic formula above is heuristic, not from the paper.

### B4: Nested List Depth
*   **Formula**: $M_{B4} = \max\left(0.1, 1.0 - 0.2 \times \max\left(0, D_{depth} - 3\right)\right)$
*   **Reference**: heuristic.

### B5: Reference Validity
*   **Formula**: $M_{B5} = 1.0 - \frac{N_{broken}}{N_{total} + \epsilon}$
*   **Reference**: heuristic.

### B6: Code Block Density
*   **Formula (code)**: $1.0$ if ratio $\in [0.10, 0.40]$; $0.5 + 5.0 \times$ ratio below; $\max(0.1, 1.0 - 1.5 \times (\text{ratio} - 0.40))$ above.
*   **Reference**: heuristic.

### B7: XML Wrapper Tag Matching
*   **Formula (code)**: $1.0$ if no tags or all matched, else $\max(0.1, 1.0 - 0.25 \times \text{mismatches})$.
*   **Reference**: heuristic.

### B8: Schema Completeness
*   **Formula**: $M_{B8} = 0.6 \times \frac{N_{described\_params}}{N_{total\_params}} + 0.4 \times \text{hasRequiredFields}$
*   **Reference**: heuristic.

### B9: Context Pruning Directives
*   **Formula**: $M_{B9} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasPrune})$
    *   Requires memory pruning keywords (*forget, clear memory, ignore past*).
*   **Reference**: heuristic.

### B10: Variable Allocation
*   **Formula (code)**: fraction of `{{var}}` template variables also mentioned elsewhere ($1.0$ if none).
*   **Reference**: heuristic.

### B11: Logging Frequency directives
*   **Formula**: $M_{B11} = \min\left(1.0, \frac{N_{log\_requests}}{2.0}\right)$
*   **Reference**: heuristic.

### B12: Checkpoint Frequency
*   **Formula**: $M_{B12} = \min\left(1.0, \frac{N_{checkpoint}}{2.0}\right)$
*   **Reference**: heuristic.

### B13: Redundancy Line Penalty
*   **Formula**: $M_{B13} = 1.0 - 2.0 \times \frac{N_{dup\_lines}}{N_{total\_lines}}$
*   **Reference**: heuristic.

### B14: Stop-Word Saturation
*   **Formula**: $M_{B14} = 1.0 - \text{stop\_word\_ratio}$
*   **Reference**: heuristic.

### B15: History Size Constraints
*   **Formula**: $M_{B15} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasHistoryLimit})$
*   **Reference**: heuristic.

---

## Dimension C: Safety, Alignment & Security (15 Metrics)

### C1: Prompt Injection Shield
*   **Formula (code)**: $1.0$ if delimiters + isolation directive, $0.5$ if either, else $0.3$ on fallback phrase match, else $0.0$. Detects *mentions* of guardrails, not effectiveness.
*   **Reference**: heuristic; OWASP LLM01 states no foolproof prompt-injection prevention exists.

### C2: System Instruction Protection
*   **Formula (code)**: $1.0$ if leak-trigger guard + fallback response, $0.5$ if either, else $0.3$ on fallback phrase match, else $0.0$.
*   **Reference**: heuristic; see OWASP LLM01.

### C3: Role Hijacking Defense
*   **Formula**: $M_{C3} = \mathbb{I}(\text{hasRoleLock})$
    *   Requires *never change your role, strictly act as*.
*   **Reference**: heuristic.

### C4: Jailbreak Resistance Keywords
*   **Formula**: $M_{C4} = 0.3 + 0.7 \cdot \mathbb{I}(\text{hasJailbreakRules})$
*   **Reference**: heuristic.

### C5: Exfiltration Defense
*   **Formula**: $M_{C5} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasExfiltrationShield})$
    *   Requires *do not send prompt content to external APIs*.
*   **Reference**: heuristic.

### C6: PII Masking Instructions
*   **Formula**: $M_{C6} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasPIIMasking})$
*   **Reference**: heuristic.

### C7: Sandbox Constraints
*   **Formula**: $M_{C7} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasSandboxRules})$
*   **Reference**: heuristic.

### C8: Command Authority Scope
*   **Formula**: $M_{C8} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasAuthorityRules})$
*   **Reference**: heuristic.

### C9: Compliance Rules
*   **Formula**: $M_{C9} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasCompliance})$
*   **Reference**: heuristic.

### C10: Input Sanitization Instructions
*   **Formula**: $M_{C10} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasInputSanitization})$
*   **Reference**: *Prompt Sanitization Heuristics* (BlackHat).

### C11: Output Validation Directives
*   **Formula**: $M_{C11} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasOutputValidation})$
*   **Reference**: heuristic.

### C12: Trust Boundary Checking
*   **Formula**: $M_{C12} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasTrustBoundary})$
*   **Reference**: heuristic.

### C13: Access Control Rules
*   **Formula**: $M_{C13} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasAccessControl})$
*   **Reference**: heuristic.

### C14: Override Blockers
*   **Formula**: $M_{C14} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasOverrideRules})$
*   **Reference**: heuristic.

### C15: Log Obfuscation
*   **Formula**: $M_{C15} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasObfuscation})$
*   **Reference**: heuristic.

---

## Dimension D: Tool-Use & MCP Clarity (15 Metrics)

### D1: Parameter Spec Clarity
*   **Formula**: $M_{D1} = \frac{N_{typed\_params}}{N_{params} + \epsilon}$
*   **Reference**: heuristic.

### D2: Required Field Spec
*   **Formula**: $M_{D2} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasRequired})$
*   **Reference**: heuristic.

### D3: Argument Description Quality
*   **Formula**: $M_{D3} = \frac{N_{long\_desc\_params}}{N_{params} + \epsilon}$ (desc must be > 10 chars).
*   **Reference**: heuristic.

### D4: Parallel Call Control
*   **Formula**: $M_{D4} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasParallelRules})$
*   **Reference**: heuristic.

### D5: Rate Limit Guidelines
*   **Formula**: $M_{D5} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasRateLimitRules})$
*   **Reference**: heuristic.

### D6: Error Response Handling
*   **Formula**: $M_{D6} = \min\left(1.0, \frac{N_{error\_keywords}}{3.0}\right)$
*   **Reference**: heuristic.

### D7: Tool Output Parsers
*   **Formula**: $M_{D7} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasParserRules})$
*   **Reference**: heuristic.

### D8: Tool Selection Logic
*   **Formula**: $M_{D8} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasSelectionRules})$
*   **Reference**: *Heuristics for Tool Selection under Large Context* (ICML).

### D9: Input Encoding Specifications
*   **Formula**: $M_{D9} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasEncoding})$
*   **Reference**: heuristic.

### D10: Execution Sequence Constraints
*   **Formula**: $M_{D10} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasSequenceRules})$
*   **Reference**: heuristic.

### D11: Fail-safe Defaults
*   **Formula**: $M_{D11} = 0.3 + 0.7 \cdot \mathbb{I}(\text{hasFailSafe})$
*   **Reference**: heuristic.

### D12: Schema Conformance checks
*   **Formula**: $M_{D12} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasConformance})$
*   **Reference**: heuristic.

### D13: Payload Size Limits
*   **Formula**: $M_{D13} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasPayloadLimits})$
*   **Reference**: heuristic.

### D14: Callback Specifications
*   **Formula**: $M_{D14} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasCallbackRules})$
*   **Reference**: heuristic.

### D15: Resource Clean-up
*   **Formula**: $M_{D15} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasCleanup})$
*   **Reference**: heuristic.

---

## Dimension E: Robustness & Exception Handling (15 Metrics)

### E1: Exception Catcher
*   **Formula**: $M_{E1} = \min\left(1.0, \frac{N_{defensive}}{3.0}\right)$
*   **Reference**: heuristic.

### E2: Exit Strategy
*   **Formula**: $M_{E2} = \mathbb{I}(\text{hasExit})$
    *   Requires *abort, terminate, stop execution, exit*.
*   **Reference**: heuristic.

### E3: Retry Budgets
*   **Formula**: $M_{E3} = 0.3 + 0.7 \cdot \mathbb{I}(\text{hasRetryBudget})$
*   **Reference**: heuristic.

### E4: Fallback Plan
*   **Formula**: $M_{E4} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasFallback})$
*   **Reference**: heuristic.

### E5: Unexpected Input Recovery
*   **Formula**: $M_{E5} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasInputRecovery})$
*   **Reference**: heuristic.

### E6: Ambiguity Resolution Flow
*   **Formula**: $M_{E6} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasAmbiguityFlow})$
*   **Reference**: heuristic.

### E7: State Recovery
*   **Formula**: $M_{E7} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasStateRecovery})$
*   **Reference**: heuristic.

### E8: Diagnostics directives
*   **Formula**: $M_{E8} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasDiagnostics})$
*   **Reference**: heuristic.

### E9: Timeouts
*   **Formula**: $M_{E9} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasTimeouts})$
*   **Reference**: heuristic.

### E10: Graceful Degradation
*   **Formula (code)**: $1.0$ if failure trigger + recovery action, $0.6$ if either, else $0.4$ on degradation phrase, else $0.2$.
*   **Reference**: heuristic.

### E11: Boundary Value Checks
*   **Formula**: $M_{E11} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasBoundaryChecks})$
*   **Reference**: heuristic.

### E12: Noise Filtering
*   **Formula**: $M_{E12} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasNoiseFilter})$
*   **Reference**: heuristic.

### E13: Invariant Assertions
*   **Formula**: $M_{E13} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasAssertions})$
*   **Reference**: heuristic.

### E14: Conflicting Prompt Resolvers
*   **Formula**: $M_{E14} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasConflictResolvers})$
*   **Reference**: heuristic.

### E15: Self-Correction Loop Limits
*   **Formula**: $M_{E15} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasCorrectionLimits})$
*   **Reference**: heuristic.

---

## Dimension F: Operational & Inference Economy (15 Metrics)

### F1: Chain-of-Thought Loop Penalty
*   **Formula (code)**: $\max(0.1, 1.0 - 0.25 \times N_{loop})$ (e.g. *retry infinitely, repeat indefinitely*).
*   **Reference**: heuristic.

### F2: Output Verbosity Control
*   **Formula**: $M_{F2} = 0.3 + 0.7 \cdot \mathbb{I}(\text{hasVerbosityLimits})$
*   **Reference**: heuristic.

### F3: Token Pruning directives
*   **Formula**: $M_{F3} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasPruning})$
*   **Reference**: heuristic.

### F4: Early Exit Criteria
*   **Formula**: $M_{F4} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasEarlyExit})$
*   **Reference**: heuristic.

### F5: Query Cache Directives
*   **Formula**: $M_{F5} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasCaching})$
*   **Reference**: heuristic.

### F6: Batching Directives
*   **Formula**: $M_{F6} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasBatching})$
*   **Reference**: heuristic.

### F7: Context Compression Rules
*   **Formula**: $M_{F7} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasCompression})$
*   **Reference**: heuristic.

### F8: Computation Reuse
*   **Formula**: $M_{F8} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasReuse})$
*   **Reference**: heuristic.

### F9: Model Tier Routing
*   **Formula**: $M_{F9} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasModelRouting})$
*   **Reference**: heuristic.

### F10: Redundant Thought Blocker
*   **Formula**: $M_{F10} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasThoughtBlocker})$
*   **Reference**: heuristic.

### F11: Minimalist Representation
*   **Formula (code)**: $1.0$ if loop limit + exit condition, $0.6$ if either, else $0.5$ on minimalist phrase, else $0.3$.
*   **Reference**: heuristic.

### F12: Inline Formatting Pruning
*   **Formula**: $M_{F12} = 0.6 + 0.4 \cdot \mathbb{I}(\text{hasFormattingRestrictions})$
*   **Reference**: heuristic.

### F13: Vocabulary Simplification
*   **Formula**: $M_{F13} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasVocabLimits})$
*   **Reference**: heuristic.

### F14: Non-Interactive Mode Directives
*   **Formula**: $M_{F14} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasNonInteractive})$
*   **Reference**: heuristic.

### F15: Lazy Evaluation Guidelines
*   **Formula**: $M_{F15} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasLazyEval})$
*   **Reference**: heuristic.

---

## Dimension G: Syntax, Structure & Metadata (15 Metrics)

### G1: Frontmatter Integrity
*   **Formula**: $M_{G1} = \mathbb{I}(\text{hasFrontmatter})$
*   **Reference**: heuristic.

### G10: UTF-8 Encoding compliance
*   **Formula**: $M_{G10} = \text{isUtf8} ? 1.0 : 0.0$
*   **Reference**: *Character Encoding Security and Robustness* (RFC 3629).

### G11: YAML Tests-Array Check (SkillGauge extension, NOT part of the Agent Skills spec)
*   **Formula (code)**: $1.0$ if no `tests` key or non-empty array, $0.5$ if empty array, $0.0$ if non-array. The Agent Skills spec requires only `name` + `description`.
*   **Reference**: heuristic.

### G12: Code Block Closure Integrity
*   **Formula**: $M_{G12} = \text{allClosed} ? 1.0 : 0.2$
*   **Reference**: heuristic.

### G13: Inline Code Block Density
*   **Formula**: $M_{G13} = 1.0 - \min\left(0.7, \max\left(0, \frac{N_{\text{backticks}}}{N_{\text{words}}} - 0.12\right) \times 5.0\right)$
*   **Reference**: heuristic.

### G14: URL Protocol Safety
*   **Formula**: $M_{G14} = \max\left(0.4, 1.0 - 0.2 \times N_{\text{insecure}}\right)$
*   **Reference**: heuristic.

### G15: Blockquote Nesting Depth
*   **Formula**: $M_{G15} = \max\left(0.3, 1.0 - 0.25 \times N_{\text{nested}}\right)$
*   **Reference**: heuristic.

---

## 🧪 2-Phase Auditing & Dynamic Probing Calculations

SkillGauge employs a hybrid evaluation methodology that combines static structural constraints with dynamic semantic checking.

### 1. Unified 2-Phase Auditing Formulation
When a Gemini API Key is configured, the overall quality score of a prompt is calculated in two sequential phases:

```mermaid
graph LR
    Prompt[Skill Prompt] --> Phase1[Phase 1: Static Score]
    Phase1 -->|S_static| Phase2[Phase 2: LLM Audit]
    Phase2 -->|S_final = S_static x Multiplier| Final[Final Score & Tier]
```

#### Phase 1: Static Structural Audit ($S_{\text{static}}$)
The static score is calculated using the 7-dimension weighted average multiplied by the static anti-gaming integrity multiplier:
$$S_{\text{static}} = \text{clamp}_{[0, 100]}\!\left(100.0 \sum_{d \in \{A..G\}} w_d \frac{\text{Dim}_d}{15.0} \times M_{\text{integrity}}\right)$$

#### Phase 2: Dynamic Semantic Audit ($M_{\text{semantic}}$)
A cost-efficient model (`gemini-3.5-flash-lite`) is invoked to assess the prompt on qualitative properties. The model outputs a JSON payload containing:
- **Coherence** ($C \in [0.0, 1.0]$): Readability, grammar, and instructions clarity.
- **Depth** ($D \in [0.0, 1.0]$): Breadth, detail, and applicability.
- **Gaming Flag** ($G \in \{0.15, 1.0\}$): Set to $0.15$ if the prompt is flagged for keyword stuffing or attempting to cheat the static checkers, $1.0$ otherwise.

The semantic multiplier is computed as:
$$M_{\text{semantic}} = C \times D \times G$$

#### Final Grade
The final unified score ($S_{\text{final}}$) is the product of both phases:
$$S_{\text{final}} = S_{\text{static}} \times M_{\text{semantic}}$$

If no API key is provided, the evaluation defaults to $S_{\text{final}} = S_{\text{static}}$.

---

### 2. Dynamic Probing & Scenario Testing
Developers can define behavioral tests inside their skill frontmatter to stress-test prompt instructions against runtime jailbreaks, injections, or incorrect formats.

#### Assertion Math
For each defined scenario:
1. The user input is passed as `contents` and the skill instructions are configured as `systemInstruction`.
2. The model response text ($O$) is converted to lowercase.
3. For each positive assertion $e_j \in \text{expected}$:
   $$A_j = \mathbb{I}(e_j \in O)$$
4. For each negative assertion $p_k \in \text{expected-not}$:
   $$B_k = \mathbb{I}(p_k \notin O)$$

The scenario is marked as **Passed** if and only if:
$$\sum_{j} A_j = |\text{expected}| \quad \wedge \quad \sum_{k} B_k = |\text{expected-not}|$$
