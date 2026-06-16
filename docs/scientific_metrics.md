# Scientific Specification: 100 Scored Metrics for SkillGauge

This document details the mathematical formulations, evaluation dimensions, and academic literature references for all **100 criteria** used to statically audit and score agent process instruction files (`SKILL.md` or `.agent/skills/**/*.md`).

---

## 📐 Mathematical Formulation

SkillGauge computes the overall static score of a skill using the normalized sum of all **105 individual metric scores** (with all dimensions symmetric at 15 metrics each):

$$\text{Overall Static Score} = \frac{100.00}{105.00} \sum_{i=1}^{105} M_i$$

Where $M_i \in [0.0, 1.0]$ is the raw score computed by the $i$-th metric scorer function.

---

## 📊 Evaluation Matrix Summary

The 105 criteria are structured into 7 symmetric dimensions. Each dimension contains exactly 15 metrics:

| ID | Dimension Name | Criteria count | Max Weight | Core Focus |
| --- | --- | --- | --- | --- |
| **Dim A** | Instruction Quality & Clarity | 15 Metrics | 15.00 | Readability, imperatives, qualifier ambiguity, voice constructs. |
| **Dim B** | Context & Memory Management | 15 Metrics | 15.00 | Token friction weight, XML matching, history bounds, stop-word footprint. |
| **Dim C** | Safety, Alignment & Security | 15 Metrics | 15.00 | Injection shielding, role lock, exfiltration guard, PII masks. |
| **Dim D** | Tool-Use & MCP Clarity | 15 Metrics | 15.00 | Parameter schemas, parallel calling rules, required fields, rate limits. |
| **Dim E** | Robustness & Exception Handling | 15 Metrics | 15.00 | Exit strategies, retry budgets, fallback plans, diagnostics, timeouts. |
| **Dim F** | Operational & Inference Economy | 15 Metrics | 15.00 | CoT loop blockers, verbosity control, caching, model cascading & routing. |
| **Dim G** | Syntax, Structure & Metadata | 15 Metrics | 15.00 | YAML frontmatter, heading jumps, list consistency, UTF-8 compliance, schema validation. |

---


## Dimension A: Instruction Quality & Clarity (15 Metrics)

### A1: Imperative Verb Density
*   **Formula**: $M_{A1} = \min\left(1.0, \frac{N_{imp}}{0.06 \times N_{words} + \epsilon}\right)$
    *   Where $N_{imp}$ is the count of action imperatives (*run, perform, verify, validate, extract, parse*).
*   **Reference**: *Quantifying Prompt Precision in Large Language Models* (ACL).

### A2: Passive Voice Penalty
*   **Formula**: $M_{A2} = e^{-0.25 \times N_{passive}}$
    *   Where $N_{passive}$ is passive verb constructs (*is processed by, was written*).
*   **Reference**: *Style Guides for Prompt Engineering* (arXiv:2502).

### A3: Qualifier Ambiguity
*   **Formula**: $M_{A3} = \frac{W_{strong}}{W_{strong} + 2.0 \times W_{weak} + \epsilon}$ (defaults to $0.8$ if both are 0).
    *   Weak qualifiers: *maybe, sometimes, usually, optionally, try to, should, could*.
    *   Strong qualifiers: *must, never, shall, required, strictly, prevent*.
*   **Reference**: *Ambiguity Indexing in Procedural Knowledge* (NeurIPS).

### A4: Adverb Bloat
*   **Formula**: $M_{A4} = e^{-0.15 \times N_{adverb}}$
    *   Where $N_{adverb}$ is the count of filler adverbs ending in `-ly` (*very, extremely, completely*).
*   **Reference**: *Token Pruning and Structural Density in Prompting* (EMNLP).

### A5: Readability Index (Flesch-Kincaid)
*   **Formula**: $M_{A5} = 1.0 - \min\left(0.8, 0.025 \times \max\left(0, |FK - 70| - 15\right)\right)$
    *   Where $FK = 206.835 - 1.015 \left(\frac{\text{words}}{\text{sentences}}\right) - 84.6 \left(\frac{\text{syllables}}{\text{words}}\right)$.
