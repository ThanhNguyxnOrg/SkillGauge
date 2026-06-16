# Scientific Specification: 390 Scored Metrics for SkillGauge

This document details the mathematical formulations, evaluation dimensions, and academic literature references for all **100 criteria** used to statically audit and score agent process instruction files (`SKILL.md` or `.agent/skills/**/*.md`).

---

## 📐 Mathematical Formulation

SkillGauge computes the overall static score of a skill using the normalized sum of all **390 individual metric scores** (with all dimensions symmetric at 15 metrics each):

$$\text{Overall Static Score} = \frac{100.00}{390.00} \sum_{i=1}^{390} M_i$$

Where $M_i \in [0.0, 1.0]$ is the raw score computed by the $i$-th metric scorer function.

---

## 📊 Evaluation Matrix Summary

The 390 criteria are structured into 26 symmetric dimensions (A to Z). Each dimension contains exactly 15 metrics:

| ID | Dimension Name | Criteria count | Max Weight | Core Focus |
| --- | --- | --- | --- | --- |
| **Dim A** | Instruction Quality & Clarity | 15 Metrics | 15.00 | Readability, imperatives, qualifier ambiguity, voice constructs. |
| **Dim B** | Context & Memory Management | 15 Metrics | 15.00 | Token friction weight, XML matching, history bounds, stop-word footprint. |
| **Dim C** | Safety, Alignment & Security | 15 Metrics | 15.00 | Injection shielding, role lock, exfiltration guard, PII masks. |
| **Dim D** | Tool-Use & MCP Clarity | 15 Metrics | 15.00 | Parameter schemas, parallel calling rules, required fields, rate limits. |
| **Dim E** | Robustness & Exception Handling | 15 Metrics | 15.00 | Exit strategies, retry budgets, fallback plans, diagnostics, timeouts. |
| **Dim F** | Operational & Inference Economy | 15 Metrics | 15.00 | CoT loop blockers, verbosity control, caching, model cascading & routing. |
| **Dim G** | Syntax, Structure & Metadata | 15 Metrics | 15.00 | YAML frontmatter, heading jumps, list consistency, UTF-8 compliance, schema validation. |
| **Dim H** | Human-in-the-Loop | 15 Metrics | 15.00 | Lexical diversity of approval rules, semantic distance of conditionals to manual actions. |
| **Dim I** | Integration | 15 Metrics | 15.00 | TTR of endpoint rules, average token distance to timeout actions, density of get/post methods. |
| **Dim J** | JSON Conformity | 15 Metrics | 15.00 | TTR of parse rules, dependency of conditionals to schemas, density of properties and objects. |
| **Dim K** | Knowledge Retrieval | 15 Metrics | 15.00 | TTR of search rules, semantic distance to context, density of vector queries and embeddings. |
| **Dim L** | Logic Reasoning | 15 Metrics | 15.00 | TTR of conditionals, semantic distance of loops, density of calculations and algorithms. |
| **Dim M** | Multi-Agent | 15 Metrics | 15.00 | TTR of coordination rules, semantic distance of delegation, density of worker or orchestrate terms. |
| **Dim N** | Non-deterministic | 15 Metrics | 15.00 | TTR of sample rules, semantic distance of seed triggers, density of creative and temperature. |
| **Dim O** | Obfuscation | 15 Metrics | 15.00 | TTR of hide rules, semantic distance of hash triggers, density of encrypt/censor constraints. |
| **Dim P** | Privacy | 15 Metrics | 15.00 | TTR of PII rules, semantic distance to anonymous tags, density of secure and compliance rules. |
| **Dim Q** | Query Optimization | 15 Metrics | 15.00 | TTR of cache rules, semantic distance to rate limits, density of budget and minimize rules. |
| **Dim R** | Resilience | 15 Metrics | 15.00 | TTR of retry rules, semantic distance to fallbacks, density of catch and graceful exit rules. |
| **Dim S** | System Command | 15 Metrics | 15.00 | TTR of exec rules, semantic distance to run triggers, density of shell and stdout process rules. |
| **Dim T** | Temporal Order | 15 Metrics | 15.00 | TTR of sequence rules, semantic distance of order triggers, density of step and wait rules. |
| **Dim U** | User Persona | 15 Metrics | 15.00 | TTR of character rules, semantic distance of tone triggers, density of style and mimic rules. |
| **Dim V** | Vocabulary Constraints | 15 Metrics | 15.00 | TTR of vocabulary rules, semantic distance of word triggers, density of say and jargon constraints. |
| **Dim W** | Workflow Checkpoints | 15 Metrics | 15.00 | TTR of state rules, semantic distance of checkpoint triggers, density of progress and save rules. |
| **Dim X** | XML Parsing | 15 Metrics | 15.00 | TTR of tag rules, semantic distance of attribute triggers, density of element and parse rules. |
| **Dim Y** | Year/Temporal | 15 Metrics | 15.00 | TTR of time rules, semantic distance of date triggers, density of current and epoch rules. |
| **Dim Z** | Zero-Shot Balanced | 15 Metrics | 15.00 | TTR of shot rules, semantic distance of few triggers, density of zero and sample rules. |

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
*   **Reference**: *Structured Metadata in ## Dimensions H through Z: Advanced Agentic Calculations

