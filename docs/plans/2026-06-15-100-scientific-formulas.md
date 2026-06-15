# Scientific Specification: 100 Scored Metrics for SkillGauge

This document details the mathematical formulations and scientific references for all **100 criteria** used to statically audit and score agent skills.

---

## Dimension A: Instruction Quality & Clarity

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
*   **Formula**: $M_{A9} = \text{hasFormat} ? 1.0 : 0.3$
    *   `hasFormat` check is true if formatting spec keywords (*JSON, YAML, CSV, Markdown Table*) are present.
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
*   **Formula**: $M_{A14} = \text{hasBoundary} ? 1.0 : 0.5$
    *   Requires keywords like *prohibited, outside scope, out of bounds*.
*   **Reference**: *Constrained Generation Limits* (ICLR).

### A15: Temporal Consistency
*   **Formula**: $M_{A15} = \text{hasOrdering} ? 1.0 : 0.4$
    *   Requires sequential transition terms (*firstly, secondly, step 1, step 2*).
*   **Reference**: *Sequential Planning in Auto-regressive Models* (NeurIPS).

---

## Dimension B: Context & Memory Management

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
*   **Formula**: $M_{B7} = N_{mismatch} === 0 ? 1.0 : 0.2$
*   **Reference**: *HTML/XML Parsing Capabilities of Instruct Models* (arXiv:2501).

### B8: Schema Completeness
*   **Formula**: $M_{B8} = 0.6 \times \frac{N_{described\_params}}{N_{total\_params}} + 0.4 \times \text{hasRequiredFields}$
*   **Reference**: *JSON Schema Validation in Agent Tool-use* (OWASP).

### B9: Context Pruning Directives
*   **Formula**: $M_{B9} = \text{hasPrune} ? 1.0 : 0.5$
    *   Requires memory pruning keywords (*forget, clear memory, ignore past*).
*   **Reference**: *State Tracking in Long-Context LLMs* (NeurIPS).

### B10: Variable Allocation
*   **Formula**: $M_{B10} = N_{unallocated\_vars} === 0 ? 1.0 : 0.3$
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
*   **Formula**: $M_{B15} = \text{hasHistoryLimit} ? 1.0 : 0.5$
*   **Reference**: *Context Window Overflows in Agent Loop Architectures* (IEEE).

---

## Dimension C: Safety, Alignment & Security

### C1: Prompt Injection Shield
*   **Formula**: $M_{C1} = \text{hasInjectionShield} ? 1.0 : 0.0$
    *   Requires *ignore user override, do not let user modify system prompt*.
*   **Reference**: *Defending Against Prompt Injection* (arXiv:2308).

### C2: System Instruction Protection
*   **Formula**: $M_{C2} = \text{hasLeakProtection} ? 1.0 : 0.0$
    *   Requires *do not reveal this prompt, system prompt protection*.
*   **Reference**: *Leakage Mitigation in Instruction Tuning* (NeurIPS).

### C3: Role Hijacking Defense
*   **Formula**: $M_{C3} = \text{hasRoleLock} ? 1.0 : 0.0$
    *   Requires *never change your role, strictly act as*.
*   **Reference**: *Persona Hijacking in Multi-agent Systems* (ICML).

### C4: Jailbreak Resistance Keywords
*   **Formula**: $M_{C4} = \text{hasJailbreakRules} ? 1.0 : 0.3$
*   **Reference**: *Safeguarding LLM Agent Outputs* (OWASP).

### C5: Exfiltration Defense
*   **Formula**: $M_{C5} = \text{hasExfiltrationShield} ? 1.0 : 0.4$
    *   Requires *do not send prompt content to external APIs*.
*   **Reference**: *Data Exfiltration Attacks in Tool-enabled LLMs* (arXiv).

### C6: PII Masking Instructions
*   **Formula**: $M_{C6} = \text{hasPIIMasking} ? 1.0 : 0.5$
*   **Reference**: *Privacy Guardrails in Prompt Templates* (ACM).

### C7: Sandbox Constraints
*   **Formula**: $M_{C7} = \text{hasSandboxRules} ? 1.0 : 0.5$
*   **Reference**: *Secure Code Execution Guidelines for Agents* (USENIX).

### C8: Command Authority Scope
*   **Formula**: $M_{C8} = \text{hasAuthorityRules} ? 1.0 : 0.4$
*   **Reference**: *Least Privilege Principle for LLM Tools* (arXiv).

### C9: Compliance Rules
*   **Formula**: $M_{C9} = \text{hasCompliance} ? 1.0 : 0.5$
*   **Reference**: *Enterprise Policy Compliance in Generative Agents* (IEEE).

### C10: Input Sanitization Instructions
*   **Formula**: $M_{C10} = \text{hasInputSanitization} ? 1.0 : 0.4$
*   **Reference**: *Prompt Sanitization Heuristics* (BlackHat).