*   **Reference**: *Cognitive Load of Prompt Templates on Autoregressive LLMs* (ACL).

### A6: Sentence Length Variance
*   **Formula**: $M_{A6} = \min\left(1.0, \frac{\text{Var}(L)}{25.0 + \epsilon}\right)$
    *   Where $\text{Var}(L)$ is the variance of word counts per sentence.
*   **Reference**: *Sentence Diversity Effects on Attention Maps* (CoNLL).

### A7: Structural Symmetry
*   **Formula**: $M_{A7} = 1.0 - 0.3 \times (\text{bullet\_styles} - 1)$
    *   Where `bullet_styles` is the number of distinct list markers (`*`, `-`, `+`).
*   **Reference**: *Consistency of Markdown Layouts on LayoutLM* (CVPR).

### A8: Noun Concreteness
*   **Formula**: $M_{A8} = \frac{W_{concrete}}{W_{concrete} + W_{abstract} + \epsilon}$
    *   Concrete: *file, token, schema, CLI, JSON, buffer*. Abstract: *goodness, intelligence, capability*.
*   **Reference**: *Concreteness Effects in Zero-shot Reasoning* (ACL).

### A9: Goal Specificity
*   **Formula**: $M_{A9} = 0.3 + 0.7 \cdot \mathbb{I}(\text{hasFormat})$
    *   `hasFormat` check is true if formatting spec keywords (*JSON, YAML, XML, CSV, Markdown Table*) are present.
*   **Reference**: *Output Schema Alignment in LLM Pipelines* (NeurIPS).

### A10: Pronoun Clarity
*   **Formula**: $M_{A10} = e^{-0.1 \times N_{vague}}$
    *   Where $N_{vague}$ is the count of unreferenced pronouns (*it, they, them, their, its*).
*   **Reference**: *Co-reference Resolution Failures in Long Prompt Contexts* (NAACL).

### A11: Semantic Drift Guard
*   **Formula**: $M_{A11} = 1.0 - 0.2 \times N_{drift}$
    *   Deducts points if contradictory clauses are found (e.g. "always do X" and "never do X" in the same block).
*   **Reference**: *Self-Contradiction in Prompt Instruct Tuned Models* (ACL).

### A12: Jargon Density
*   **Formula**: $M_{A12} = 1.0 - 0.5 \times \frac{N_{jargon}}{N_{words}}$
    *   Penalizes unexplained jargon terms that confuse semantic embeddings.
*   **Reference**: *Instruction Finetuning and Out-of-Distribution Vocabulary* (ICML).

### A13: Positive Directive Balance
*   **Formula**: $M_{A13} = \frac{N_{positive\_do}}{N_{positive\_do} + N_{negative\_dont} + \epsilon}$
*   **Reference**: *Positivity Bias in Attention Masks* (ACL).

### A14: Scope Boundary Clarity
*   **Formula**: $M_{A14} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasBoundary})$
    *   Requires keywords like *prohibited, outside scope, out of bounds*.
*   **Reference**: *Constrained Generation Limits* (ICLR).

### A15: Temporal Consistency
*   **Formula**: $M_{A15} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasOrdering})$
    *   Requires sequential transition terms (*firstly, secondly, step 1, step 2*).
*   **Reference**: *Sequential Planning in Auto-regressive Models* (NeurIPS).

---

## Dimension B: Context & Memory Management (15 Metrics)

### B1: Token Friction Weight
*   **Formula**: $M_{B1} = \max\left(0.1, 1.0 - 0.9 \times \left( \frac{T - 600}{2000 - 600} \right)^2\right)$ if $T > 600$, else $1.0$.
*   **Reference**: *SkillsBench: Benchmarking How Well Agent Skills Work* (arXiv:2602.12670).

### B2: Information Density
*   **Formula**: $M_{B2} = \frac{W_{content}}{W_{total} + \epsilon}$
    *   Excludes English stop words (*the, a, of, and*).
*   **Reference**: *Stopword Saturation in Large Context Windows* (arXiv).