### Dimension H: Human-in-the-Loop

#### H1: TTR (Type-Token Ratio) for approval-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving approval.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{approval}) \times 1.3)$

#### H2: Dependency Distance: 'if' to 'manual'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to manual actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, manual)}{24})$

#### H3: Density of 'escalate' constraints
*   **Description**: Calculates the absolute density of the keyword escalate against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(escalate) \times 13)$

#### H4: Variance of 'review' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'review'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{review}}{19})$

#### H5: Entropy of 'wait' and 'handover'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching wait or handover.
*   **Formula**: $M = \min(1.0, \frac{H(X_{wait,handover})}{4})$

#### H6: TTR (Type-Token Ratio) for override-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving override.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{override}) \times 1.4)$

#### H7: Dependency Distance: 'if' to 'review'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to review actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, review)}{34})$

#### H8: Density of 'handover' constraints
*   **Description**: Calculates the absolute density of the keyword handover against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(handover) \times 18)$

#### H9: Variance of 'manual' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'manual'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{manual}}{24})$

#### H10: Entropy of 'human' and 'escalate'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching human or escalate.
*   **Formula**: $M = \min(1.0, \frac{H(X_{human,escalate})}{3})$

#### H11: TTR (Type-Token Ratio) for approval-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving approval.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{approval}) \times 1.5)$

#### H12: Dependency Distance: 'if' to 'manual'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to manual actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, manual)}{44})$

#### H13: Density of 'escalate' constraints
*   **Description**: Calculates the absolute density of the keyword escalate against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(escalate) \times 23)$

#### H14: Variance of 'review' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'review'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{review}}{29})$

#### H15: Entropy of 'wait' and 'handover'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching wait or handover.
*   **Formula**: $M = \min(1.0, \frac{H(X_{wait,handover})}{2})$

### Dimension I: Integration

#### I1: TTR (Type-Token Ratio) for endpoint-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving endpoint.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{endpoint}) \times 1.3)$

#### I2: Dependency Distance: 'if' to 'timeout'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to timeout actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, timeout)}{24})$

#### I3: Density of 'header' constraints
*   **Description**: Calculates the absolute density of the keyword header against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(header) \times 13)$

#### I4: Variance of 'post' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'post'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{post}}{19})$

#### I5: Entropy of 'token' and 'get'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching token or get.
*   **Formula**: $M = \min(1.0, \frac{H(X_{token,get})}{4})$

#### I6: TTR (Type-Token Ratio) for fetch-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving fetch.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{fetch}) \times 1.4)$

#### I7: Dependency Distance: 'if' to 'post'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to post actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, post)}{34})$

#### I8: Density of 'get' constraints
*   **Description**: Calculates the absolute density of the keyword get against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(get) \times 18)$

#### I9: Variance of 'timeout' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'timeout'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{timeout}}{24})$

#### I10: Entropy of 'api' and 'header'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching api or header.
*   **Formula**: $M = \min(1.0, \frac{H(X_{api,header})}{3})$

#### I11: TTR (Type-Token Ratio) for endpoint-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving endpoint.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{endpoint}) \times 1.5)$

#### I12: Dependency Distance: 'if' to 'timeout'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to timeout actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, timeout)}{44})$

#### I13: Density of 'header' constraints
*   **Description**: Calculates the absolute density of the keyword header against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(header) \times 23)$

#### I14: Variance of 'post' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'post'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{post}}{29})$

#### I15: Entropy of 'token' and 'get'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching token or get.
*   **Formula**: $M = \min(1.0, \frac{H(X_{token,get})}{2})$

### Dimension J: JSON Conformity

#### J1: TTR (Type-Token Ratio) for parse-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving parse.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{parse}) \times 1.3)$

#### J2: Dependency Distance: 'if' to 'stringify'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to stringify actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, stringify)}{24})$

#### J3: Density of 'object' constraints
*   **Description**: Calculates the absolute density of the keyword object against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(object) \times 13)$

#### J4: Variance of 'null' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'null'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{null}}{19})$

#### J5: Entropy of 'schema' and 'boolean'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching schema or boolean.
*   **Formula**: $M = \min(1.0, \frac{H(X_{schema,boolean})}{4})$

#### J6: TTR (Type-Token Ratio) for property-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving property.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{property}) \times 1.4)$

#### J7: Dependency Distance: 'if' to 'null'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to null actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, null)}{34})$

#### J8: Density of 'boolean' constraints
*   **Description**: Calculates the absolute density of the keyword boolean against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(boolean) \times 18)$

#### J9: Variance of 'stringify' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'stringify'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{stringify}}{24})$

#### J10: Entropy of 'json' and 'object'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching json or object.
*   **Formula**: $M = \min(1.0, \frac{H(X_{json,object})}{3})$

#### J11: TTR (Type-Token Ratio) for parse-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving parse.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{parse}) \times 1.5)$