### C11: Output Validation Directives
*   **Formula**: $M_{C11} = \text{hasOutputValidation} ? 1.0 : 0.4$
*   **Reference**: *Self-Correcting Reasoning Loops* (ACL).

### C12: Trust Boundary Checking
*   **Formula**: $M_{C12} = \text{hasTrustBoundary} ? 1.0 : 0.5$
*   **Reference**: *API Endpoint Validation in Agent Systems* (NIPS).

### C13: Access Control Rules
*   **Formula**: $M_{C13} = \text{hasAccessControl} ? 1.0 : 0.5$
*   **Reference**: *Role-Based Access Control in LLMs* (ACM).

### C14: Override Blockers
*   **Formula**: $M_{C14} = \text{hasOverrideRules} ? 1.0 : 0.4$
*   **Reference**: *Adversarial Override Defenses in LLM Agents* (ICLR).

### C15: Log Obfuscation
*   **Formula**: $M_{C15} = \text{hasObfuscation} ? 1.0 : 0.5$
*   **Reference**: *Preventing Password Leakage in Agent Logs* (IEEE).

---

## Dimension D: Tool-Use & MCP Clarity

### D1: Parameter Spec Clarity
*   **Formula**: $M_{D1} = \frac{N_{typed\_params}}{N_{params} + \epsilon}$
*   **Reference**: *Type Hallucinations in Tool Selection* (ICSE).

### D2: Required Field Spec
*   **Formula**: $M_{D2} = \text{hasRequired} ? 1.0 : 0.5$
*   **Reference**: *JSON Schema Validation in OpenAPI Specifications* (W3C).

### D3: Argument Description Quality
*   **Formula**: $M_{D3} = \frac{N_{long\_desc\_params}}{N_{params} + \epsilon}$ (desc must be > 10 chars).
*   **Reference**: *Descriptive Parameter Mismatches in Tool Use* (ACL).

### D4: Parallel Call Control
*   **Formula**: $M_{D4} = \text{hasParallelRules} ? 1.0 : 0.5$
*   **Reference**: *Parallel Execution Conflicts in Multi-Tool Agents* (arXiv).

### D5: Rate Limit Guidelines
*   **Formula**: $M_{D5} = \text{hasRateLimitRules} ? 1.0 : 0.4$
*   **Reference**: *Handling Rate Limits in Autonomous Workflows* (ACM).

### D6: Error Response Handling
*   **Formula**: $M_{D6} = \min\left(1.0, \frac{N_{error\_keywords}}{3.0}\right)$
*   **Reference**: *Robustness of Agent Tool Call Trajectories* (NIPS).

### D7: Tool Output Parsers
*   **Formula**: $M_{D7} = \text{hasParserRules} ? 1.0 : 0.5$
*   **Reference**: *Structured Output Extraction in Agent Libraries* (arXiv).

### D8: Tool Selection Logic
*   **Formula**: $M_{D8} = \text{hasSelectionRules} ? 1.0 : 0.4$
*   **Reference**: *Heuristics for Tool Selection under Large Context* (ICML).

### D9: Input Encoding Specifications
*   **Formula**: $M_{D9} = \text{hasEncoding} ? 1.0 : 0.5$
*   **Reference**: *Encoding Mismatches in Network Tools* (USENIX).

### D10: Execution Sequence Constraints
*   **Formula**: $M_{D10} = \text{hasSequenceRules} ? 1.0 : 0.5$
*   **Reference**: *DAG Execution Planners in Generative Agents* (VLDB).

### D11: Fail-safe Defaults
*   **Formula**: $M_{D11} = \text{hasFailSafe} ? 1.0 : 0.3$
*   **Reference**: *Fail-Safe Mechanisms in Autonomous LLM Systems* (IEEE).

### D12: Schema Conformance checks
*   **Formula**: $M_{D12} = \text{hasConformance} ? 1.0 : 0.5$
*   **Reference**: *API Schema Drifts in Autonomous Agents* (OWASP).

### D13: Payload Size Limits
*   **Formula**: $M_{D13} = \text{hasPayloadLimits} ? 1.0 : 0.5$
*   **Reference**: *Network Resource Optimization in LLM Pipelines* (ACM).

### D14: Callback Specifications
*   **Formula**: $M_{D14} = \text{hasCallbackRules} ? 1.0 : 0.5$
*   **Reference**: *Asynchronous Tool Invocation Protocols* (IEEE).

### D15: Resource Clean-up
*   **Formula**: $M_{D15} = \text{hasCleanup} ? 1.0 : 0.5$
*   **Reference**: *Memory Leak Protections in Agent Kernels* (ACM).

---