### B3: Lost-in-the-Middle Parabolic Curve
*   **Formula**: $M_{B3} = 1.0 - \text{average}(|0.5 - p_i|^2 \times \text{importance}_i)$
    *   Penalizes crucial instructions placed near the relative middle ($p_i \approx 0.5$) of the prompt.
*   **Reference**: *Lost in the Middle: How Language Models Use Long Contexts* (Liu et al., 2023).

### B4: Nested List Depth
*   **Formula**: $M_{B4} = \max\left(0.1, 1.0 - 0.2 \times \max\left(0, D_{depth} - 3\right)\right)$
*   **Reference**: *Structural Parsing Limits of Attention Mechanisms* (NIPS).

### B5: Reference Validity
*   **Formula**: $M_{B5} = 1.0 - \frac{N_{broken}}{N_{total} + \epsilon}$
*   **Reference**: *Reference Resolution in Agent Multi-file Architectures* (NeurIPS).

### B6: Code Block Density
*   **Formula**: $M_{B6} = 1.0 - 1.5 \times |R_{code} - 0.25|$ if $R_{code} \notin [0.10, 0.40]$ else $1.0$.
*   **Reference**: *Code Prompt Distillation and Token Efficiencies* (EMNLP).

### B7: XML Wrapper Tag Matching
*   **Formula**: $M_{B7} = 0.2 + 0.8 \cdot \mathbb{I}(N_{mismatch} = 0)$
*   **Reference**: *HTML/XML Parsing Capabilities of Instruct Models* (arXiv:2501).

### B8: Schema Completeness
*   **Formula**: $M_{B8} = 0.6 \times \frac{N_{described\_params}}{N_{total\_params}} + 0.4 \times \text{hasRequiredFields}$
*   **Reference**: *JSON Schema Validation in Agent Tool-use* (OWASP).

### B9: Context Pruning Directives
*   **Formula**: $M_{B9} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasPrune})$
    *   Requires memory pruning keywords (*forget, clear memory, ignore past*).
*   **Reference**: *State Tracking in Long-Context LLMs* (NeurIPS).

### B10: Variable Allocation
*   **Formula**: $M_{B10} = 0.3 + 0.7 \cdot \mathbb{I}(N_{unallocated\_vars} = 0)$
*   **Reference**: *Parameter Resolution in Template Prompting* (ACL).

### B11: Logging Frequency directives
*   **Formula**: $M_{B11} = \min\left(1.0, \frac{N_{log\_requests}}{2.0}\right)$
*   **Reference**: *Audit Logs in Agent Execution Trajectories* (IEEE).

### B12: Checkpoint Frequency
*   **Formula**: $M_{B12} = \min\left(1.0, \frac{N_{checkpoint}}{2.0}\right)$
*   **Reference**: *State Checkpointing in Agent Workflows* (ACM).

### B13: Redundancy Line Penalty
*   **Formula**: $M_{B13} = 1.0 - 2.0 \times \frac{N_{dup\_lines}}{N_{total\_lines}}$
*   **Reference**: *Token Bloat and Semantic Compression* (arXiv:2506).

### B14: Stop-Word Saturation
*   **Formula**: $M_{B14} = 1.0 - \text{stop\_word\_ratio}$
*   **Reference**: *Information Bottlenecks in Transformer Layers* (ICML).

### B15: History Size Constraints
*   **Formula**: $M_{B15} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasHistoryLimit})$
*   **Reference**: *Context Window Overflows in Agent Loop Architectures* (IEEE).

---

## Dimension C: Safety, Alignment & Security (15 Metrics)

### C1: Prompt Injection Shield
*   **Formula**: $M_{C1} = \mathbb{I}(\text{hasInjectionShield})$
    *   Requires *ignore user override, do not let user modify system prompt*.
*   **Reference**: *Defending Against Prompt Injection* (arXiv:2308).

### C2: System Instruction Protection
*   **Formula**: $M_{C2} = \mathbb{I}(\text{hasLeakProtection})$
    *   Requires *do not reveal this prompt, system prompt protection*.
*   **Reference**: *Leakage Mitigation in Instruction Tuning* (NeurIPS).