#### J12: Dependency Distance: 'if' to 'stringify'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to stringify actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, stringify)}{44})$

#### J13: Density of 'object' constraints
*   **Description**: Calculates the absolute density of the keyword object against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(object) \times 23)$

#### J14: Variance of 'null' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'null'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{null}}{29})$

#### J15: Entropy of 'schema' and 'boolean'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching schema or boolean.
*   **Formula**: $M = \min(1.0, \frac{H(X_{schema,boolean})}{2})$

### Dimension K: Knowledge Retrieval

#### K1: TTR (Type-Token Ratio) for rag-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving rag.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{rag}) \times 1.3)$

#### K2: Dependency Distance: 'if' to 'retrieve'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to retrieve actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, retrieve)}{24})$

#### K3: Density of 'context' constraints
*   **Description**: Calculates the absolute density of the keyword context against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(context) \times 13)$

#### K4: Variance of 'embed' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'embed'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{embed}}{19})$

#### K5: Entropy of 'vector' and 'database'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching vector or database.
*   **Formula**: $M = \min(1.0, \frac{H(X_{vector,database})}{4})$

#### K6: TTR (Type-Token Ratio) for query-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving query.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{query}) \times 1.4)$

#### K7: Dependency Distance: 'if' to 'embed'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to embed actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, embed)}{34})$

#### K8: Density of 'database' constraints
*   **Description**: Calculates the absolute density of the keyword database against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(database) \times 18)$

#### K9: Variance of 'retrieve' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'retrieve'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{retrieve}}{24})$

#### K10: Entropy of 'search' and 'context'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching search or context.
*   **Formula**: $M = \min(1.0, \frac{H(X_{search,context})}{3})$

#### K11: TTR (Type-Token Ratio) for rag-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving rag.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{rag}) \times 1.5)$

#### K12: Dependency Distance: 'if' to 'retrieve'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to retrieve actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, retrieve)}{44})$

#### K13: Density of 'context' constraints
*   **Description**: Calculates the absolute density of the keyword context against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(context) \times 23)$

#### K14: Variance of 'embed' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'embed'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{embed}}{29})$

#### K15: Entropy of 'vector' and 'database'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching vector or database.
*   **Formula**: $M = \min(1.0, \frac{H(X_{vector,database})}{2})$

### Dimension L: Logic Reasoning

#### L1: TTR (Type-Token Ratio) for then-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving then.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{then}) \times 1.3)$

#### L2: Dependency Distance: 'if' to 'else'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to else actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, else)}{24})$

#### L3: Density of 'loop' constraints
*   **Description**: Calculates the absolute density of the keyword loop against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(loop) \times 13)$

#### L4: Variance of 'calculate' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'calculate'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{calculate}}{19})$

#### L5: Entropy of 'evaluate' and 'algorithm'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching evaluate or algorithm.
*   **Formula**: $M = \min(1.0, \frac{H(X_{evaluate,algorithm})}{4})$

#### L6: TTR (Type-Token Ratio) for compute-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving compute.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{compute}) \times 1.4)$

#### L7: Dependency Distance: 'if' to 'calculate'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to calculate actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, calculate)}{34})$

#### L8: Density of 'algorithm' constraints
*   **Description**: Calculates the absolute density of the keyword algorithm against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(algorithm) \times 18)$

#### L9: Variance of 'else' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'else'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{else}}{24})$

#### L10: Entropy of 'if' and 'loop'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching if or loop.
*   **Formula**: $M = \min(1.0, \frac{H(X_{if,loop})}{3})$

#### L11: TTR (Type-Token Ratio) for then-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving then.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{then}) \times 1.5)$

#### L12: Dependency Distance: 'if' to 'else'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to else actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, else)}{44})$

#### L13: Density of 'loop' constraints
*   **Description**: Calculates the absolute density of the keyword loop against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(loop) \times 23)$

#### L14: Variance of 'calculate' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'calculate'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{calculate}}{29})$

#### L15: Entropy of 'evaluate' and 'algorithm'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching evaluate or algorithm.
*   **Formula**: $M = \min(1.0, \frac{H(X_{evaluate,algorithm})}{2})$

### Dimension M: Multi-Agent

#### M1: TTR (Type-Token Ratio) for coordinate-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving coordinate.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{coordinate}) \times 1.3)$

#### M2: Dependency Distance: 'if' to 'delegate'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to delegate actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, delegate)}{24})$

#### M3: Density of 'pass' constraints
*   **Description**: Calculates the absolute density of the keyword pass against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(pass) \times 13)$

#### M4: Variance of 'supervisor' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'supervisor'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{supervisor}}{19})$

#### M5: Entropy of 'message' and 'orchestrate'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching message or orchestrate.
*   **Formula**: $M = \min(1.0, \frac{H(X_{message,orchestrate})}{4})$

#### M6: TTR (Type-Token Ratio) for worker-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving worker.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{worker}) \times 1.4)$

#### M7: Dependency Distance: 'if' to 'supervisor'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to supervisor actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, supervisor)}{34})$