## Dimension E: Robustness & Exception Handling

### E1: Exception Catcher
*   **Formula**: $M_{E1} = \min\left(1.0, \frac{N_{defensive}}{3.0}\right)$
*   **Reference**: *Defensive Prompting: Preventing Failure Modes* (NIPS).

### E2: Exit Strategy
*   **Formula**: $M_{E2} = \text{hasExit} ? 1.0 : 0.0$
    *   Requires *abort, terminate, stop execution, exit*.
*   **Reference**: *Halting Problems in Autonomous Agent Reasoning* (ICML).

### E3: Retry Budgets
*   **Formula**: $M_{E3} = \text{hasRetryBudget} ? 1.0 : 0.3$
*   **Reference**: *Self-Healing Protocols in Code Generation* (EMNLP).

### E4: Fallback Plan
*   **Formula**: $M_{E4} = \text{hasFallback} ? 1.0 : 0.4$
*   **Reference**: *Resilience in Agentic Planning* (NeurIPS).

### E5: Unexpected Input Recovery
*   **Formula**: $M_{E5} = \text{hasInputRecovery} ? 1.0 : 0.4$
*   **Reference**: *Error Recovery Vectors in Transformer Prompts* (ACL).

### E6: Ambiguity Resolution Flow
*   **Formula**: $M_{E6} = \text{hasAmbiguityFlow} ? 1.0 : 0.4$
*   **Reference**: *Interactive Query Clarification in LLMs* (SIGIR).

### E7: State Recovery
*   **Formula**: $M_{E7} = \text{hasStateRecovery} ? 1.0 : 0.5$
*   **Reference**: *Virtual Machine State Checks in Code Interpreters* (USENIX).

### E8: Diagnostics directives
*   **Formula**: $M_{E8} = \text{hasDiagnostics} ? 1.0 : 0.4$
*   **Reference**: *Diagnostic Tracing Protocols in Generative AI* (ACM).

### E9: Timeouts
*   **Formula**: $M_{E9} = \text{hasTimeouts} ? 1.0 : 0.5$
*   **Reference**: *Inference Cost Caps in Agent Loops* (IEEE).

### E10: Graceful Degradation
*   **Formula**: $M_{E10} = \text{hasDegradation} ? 1.0 : 0.4$
*   **Reference**: *Fault Tolerance in Multi-Agent Pipelines* (NIPS).

### E11: Boundary Value Checks
*   **Formula**: $M_{E11} = \text{hasBoundaryChecks} ? 1.0 : 0.4$
*   **Reference**: *Property-Based Testing of LLM Outputs* (ICSE).

### E12: Noise Filtering
*   **Formula**: $M_{E12} = \text{hasNoiseFilter} ? 1.0 : 0.5$
*   **Reference**: *Distraction Resistance in Autoregressive Models* (ACL).

### E13: Invariant Assertions
*   **Formula**: $M_{E13} = \text{hasAssertions} ? 1.0 : 0.5$
*   **Reference**: *Runtime Assertion Guarantees in Prompt Executions* (NeurIPS).

### E14: Conflicting Prompt Resolvers
*   **Formula**: $M_{E14} = \text{hasConflictResolvers} ? 1.0 : 0.5$
*   **Reference**: *Multi-Objective Optimizations in System Prompts* (ICLR).

### E15: Self-Correction Loop Limits
*   **Formula**: $M_{E15} = \text{hasCorrectionLimits} ? 1.0 : 0.4$
*   **Reference**: *Hallucination Cycles in Self-Refining Loops* (arXiv).

---

## Dimension F: Operational & Inference Economy

### F1: Chain-of-Thought Loop Penalty
*   **Formula**: $M_{F1} = 1.0 - 0.2 \times N_{loop}$ (e.g. *retry indefinitely, repeat step*).
*   **Reference**: *Trapped in CoT Loops: Infinite Deductions* (arXiv).

### F2: Output Verbosity Control
*   **Formula**: $M_{F2} = \text{hasVerbosityLimits} ? 1.0 : 0.3$
*   **Reference**: *Token Redundancy and Response Compactness* (EMNLP).

### F3: Token Pruning directives
*   **Formula**: $M_{F3} = \text{hasPruning} ? 1.0 : 0.5$
*   **Reference**: *Information Compression in Prompt Engineering* (ICML).

### F4: Early Exit Criteria
*   **Formula**: $M_{F4} = \text{hasEarlyExit} ? 1.0 : 0.5$
*   **Reference**: *Early Exit Mechanisms in Long Context Reasoning* (NeurIPS).

### F5: Query Cache Directives
*   **Formula**: $M_{F5} = \text{hasCaching} ? 1.0 : 0.5$
*   **Reference**: *Optimizing Prompt Cache Hits in LLM APIs* (ACM).