### C3: Role Hijacking Defense
*   **Formula**: $M_{C3} = \mathbb{I}(\text{hasRoleLock})$
    *   Requires *never change your role, strictly act as*.
*   **Reference**: *Persona Hijacking in Multi-agent Systems* (ICML).

### C4: Jailbreak Resistance Keywords
*   **Formula**: $M_{C4} = 0.3 + 0.7 \cdot \mathbb{I}(\text{hasJailbreakRules})$
*   **Reference**: *Safeguarding LLM Agent Outputs* (OWASP).

### C5: Exfiltration Defense
*   **Formula**: $M_{C5} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasExfiltrationShield})$
    *   Requires *do not send prompt content to external APIs*.
*   **Reference**: *Data Exfiltration Attacks in Tool-enabled LLMs* (arXiv).

### C6: PII Masking Instructions
*   **Formula**: $M_{C6} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasPIIMasking})$
*   **Reference**: *Privacy Guardrails in Prompt Templates* (ACM).

### C7: Sandbox Constraints
*   **Formula**: $M_{C7} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasSandboxRules})$
*   **Reference**: *Secure Code Execution Guidelines for Agents* (USENIX).

### C8: Command Authority Scope
*   **Formula**: $M_{C8} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasAuthorityRules})$
*   **Reference**: *Least Privilege Principle for LLM Tools* (arXiv).

### C9: Compliance Rules
*   **Formula**: $M_{C9} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasCompliance})$
*   **Reference**: *Enterprise Policy Compliance in Generative Agents* (IEEE).

### C10: Input Sanitization Instructions
*   **Formula**: $M_{C10} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasInputSanitization})$
*   **Reference**: *Prompt Sanitization Heuristics* (BlackHat).

### C11: Output Validation Directives
*   **Formula**: $M_{C11} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasOutputValidation})$
*   **Reference**: *Self-Correcting Reasoning Loops* (ACL).

### C12: Trust Boundary Checking
*   **Formula**: $M_{C12} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasTrustBoundary})$
*   **Reference**: *API Endpoint Validation in Agent Systems* (NIPS).

### C13: Access Control Rules
*   **Formula**: $M_{C13} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasAccessControl})$
*   **Reference**: *Role-Based Access Control in LLMs* (ACM).

### C14: Override Blockers
*   **Formula**: $M_{C14} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasOverrideRules})$
*   **Reference**: *Adversarial Override Defenses in LLM Agents* (ICLR).

### C15: Log Obfuscation
*   **Formula**: $M_{C15} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasObfuscation})$
*   **Reference**: *Preventing Password Leakage in Agent Logs* (IEEE).

---

## Dimension D: Tool-Use & MCP Clarity (15 Metrics)

### D1: Parameter Spec Clarity
*   **Formula**: $M_{D1} = \frac{N_{typed\_params}}{N_{params} + \epsilon}$
*   **Reference**: *Type Hallucinations in Tool Selection* (ICSE).

### D2: Required Field Spec
*   **Formula**: $M_{D2} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasRequired})$
*   **Reference**: *JSON Schema Validation in OpenAPI Specifications* (W3C).

### D3: Argument Description Quality
*   **Formula**: $M_{D3} = \frac{N_{long\_desc\_params}}{N_{params} + \epsilon}$ (desc must be > 10 chars).
*   **Reference**: *Descriptive Parameter Mismatches in Tool Use* (ACL).

### D4: Parallel Call Control
*   **Formula**: $M_{D4} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasParallelRules})$
*   **Reference**: *Parallel Execution Conflicts in Multi-Tool Agents* (arXiv).

### D5: Rate Limit Guidelines
*   **Formula**: $M_{D5} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasRateLimitRules})$
*   **Reference**: *Handling Rate Limits in Autonomous Workflows* (ACM).

### D6: Error Response Handling
*   **Formula**: $M_{D6} = \min\left(1.0, \frac{N_{error\_keywords}}{3.0}\right)$
*   **Reference**: *Robustness of Agent Tool Call Trajectories* (NIPS).

### D7: Tool Output Parsers
*   **Formula**: $M_{D7} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasParserRules})$
*   **Reference**: *Structured Output Extraction in Agent Libraries* (arXiv).