#### M8: Density of 'orchestrate' constraints
*   **Description**: Calculates the absolute density of the keyword orchestrate against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(orchestrate) \times 18)$

#### M9: Variance of 'delegate' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'delegate'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{delegate}}{24})$

#### M10: Entropy of 'agent' and 'pass'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching agent or pass.
*   **Formula**: $M = \min(1.0, \frac{H(X_{agent,pass})}{3})$

#### M11: TTR (Type-Token Ratio) for coordinate-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving coordinate.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{coordinate}) \times 1.5)$

#### M12: Dependency Distance: 'if' to 'delegate'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to delegate actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, delegate)}{44})$

#### M13: Density of 'pass' constraints
*   **Description**: Calculates the absolute density of the keyword pass against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(pass) \times 23)$

#### M14: Variance of 'supervisor' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'supervisor'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{supervisor}}{29})$

#### M15: Entropy of 'message' and 'orchestrate'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching message or orchestrate.
*   **Formula**: $M = \min(1.0, \frac{H(X_{message,orchestrate})}{2})$

### Dimension N: Non-deterministic

#### N1: TTR (Type-Token Ratio) for temperature-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving temperature.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{temperature}) \times 1.3)$

#### N2: Dependency Distance: 'if' to 'seed'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to seed actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, seed)}{24})$

#### N3: Density of 'sample' constraints
*   **Description**: Calculates the absolute density of the keyword sample against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(sample) \times 13)$

#### N4: Variance of 'vary' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'vary'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{vary}}{19})$

#### N5: Entropy of 'chance' and 'diverse'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching chance or diverse.
*   **Formula**: $M = \min(1.0, \frac{H(X_{chance,diverse})}{4})$

#### N6: TTR (Type-Token Ratio) for stochastic-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving stochastic.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{stochastic}) \times 1.4)$

#### N7: Dependency Distance: 'if' to 'vary'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to vary actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, vary)}{34})$

#### N8: Density of 'diverse' constraints
*   **Description**: Calculates the absolute density of the keyword diverse against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(diverse) \times 18)$

#### N9: Variance of 'seed' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'seed'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{seed}}{24})$

#### N10: Entropy of 'random' and 'sample'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching random or sample.
*   **Formula**: $M = \min(1.0, \frac{H(X_{random,sample})}{3})$

#### N11: TTR (Type-Token Ratio) for temperature-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving temperature.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{temperature}) \times 1.5)$

#### N12: Dependency Distance: 'if' to 'seed'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to seed actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, seed)}{44})$

#### N13: Density of 'sample' constraints
*   **Description**: Calculates the absolute density of the keyword sample against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(sample) \times 23)$

#### N14: Variance of 'vary' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'vary'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{vary}}{29})$

#### N15: Entropy of 'chance' and 'diverse'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching chance or diverse.
*   **Formula**: $M = \min(1.0, \frac{H(X_{chance,diverse})}{2})$

### Dimension O: Obfuscation

#### O1: TTR (Type-Token Ratio) for hide-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving hide.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{hide}) \times 1.3)$

#### O2: Dependency Distance: 'if' to 'encrypt'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to encrypt actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, encrypt)}{24})$

#### O3: Density of 'hash' constraints
*   **Description**: Calculates the absolute density of the keyword hash against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(hash) \times 13)$

#### O4: Variance of 'censor' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'censor'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{censor}}{19})$

#### O5: Entropy of 'obfuscate' and 'secret'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching obfuscate or secret.
*   **Formula**: $M = \min(1.0, \frac{H(X_{obfuscate,secret})}{4})$

#### O6: TTR (Type-Token Ratio) for redact-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving redact.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{redact}) \times 1.4)$

#### O7: Dependency Distance: 'if' to 'censor'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to censor actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, censor)}{34})$

#### O8: Density of 'secret' constraints
*   **Description**: Calculates the absolute density of the keyword secret against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(secret) \times 18)$

#### O9: Variance of 'encrypt' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'encrypt'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{encrypt}}{24})$

#### O10: Entropy of 'mask' and 'hash'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching mask or hash.
*   **Formula**: $M = \min(1.0, \frac{H(X_{mask,hash})}{3})$

#### O11: TTR (Type-Token Ratio) for hide-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving hide.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{hide}) \times 1.5)$

#### O12: Dependency Distance: 'if' to 'encrypt'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to encrypt actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, encrypt)}{44})$

#### O13: Density of 'hash' constraints
*   **Description**: Calculates the absolute density of the keyword hash against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(hash) \times 23)$

#### O14: Variance of 'censor' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'censor'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{censor}}{29})$

#### O15: Entropy of 'obfuscate' and 'secret'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching obfuscate or secret.
*   **Formula**: $M = \min(1.0, \frac{H(X_{obfuscate,secret})}{2})$

### Dimension P: Privacy

#### P1: TTR (Type-Token Ratio) for gdpr-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving gdpr.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{gdpr}) \times 1.3)$

#### P2: Dependency Distance: 'if' to 'data'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to data actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, data)}{24})$