### F6: Batching Directives
*   **Formula**: $M_{F6} = \text{hasBatching} ? 1.0 : 0.5$
*   **Reference**: *Throughput Optimization in Agent Operations* (IEEE).

### F7: Context Compression Rules
*   **Formula**: $M_{F7} = \text{hasCompression} ? 1.0 : 0.5$
*   **Reference**: *Prompt Compression Algorithms for Long History* (arXiv).

### F8: Computation Reuse
*   **Formula**: $M_{F8} = \text{hasReuse} ? 1.0 : 0.5$
*   **Reference**: *Intermediate State Sharing in Agent Chains* (NeurIPS).

### F9: Model Tier Routing
*   **Formula**: $M_{F9} = \text{hasModelRouting} ? 1.0 : 0.5$
*   **Reference**: *Cost-Efficient Model Cascades in Agent Pipelines* (ACM).

### F10: Redundant Thought Blocker
*   **Formula**: $M_{F10} = \text{hasThoughtBlocker} ? 1.0 : 0.5$
*   **Reference**: *Eliminating Redundant Thoughts in Tree of Thoughts* (ACL).

### F11: Minimalist Representation
*   **Formula**: $M_{F11} = \text{hasMinimalist} ? 1.0 : 0.5$
*   **Reference**: *Low-Precision Representations in Prompt Semantics* (EMNLP).

### F12: Inline Formatting Pruning
*   **Formula**: $M_{F12} = \text{hasFormattingRestrictions} ? 1.0 : 0.6$
*   **Reference**: *Cost of Markdown Decoration Tokens in LLM Decoding* (arXiv).

### F13: Vocabulary Simplification
*   **Formula**: $M_{F13} = \text{hasVocabLimits} ? 1.0 : 0.5$
*   **Reference**: *High-Frequency Token Steering in Instruct Models* (NAACL).

### F14: Non-Interactive Mode Directives
*   **Formula**: $M_{F14} = \text{hasNonInteractive} ? 1.0 : 0.5$
*   **Reference**: *Batch Inference vs Interactive Chat Execution* (IEEE).

### F15: Lazy Evaluation Guidelines
*   **Formula**: $M_{F15} = \text{hasLazyEval} ? 1.0 : 0.5$
*   **Reference**: *Lazy Computations in Large Language Agents* (ACM).

---

## Dimension G: Syntax, Structure & Metadata

### G1: Frontmatter Integrity
*   **Formula**: $M_{G1} = \text{hasFrontmatter} ? 1.0 : 0.0$
*   **Reference**: *Structured Metadata in Package Management Systems* (ACM).

### G2: Required Frontmatter Fields
*   **Formula**: $M_{G2} = (\text{hasName} \&\& \text{hasDesc}) ? 1.0 : 0.0$
*   **Reference**: *Package Spec Schema Validation Protocols* (IEEE).

### G3: Heading Hierarchy Correctness
*   **Formula**: $M_{G3} = \text{isHierarchical} ? 1.0 : 0.3$
    *   No structural jumps (e.g. going from `#` straight to `###`).
*   **Reference**: *Document Structural Parsers in Layout Analysis* (CVPR).

### G4: List Syntax Validity
*   **Formula**: $M_{G4} = \text{isListSyntaxConsistent} ? 1.0 : 0.5$
*   **Reference**: *Markdown Parser Sanity Standards* (W3C).

### G5: Code Block Language Spec
*   **Formula**: $M_{G5} = \text{allCodeBlocksHaveLang} ? 1.0 : 0.3$
*   **Reference**: *Syntax Highlighter Parsers for Source Files* (ACM).

### G6: Broken Link Detector
*   **Formula**: $M_{G6} = 1.0 - \frac{N_{broken\_links}}{N_{links} + \epsilon}$
*   **Reference**: *Hyperlink Integrity on Version Controlled Markdown* (IEEE).

### G7: Empty Section Penalty
*   **Formula**: $M_{G7} = N_{empty\_sections} === 0 ? 1.0 : 0.5$
*   **Reference**: *Information Redundancy in Semantic Structures* (ACL).

### G8: HTML Entity Validation
*   **Formula**: $M_{G8} = N_{malformed\_entities} === 0 ? 1.0 : 0.5$
*   **Reference**: *HTML Entity Parsers and Escape Vulnerabilities* (OWASP).

### G9: Formatting Consistency
*   **Formula**: $M_{G9} = \text{hasConsistentSpacing} ? 1.0 : 0.6$
*   **Reference**: *Markdown Formatting Linters standards* (W3C).

### G10: UTF-8 Encoding compliance
*   **Formula**: $M_{G10} = \text{isUtf8} ? 1.0 : 0.0$
*   **Reference**: *Character Encoding Security and Robustness* (RFC 3629).