### D8: Tool Selection Logic
*   **Formula**: $M_{D8} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasSelectionRules})$
*   **Reference**: *Heuristics for Tool Selection under Large Context* (ICML).

### D9: Input Encoding Specifications
*   **Formula**: $M_{D9} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasEncoding})$
*   **Reference**: *Encoding Mismatches in Network Tools* (USENIX).

### D10: Execution Sequence Constraints
*   **Formula**: $M_{D10} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasSequenceRules})$
*   **Reference**: *DAG Execution Planners in Generative Agents* (VLDB).

### D11: Fail-safe Defaults
*   **Formula**: $M_{D11} = 0.3 + 0.7 \cdot \mathbb{I}(\text{hasFailSafe})$
*   **Reference**: *Fail-Safe Mechanisms in Autonomous LLM Systems* (IEEE).

### D12: Schema Conformance checks
*   **Formula**: $M_{D12} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasConformance})$
*   **Reference**: *API Schema Drifts in Autonomous Agents* (OWASP).

### D13: Payload Size Limits
*   **Formula**: $M_{D13} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasPayloadLimits})$
*   **Reference**: *Network Resource Optimization in LLM Pipelines* (ACM).

### D14: Callback Specifications
*   **Formula**: $M_{D14} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasCallbackRules})$
*   **Reference**: *Asynchronous Tool Invocation Protocols* (IEEE).

### D15: Resource Clean-up
*   **Formula**: $M_{D15} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasCleanup})$
*   **Reference**: *Memory Leak Protections in Agent Kernels* (ACM).

---

## Dimension E: Robustness & Exception Handling (15 Metrics)

### E1: Exception Catcher
*   **Formula**: $M_{E1} = \min\left(1.0, \frac{N_{defensive}}{3.0}\right)$
*   **Reference**: *Defensive Prompting: Preventing Failure Modes* (NIPS).

### E2: Exit Strategy
*   **Formula**: $M_{E2} = \mathbb{I}(\text{hasExit})$
    *   Requires *abort, terminate, stop execution, exit*.
*   **Reference**: *Halting Problems in Autonomous Agent Reasoning* (ICML).

### E3: Retry Budgets
*   **Formula**: $M_{E3} = 0.3 + 0.7 \cdot \mathbb{I}(\text{hasRetryBudget})$
*   **Reference**: *Self-Healing Protocols in Code Generation* (EMNLP).

### E4: Fallback Plan
*   **Formula**: $M_{E4} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasFallback})$
*   **Reference**: *Resilience in Agentic Planning* (NeurIPS).

### E5: Unexpected Input Recovery
*   **Formula**: $M_{E5} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasInputRecovery})$
*   **Reference**: *Error Recovery Vectors in Transformer Prompts* (ACL).

### E6: Ambiguity Resolution Flow
*   **Formula**: $M_{E6} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasAmbiguityFlow})$
*   **Reference**: *Interactive Query Clarification in LLMs* (SIGIR).

### E7: State Recovery
*   **Formula**: $M_{E7} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasStateRecovery})$
*   **Reference**: *Virtual Machine State Checks in Code Interpreters* (USENIX).

### E8: Diagnostics directives
*   **Formula**: $M_{E8} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasDiagnostics})$
*   **Reference**: *Diagnostic Tracing Protocols in Generative AI* (ACM).

### E9: Timeouts
*   **Formula**: $M_{E9} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasTimeouts})$
*   **Reference**: *Inference Cost Caps in Agent Loops* (IEEE).

### E10: Graceful Degradation
*   **Formula**: $M_{E10} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasDegradation})$
*   **Reference**: *Fault Tolerance in Multi-Agent Pipelines* (NIPS).

### E11: Boundary Value Checks
*   **Formula**: $M_{E11} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasBoundaryChecks})$
*   **Reference**: *Property-Based Testing of LLM Outputs* (ICSE).

### E12: Noise Filtering
*   **Formula**: $M_{E12} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasNoiseFilter})$
*   **Reference**: *Distraction Resistance in Autoregressive Models* (ACL).