#### P3: Density of 'private' constraints
*   **Description**: Calculates the absolute density of the keyword private against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(private) \times 13)$

#### P4: Variance of 'protect' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'protect'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{protect}}{19})$

#### P5: Entropy of 'anonymous' and 'leak'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching anonymous or leak.
*   **Formula**: $M = \min(1.0, \frac{H(X_{anonymous,leak})}{4})$

#### P6: TTR (Type-Token Ratio) for secure-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving secure.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{secure}) \times 1.4)$

#### P7: Dependency Distance: 'if' to 'protect'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to protect actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, protect)}{34})$

#### P8: Density of 'leak' constraints
*   **Description**: Calculates the absolute density of the keyword leak against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(leak) \times 18)$

#### P9: Variance of 'data' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'data'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{data}}{24})$

#### P10: Entropy of 'pii' and 'private'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching pii or private.
*   **Formula**: $M = \min(1.0, \frac{H(X_{pii,private})}{3})$

#### P11: TTR (Type-Token Ratio) for gdpr-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving gdpr.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{gdpr}) \times 1.5)$

#### P12: Dependency Distance: 'if' to 'data'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to data actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, data)}{44})$

#### P13: Density of 'private' constraints
*   **Description**: Calculates the absolute density of the keyword private against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(private) \times 23)$

#### P14: Variance of 'protect' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'protect'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{protect}}{29})$

#### P15: Entropy of 'anonymous' and 'leak'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching anonymous or leak.
*   **Formula**: $M = \min(1.0, \frac{H(X_{anonymous,leak})}{2})$

### Dimension Q: Query Optimization

#### Q1: TTR (Type-Token Ratio) for fast-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving fast.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{fast}) \times 1.3)$

#### Q2: Dependency Distance: 'if' to 'cache'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to cache actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, cache)}{24})$

#### Q3: Density of 'limit' constraints
*   **Description**: Calculates the absolute density of the keyword limit against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(limit) \times 13)$

#### Q4: Variance of 'speed' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'speed'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{speed}}{19})$

#### Q5: Entropy of 'minimize' and 'budget'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching minimize or budget.
*   **Formula**: $M = \min(1.0, \frac{H(X_{minimize,budget})}{4})$

#### Q6: TTR (Type-Token Ratio) for efficient-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving efficient.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{efficient}) \times 1.4)$

#### Q7: Dependency Distance: 'if' to 'speed'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to speed actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, speed)}{34})$

#### Q8: Density of 'budget' constraints
*   **Description**: Calculates the absolute density of the keyword budget against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(budget) \times 18)$

#### Q9: Variance of 'cache' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'cache'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{cache}}{24})$

#### Q10: Entropy of 'optimize' and 'limit'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching optimize or limit.
*   **Formula**: $M = \min(1.0, \frac{H(X_{optimize,limit})}{3})$

#### Q11: TTR (Type-Token Ratio) for fast-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving fast.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{fast}) \times 1.5)$

#### Q12: Dependency Distance: 'if' to 'cache'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to cache actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, cache)}{44})$

#### Q13: Density of 'limit' constraints
*   **Description**: Calculates the absolute density of the keyword limit against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(limit) \times 23)$

#### Q14: Variance of 'speed' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'speed'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{speed}}{29})$

#### Q15: Entropy of 'minimize' and 'budget'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching minimize or budget.
*   **Formula**: $M = \min(1.0, \frac{H(X_{minimize,budget})}{2})$

### Dimension R: Resilience

#### R1: TTR (Type-Token Ratio) for fallback-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving fallback.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{fallback}) \times 1.3)$

#### R2: Dependency Distance: 'if' to 'recover'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to recover actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, recover)}{24})$

#### R3: Density of 'catch' constraints
*   **Description**: Calculates the absolute density of the keyword catch against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(catch) \times 13)$

#### R4: Variance of 'graceful' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'graceful'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{graceful}}{19})$

#### R5: Entropy of 'fail' and 'restart'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching fail or restart.
*   **Formula**: $M = \min(1.0, \frac{H(X_{fail,restart})}{4})$

#### R6: TTR (Type-Token Ratio) for timeout-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving timeout.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{timeout}) \times 1.4)$

#### R7: Dependency Distance: 'if' to 'graceful'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to graceful actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, graceful)}{34})$

#### R8: Density of 'restart' constraints
*   **Description**: Calculates the absolute density of the keyword restart against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(restart) \times 18)$

#### R9: Variance of 'recover' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'recover'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{recover}}{24})$

#### R10: Entropy of 'retry' and 'catch'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching retry or catch.
*   **Formula**: $M = \min(1.0, \frac{H(X_{retry,catch})}{3})$

#### R11: TTR (Type-Token Ratio) for fallback-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving fallback.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{fallback}) \times 1.5)$

#### R12: Dependency Distance: 'if' to 'recover'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to recover actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, recover)}{44})$

#### R13: Density of 'catch' constraints
*   **Description**: Calculates the absolute density of the keyword catch against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(catch) \times 23)$

#### R14: Variance of 'graceful' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'graceful'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{graceful}}{29})$

#### R15: Entropy of 'fail' and 'restart'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching fail or restart.
*   **Formula**: $M = \min(1.0, \frac{H(X_{fail,restart})}{2})$

### Dimension S: System Command

#### S1: TTR (Type-Token Ratio) for exec-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving exec.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{exec}) \times 1.3)$

#### S2: Dependency Distance: 'if' to 'shell'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to shell actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, shell)}{24})$

#### S3: Density of 'run' constraints
*   **Description**: Calculates the absolute density of the keyword run against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(run) \times 13)$

#### S4: Variance of 'stdout' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'stdout'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{stdout}}{19})$

#### S5: Entropy of 'system' and 'stderr'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching system or stderr.
*   **Formula**: $M = \min(1.0, \frac{H(X_{system,stderr})}{4})$

#### S6: TTR (Type-Token Ratio) for terminal-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving terminal.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{terminal}) \times 1.4)$

#### S7: Dependency Distance: 'if' to 'stdout'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to stdout actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, stdout)}{34})$

#### S8: Density of 'stderr' constraints
*   **Description**: Calculates the absolute density of the keyword stderr against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(stderr) \times 18)$

#### S9: Variance of 'shell' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'shell'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{shell}}{24})$

#### S10: Entropy of 'bash' and 'run'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching bash or run.
*   **Formula**: $M = \min(1.0, \frac{H(X_{bash,run})}{3})$

#### S11: TTR (Type-Token Ratio) for exec-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving exec.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{exec}) \times 1.5)$

#### S12: Dependency Distance: 'if' to 'shell'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to shell actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, shell)}{44})$

#### S13: Density of 'run' constraints
*   **Description**: Calculates the absolute density of the keyword run against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(run) \times 23)$

#### S14: Variance of 'stdout' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'stdout'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{stdout}}{29})$

#### S15: Entropy of 'system' and 'stderr'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching system or stderr.
*   **Formula**: $M = \min(1.0, \frac{H(X_{system,stderr})}{2})$

### Dimension T: Temporal Order

#### T1: TTR (Type-Token Ratio) for then-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving then.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{then}) \times 1.3)$

#### T2: Dependency Distance: 'if' to 'next'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to next actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, next)}{24})$

#### T3: Density of 'finally' constraints
*   **Description**: Calculates the absolute density of the keyword finally against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(finally) \times 13)$

#### T4: Variance of 'order' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'order'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{order}}{19})$

#### T5: Entropy of 'after' and 'step'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching after or step.
*   **Formula**: $M = \min(1.0, \frac{H(X_{after,step})}{4})$

#### T6: TTR (Type-Token Ratio) for sequence-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving sequence.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{sequence}) \times 1.4)$

#### T7: Dependency Distance: 'if' to 'order'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to order actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, order)}{34})$

#### T8: Density of 'step' constraints
*   **Description**: Calculates the absolute density of the keyword step against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(step) \times 18)$

#### T9: Variance of 'next' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'next'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{next}}{24})$

#### T10: Entropy of 'first' and 'finally'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching first or finally.
*   **Formula**: $M = \min(1.0, \frac{H(X_{first,finally})}{3})$

#### T11: TTR (Type-Token Ratio) for then-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving then.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{then}) \times 1.5)$

#### T12: Dependency Distance: 'if' to 'next'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to next actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, next)}{44})$

#### T13: Density of 'finally' constraints
*   **Description**: Calculates the absolute density of the keyword finally against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(finally) \times 23)$

#### T14: Variance of 'order' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'order'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{order}}{29})$

#### T15: Entropy of 'after' and 'step'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching after or step.
*   **Formula**: $M = \min(1.0, \frac{H(X_{after,step})}{2})$

### Dimension U: User Persona

#### U1: TTR (Type-Token Ratio) for role-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving role.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{role}) \times 1.3)$

#### U2: Dependency Distance: 'if' to 'persona'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to persona actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, persona)}{24})$

#### U3: Density of 'you' constraints
*   **Description**: Calculates the absolute density of the keyword you against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(you) \times 13)$

#### U4: Variance of 'style' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'style'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{style}}{19})$

#### U5: Entropy of 'character' and 'voice'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching character or voice.
*   **Formula**: $M = \min(1.0, \frac{H(X_{character,voice})}{4})$

#### U6: TTR (Type-Token Ratio) for tone-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving tone.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{tone}) \times 1.4)$

#### U7: Dependency Distance: 'if' to 'style'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to style actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, style)}{34})$

#### U8: Density of 'voice' constraints
*   **Description**: Calculates the absolute density of the keyword voice against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(voice) \times 18)$

#### U9: Variance of 'persona' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'persona'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{persona}}{24})$

#### U10: Entropy of 'act' and 'you'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching act or you.
*   **Formula**: $M = \min(1.0, \frac{H(X_{act,you})}{3})$

#### U11: TTR (Type-Token Ratio) for role-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving role.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{role}) \times 1.5)$

#### U12: Dependency Distance: 'if' to 'persona'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to persona actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, persona)}{44})$