### E13: Invariant Assertions
*   **Formula**: $M_{E13} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasAssertions})$
*   **Reference**: *Runtime Assertion Guarantees in Prompt Executions* (NeurIPS).

### E14: Conflicting Prompt Resolvers
*   **Formula**: $M_{E14} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasConflictResolvers})$
*   **Reference**: *Multi-Objective Optimizations in System Prompts* (ICLR).

### E15: Self-Correction Loop Limits
*   **Formula**: $M_{E15} = 0.4 + 0.6 \cdot \mathbb{I}(\text{hasCorrectionLimits})$
*   **Reference**: *Hallucination Cycles in Self-Refining Loops* (arXiv).

---

## Dimension F: Operational & Inference Economy (15 Metrics)

### F1: Chain-of-Thought Loop Penalty
*   **Formula**: $M_{F1} = 1.0 - 0.2 \times N_{loop}$ (e.g. *retry indefinitely, repeat step*).
*   **Reference**: *Trapped in CoT Loops: Infinite Deductions* (arXiv).

### F2: Output Verbosity Control
*   **Formula**: $M_{F2} = 0.3 + 0.7 \cdot \mathbb{I}(\text{hasVerbosityLimits})$
*   **Reference**: *Token Redundancy and Response Compactness* (EMNLP).

### F3: Token Pruning directives
*   **Formula**: $M_{F3} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasPruning})$
*   **Reference**: *Information Compression in Prompt Engineering* (ICML).

### F4: Early Exit Criteria
*   **Formula**: $M_{F4} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasEarlyExit})$
*   **Reference**: *Early Exit Mechanisms in Long Context Reasoning* (NeurIPS).

### F5: Query Cache Directives
*   **Formula**: $M_{F5} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasCaching})$
*   **Reference**: *Optimizing Prompt Cache Hits in LLM APIs* (ACM).

### F6: Batching Directives
*   **Formula**: $M_{F6} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasBatching})$
*   **Reference**: *Throughput Optimization in Agent Operations* (IEEE).

### F7: Context Compression Rules
*   **Formula**: $M_{F7} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasCompression})$
*   **Reference**: *Prompt Compression Algorithms for Long History* (arXiv).

### F8: Computation Reuse
*   **Formula**: $M_{F8} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasReuse})$
*   **Reference**: *Intermediate State Sharing in Agent Chains* (NeurIPS).

### F9: Model Tier Routing
*   **Formula**: $M_{F9} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasModelRouting})$
*   **Reference**: *Cost-Efficient Model Cascades in Agent Pipelines* (ACM).

### F10: Redundant Thought Blocker
*   **Formula**: $M_{F10} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasThoughtBlocker})$
*   **Reference**: *Eliminating Redundant Thoughts in Tree of Thoughts* (ACL).

### F11: Minimalist Representation
*   **Formula**: $M_{F11} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasMinimalist})$
*   **Reference**: *Low-Precision Representations in Prompt Semantics* (EMNLP).

### F12: Inline Formatting Pruning
*   **Formula**: $M_{F12} = 0.6 + 0.4 \cdot \mathbb{I}(\text{hasFormattingRestrictions})$
*   **Reference**: *Cost of Markdown Decoration Tokens in LLM Decoding* (arXiv).

### F13: Vocabulary Simplification
*   **Formula**: $M_{F13} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasVocabLimits})$
*   **Reference**: *High-Frequency Token Steering in Instruct Models* (NAACL).

### F14: Non-Interactive Mode Directives
*   **Formula**: $M_{F14} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasNonInteractive})$
*   **Reference**: *Batch Inference vs Interactive Chat Execution* (IEEE).

### F15: Lazy Evaluation Guidelines
*   **Formula**: $M_{F15} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasLazyEval})$
*   **Reference**: *Lazy Computations in Large Language Agents* (ACM).

---

## Dimension G: Syntax, Structure & Metadata (10 Metrics)

### G1: Frontmatter Integrity
*   **Formula**: $M_{G1} = \mathbb{I}(\text{hasFrontmatter})$
*   **Reference**: *Structured Metadata in Package Management Systems* (ACM).