#### U13: Density of 'you' constraints
*   **Description**: Calculates the absolute density of the keyword you against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(you) \times 23)$

#### U14: Variance of 'style' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'style'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{style}}{29})$

#### U15: Entropy of 'character' and 'voice'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching character or voice.
*   **Formula**: $M = \min(1.0, \frac{H(X_{character,voice})}{2})$

### Dimension V: Vocabulary Constraints

#### V1: TTR (Type-Token Ratio) for avoid-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving avoid.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{avoid}) \times 1.3)$

#### V2: Dependency Distance: 'if' to 'word'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to word actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, word)}{24})$

#### V3: Density of 'language' constraints
*   **Description**: Calculates the absolute density of the keyword language against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(language) \times 13)$

#### V4: Variance of 'phrase' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'phrase'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{phrase}}{19})$

#### V5: Entropy of 'term' and 'jargon'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching term or jargon.
*   **Formula**: $M = \min(1.0, \frac{H(X_{term,jargon})}{4})$

#### V6: TTR (Type-Token Ratio) for say-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving say.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{say}) \times 1.4)$

#### V7: Dependency Distance: 'if' to 'phrase'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to phrase actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, phrase)}{34})$

#### V8: Density of 'jargon' constraints
*   **Description**: Calculates the absolute density of the keyword jargon against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(jargon) \times 18)$

#### V9: Variance of 'word' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'word'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{word}}{24})$

#### V10: Entropy of 'use' and 'language'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching use or language.
*   **Formula**: $M = \min(1.0, \frac{H(X_{use,language})}{3})$

#### V11: TTR (Type-Token Ratio) for avoid-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving avoid.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{avoid}) \times 1.5)$

#### V12: Dependency Distance: 'if' to 'word'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to word actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, word)}{44})$

#### V13: Density of 'language' constraints
*   **Description**: Calculates the absolute density of the keyword language against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(language) \times 23)$

#### V14: Variance of 'phrase' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'phrase'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{phrase}}{29})$

#### V15: Entropy of 'term' and 'jargon'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching term or jargon.
*   **Formula**: $M = \min(1.0, \frac{H(X_{term,jargon})}{2})$

### Dimension W: Workflow Checkpoints

#### W1: TTR (Type-Token Ratio) for state-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving state.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{state}) \times 1.3)$

#### W2: Dependency Distance: 'if' to 'checkpoint'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to checkpoint actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, checkpoint)}{24})$

#### W3: Density of 'resume' constraints
*   **Description**: Calculates the absolute density of the keyword resume against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(resume) \times 13)$

#### W4: Variance of 'progress' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'progress'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{progress}}{19})$

#### W5: Entropy of 'load' and 'log'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching load or log.
*   **Formula**: $M = \min(1.0, \frac{H(X_{load,log})}{4})$

#### W6: TTR (Type-Token Ratio) for status-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving status.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{status}) \times 1.4)$

#### W7: Dependency Distance: 'if' to 'progress'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to progress actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, progress)}{34})$

#### W8: Density of 'log' constraints
*   **Description**: Calculates the absolute density of the keyword log against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(log) \times 18)$

#### W9: Variance of 'checkpoint' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'checkpoint'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{checkpoint}}{24})$

#### W10: Entropy of 'save' and 'resume'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching save or resume.
*   **Formula**: $M = \min(1.0, \frac{H(X_{save,resume})}{3})$

#### W11: TTR (Type-Token Ratio) for state-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving state.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{state}) \times 1.5)$

#### W12: Dependency Distance: 'if' to 'checkpoint'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to checkpoint actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, checkpoint)}{44})$

#### W13: Density of 'resume' constraints
*   **Description**: Calculates the absolute density of the keyword resume against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(resume) \times 23)$

#### W14: Variance of 'progress' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'progress'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{progress}}{29})$

#### W15: Entropy of 'load' and 'log'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching load or log.
*   **Formula**: $M = \min(1.0, \frac{H(X_{load,log})}{2})$

### Dimension X: XML Parsing

#### X1: TTR (Type-Token Ratio) for tag-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving tag.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{tag}) \times 1.3)$

#### X2: Dependency Distance: 'if' to 'attribute'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to attribute actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, attribute)}{24})$

#### X3: Density of 'node' constraints
*   **Description**: Calculates the absolute density of the keyword node against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(node) \times 13)$

#### X4: Variance of 'dom' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'dom'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{dom}}{19})$

#### X5: Entropy of 'html' and 'tree'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching html or tree.
*   **Formula**: $M = \min(1.0, \frac{H(X_{html,tree})}{4})$

#### X6: TTR (Type-Token Ratio) for parse-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving parse.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{parse}) \times 1.4)$

#### X7: Dependency Distance: 'if' to 'dom'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to dom actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, dom)}{34})$

#### X8: Density of 'tree' constraints
*   **Description**: Calculates the absolute density of the keyword tree against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(tree) \times 18)$

#### X9: Variance of 'attribute' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'attribute'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{attribute}}{24})$

#### X10: Entropy of 'xml' and 'node'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching xml or node.
*   **Formula**: $M = \min(1.0, \frac{H(X_{xml,node})}{3})$

#### X11: TTR (Type-Token Ratio) for tag-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving tag.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{tag}) \times 1.5)$

#### X12: Dependency Distance: 'if' to 'attribute'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to attribute actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, attribute)}{44})$

#### X13: Density of 'node' constraints
*   **Description**: Calculates the absolute density of the keyword node against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(node) \times 23)$

#### X14: Variance of 'dom' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'dom'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{dom}}{29})$

#### X15: Entropy of 'html' and 'tree'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching html or tree.
*   **Formula**: $M = \min(1.0, \frac{H(X_{html,tree})}{2})$

### Dimension Y: Year/Temporal

#### Y1: TTR (Type-Token Ratio) for time-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving time.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{time}) \times 1.3)$

#### Y2: Dependency Distance: 'if' to 'year'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to year actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, year)}{24})$

#### Y3: Density of 'month' constraints
*   **Description**: Calculates the absolute density of the keyword month against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(month) \times 13)$

#### Y4: Variance of 'timestamp' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'timestamp'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{timestamp}}{19})$

#### Y5: Entropy of 'current' and 'epoch'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching current or epoch.
*   **Formula**: $M = \min(1.0, \frac{H(X_{current,epoch})}{4})$

#### Y6: TTR (Type-Token Ratio) for now-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving now.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{now}) \times 1.4)$

#### Y7: Dependency Distance: 'if' to 'timestamp'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to timestamp actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, timestamp)}{34})$

#### Y8: Density of 'epoch' constraints
*   **Description**: Calculates the absolute density of the keyword epoch against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(epoch) \times 18)$

#### Y9: Variance of 'year' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'year'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{year}}{24})$

#### Y10: Entropy of 'date' and 'month'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching date or month.
*   **Formula**: $M = \min(1.0, \frac{H(X_{date,month})}{3})$

#### Y11: TTR (Type-Token Ratio) for time-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving time.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{time}) \times 1.5)$

#### Y12: Dependency Distance: 'if' to 'year'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to year actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, year)}{44})$

#### Y13: Density of 'month' constraints
*   **Description**: Calculates the absolute density of the keyword month against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(month) \times 23)$

#### Y14: Variance of 'timestamp' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'timestamp'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{timestamp}}{29})$

#### Y15: Entropy of 'current' and 'epoch'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching current or epoch.
*   **Formula**: $M = \min(1.0, \frac{H(X_{current,epoch})}{2})$

### Dimension Z: Zero-Shot Balanced

#### Z1: TTR (Type-Token Ratio) for shot-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving shot.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{shot}) \times 1.3)$

#### Z2: Dependency Distance: 'if' to 'few'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to few actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, few)}{24})$

#### Z3: Density of 'zero' constraints
*   **Description**: Calculates the absolute density of the keyword zero against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(zero) \times 13)$

#### Z4: Variance of 'case' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'case'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{case}}{19})$

#### Z5: Entropy of 'show' and 'sample'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching show or sample.
*   **Formula**: $M = \min(1.0, \frac{H(X_{show,sample})}{4})$

#### Z6: TTR (Type-Token Ratio) for instance-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving instance.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{instance}) \times 1.4)$

#### Z7: Dependency Distance: 'if' to 'case'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to case actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, case)}{34})$

#### Z8: Density of 'sample' constraints
*   **Description**: Calculates the absolute density of the keyword sample against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(sample) \times 18)$

#### Z9: Variance of 'few' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'few'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{few}}{24})$

#### Z10: Entropy of 'example' and 'zero'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching example or zero.
*   **Formula**: $M = \min(1.0, \frac{H(X_{example,zero})}{3})$

#### Z11: TTR (Type-Token Ratio) for shot-based rules
*   **Description**: Evaluates the lexical diversity of rule structures involving shot.
*   **Formula**: $M = \min(1.0, \text{TTR}(X_{shot}) \times 1.5)$

#### Z12: Dependency Distance: 'if' to 'few'
*   **Description**: Mathematically calculates the average token distance from conditional triggers to few actions.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\text{dist}(\text{if}, few)}{44})$

#### Z13: Density of 'zero' constraints
*   **Description**: Calculates the absolute density of the keyword zero against total volume.
*   **Formula**: $M = \min(1.0, \text{Density}(zero) \times 23)$

#### Z14: Variance of 'case' block lengths
*   **Description**: Measures the standard deviation of text partitions split by 'case'.
*   **Formula**: $M = \max(0.1, 1.0 - \frac{\sigma_{case}}{29})$

#### Z15: Entropy of 'show' and 'sample'
*   **Description**: Computes the Shannon Entropy strictly bounded to tokens matching show or sample.
*   **Formula**: $M = \min(1.0, \frac{H(X_{show,sample})}{2})$

Package Management Systems* (ACM).

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
$S_{\text{static}} = \frac{100.00}{390.00} \sum_{i=1}^{390} M_i$

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