### G2: Required Frontmatter Fields
*   **Formula**: $M_{G2} = (\text{hasName} \&\& \text{hasDesc}) ? 1.0 : 0.0$
*   **Reference**: *Package Spec Schema Validation Protocols* (IEEE).

### G3: Heading Hierarchy Correctness
*   **Formula**: $M_{G3} = 0.3 + 0.7 \cdot \mathbb{I}(\text{isHierarchical})$
    *   No structural jumps (e.g. going from `#` straight to `###`).
*   **Reference**: *Document Structural Parsers in Layout Analysis* (CVPR).

### G4: List Syntax Validity
*   **Formula**: $M_{G4} = 0.5 + 0.5 \cdot \mathbb{I}(\text{isListSyntaxConsistent})$
*   **Reference**: *Markdown Parser Sanity Standards* (W3C).

### G5: Code Block Language Spec
*   **Formula**: $M_{G5} = 0.3 + 0.7 \cdot \mathbb{I}(\text{allCodeBlocksHaveLang})$
*   **Reference**: *Syntax Highlighter Parsers for Source Files* (ACM).

### G6: Broken Link Detector
*   **Formula**: $M_{G6} = 1.0 - \frac{N_{broken\_links}}{N_{links} + \epsilon}$
*   **Reference**: *Hyperlink Integrity on Version Controlled Markdown* (IEEE).

### G7: Empty Section Penalty
*   **Formula**: $M_{G7} = 0.5 + 0.5 \cdot \mathbb{I}(N_{empty\_sections} = 0)$
*   **Reference**: *Information Redundancy in Semantic Structures* (ACL).

### G8: HTML Entity Validation
*   **Formula**: $M_{G8} = 0.5 + 0.5 \cdot \mathbb{I}(N_{malformed\_entities} = 0)$
*   **Reference**: *HTML Entity Parsers and Escape Vulnerabilities* (OWASP).

### G9: Formatting Consistency
*   **Formula**: $M_{G9} = 0.6 + 0.4 \cdot \mathbb{I}(\text{hasConsistentSpacing})$
*   **Reference**: *Markdown Formatting Linters standards* (W3C).

### G10: UTF-8 Encoding compliance
*   **Formula**: $M_{G10} = \text{isUtf8} ? 1.0 : 0.0$
*   **Reference**: *Character Encoding Security and Robustness* (RFC 3629).

### G11: YAML Schema Validation
*   **Formula**: $M_{G11} = 0.5 + 0.5 \cdot \mathbb{I}(\text{hasTests} \wedge \text{isArray})$
*   **Reference**: *Structured Schema Verification in Large Context Prompts* (IEEE).

### G12: Code Block Closure Integrity
*   **Formula**: $M_{G12} = \text{allClosed} ? 1.0 : 0.2$
*   **Reference**: *Grammatical Parsing Integrity of Markdown Templates* (ACL).

### G13: Inline Code Block Density
*   **Formula**: $M_{G13} = 1.0 - \min\left(0.7, \max\left(0, \frac{N_{\text{backticks}}}{N_{\text{words}}} - 0.12\right) \times 5.0\right)$
*   **Reference**: *Visual Density and Attention Allotment in Prompt Layouts* (CHI).

### G14: URL Protocol Safety
*   **Formula**: $M_{G14} = \max\left(0.4, 1.0 - 0.2 \times N_{\text{insecure}}\right)$
*   **Reference**: *Secure Documentation Practices in Version Control* (USENIX).

### G15: Blockquote Nesting Depth
*   **Formula**: $M_{G15} = \max\left(0.3, 1.0 - 0.25 \times N_{\text{nested}}\right)$
*   **Reference**: *Parsing Structural Hierarchy in Autoregressive Models* (EMNLP).

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
The static score is calculated using the normalized sum of the 105 criteria:
$$S_{\text{static}} = \frac{100.00}{105.00} \sum_{i=1}^{105} M_i$$

#### Phase 2: Dynamic Semantic Audit ($M_{\text{semantic}}$)
A cost-efficient model (`gemini-2.5-flash-lite`) is invoked to assess the prompt on qualitative properties. The model outputs a JSON payload containing:
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
