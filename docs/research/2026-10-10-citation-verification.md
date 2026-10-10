# Citation verification — docs/scientific_metrics.md (2026-10-10)

Source: `docs/scientific_metrics.md` (1753 lines, read in full 2026-10-10).
Scope: every remaining bare/unverifiable citation — venue-only with no paper ID
(`(ACL)`/`(NeurIPS)`/`(EMNLP)`/`(NIPS)`/`(ICLR)`/`(ICML)`/`(CoNLL)`/`(NAACL)`/`(CVPR)`/`(SIGIR)`/`(VLDB)`/`(ICSE)`/`(IEEE)`/`(ACM)`/`(USENIX)`/`(BlackHat)`/`(OWASP)`/`(W3C)`/`(CHI)`), bare `(arXiv)`, month-only pseudo-IDs (`arXiv:2502`, `arXiv:2506`), plus the malformed G1 line.
Method: for each title below — exact-title query against Crossref (`api.crossref.org/works?query.title`, rows 1–2) and OpenAlex (`api.openalex.org/works?search`, per-page 1), exact-match test on returned top hit; spot checks via `arxiv.org/abs`, ACL Anthology, and exact-phrase web search. Zero exact matches = no supporting paper. Code or other docs untouched.

## Counts

- Total `**Reference**` lines in file: **105**
- Already `heuristic` (no action needed): **10** — A5, B6, B7, B10, C1, C2, E10, F1, F11, G11
- Paper-like references audited: **95**
  - **VERIFIED-with-ID: 3** — B3 (Lost in the Middle, arXiv:2307.03172), B1 (SkillsBench, arXiv:2602.12670 — real paper, but MISAPPLIED to the B1 formula), G10 (RFC 3629 — real standard)
  - **NO-SUPPORT-FOUND: 61** — plausible-sounding venue-only title, exact search returns only unrelated papers
  - **FABRICATED-LOOKING: 31** — pseudo-ID (`arXiv:2502/2506`), bare `(arXiv)`, standards-org-as-paper-venue (`OWASP`/`W3C`/`BlackHat`), venue absurd for the title (e.g. markdown linting at `W3C`/`CVPR`, VM state checks at `USENIX`), or malformed/truncated line (G1)
  - Bare/unverifiable total remaining: **92** (61 + 31)

## Verdict key

- `VERIFIED-with-ID` — exact title found in a primary source (ID given).
- `NO-SUPPORT-FOUND` — no exact-title hit in Crossref/OpenAlex/web; closest hits unrelated.
- `FABRICATED-LOOKING` — as above, plus the citation shape itself is not a real reference (pseudo-ID, bare venue, org-as-venue, or broken line).
- Action is one of: `replace-with-ID` (only the 3 verified rows) or `downgrade-to-heuristic` (all 92 others).

## Results table

| Metric | Reference as written | Venue tag | Verdict | Evidence (2026-10-10) | Action |
|---|---|---|---|---|---|
| A1 | *Quantifying Prompt Precision in Large Language Models* (ACL) | ACL | NO-SUPPORT-FOUND | Crossref top hit unrelated ("Quantifying Chaotic Semantic States…", TechRxiv); OpenAlex/web exact-phrase search: no paper | downgrade-to-heuristic |
| A2 | *Style Guides for Prompt Engineering* (arXiv:2502) | arXiv:2502 (month-only, not an ID) | FABRICATED-LOOKING | `arXiv:2502` is not a paper ID; Crossref/OpenAlex exact: none (top: "A Prompt Pattern Catalog…", arXiv:2302.11382) | downgrade-to-heuristic |
| A3 | *Ambiguity Indexing in Procedural Knowledge* (NeurIPS) | NeurIPS | NO-SUPPORT-FOUND | Crossref top: crystallography indexing paper; OpenAlex top: "The Evolution of Procedural Knowledge" (no match) | downgrade-to-heuristic |
| A4 | *Token Pruning and Structural Density in Prompting* (EMNLP) | EMNLP | NO-SUPPORT-FOUND | Crossref query error/429 then OpenAlex top "Token Pruning for In-Context Generation in Diffusion Transformers" (different paper); no exact hit | downgrade-to-heuristic |
| A6 | *Sentence Diversity Effects on Attention Maps* (CoNLL) | CoNLL | NO-SUPPORT-FOUND | Crossref top: aphasia sentence-processing paper; OpenAlex top: "Coherence-driven effects in sentence…" (no match) | downgrade-to-heuristic |
| A7 | *Consistency of Markdown Layouts on LayoutLM* (CVPR) | CVPR | FABRICATED-LOOKING | No exact hit (OpenAlex top: unrelated multimodal-extraction paper); markdown-linting is not a LayoutLM/CVPR topic | downgrade-to-heuristic |
| A8 | *Concreteness Effects in Zero-shot Reasoning* (ACL) | ACL | NO-SUPPORT-FOUND | No exact hit; OpenAlex top is an unrelated zero-shot-reasoning bias paper (ACL 2023, different title) | downgrade-to-heuristic |
| A9 | *Output Schema Alignment in LLM Pipelines* (NeurIPS) | NeurIPS | NO-SUPPORT-FOUND | No exact hit; OpenAlex top: "Game Knowledge Management System: Schema-Governed LLM Pipeline…" (different) | downgrade-to-heuristic |
| A10 | *Co-reference Resolution Failures in Long Prompt Contexts* (NAACL) | NAACL | NO-SUPPORT-FOUND | Crossref top "Co-reference Resolution in Prompt Engineering" (Procedia CS, different title); no exact hit | downgrade-to-heuristic |
| A11 | *Self-Contradiction in Prompt Instruct Tuned Models* (ACL) | ACL | NO-SUPPORT-FOUND | No exact hit; closest real work is "Self-contradictory Hallucinations of Large Language Models" (arXiv:2305.15852, different title/venue) | downgrade-to-heuristic |
| A12 | *Instruction Finetuning and Out-of-Distribution Vocabulary* (ICML) | ICML | NO-SUPPORT-FOUND | Crossref top: "Vocabulary Instruction" (encyclopedia entry); no exact hit | downgrade-to-heuristic |
| A13 | *Positivity Bias in Attention Masks* (ACL) | ACL | NO-SUPPORT-FOUND | Crossref top: encyclopedia "Positivity Bias"; no paper of this title | downgrade-to-heuristic |
| A14 | *Constrained Generation Limits* (ICLR) | ICLR | NO-SUPPORT-FOUND | Crossref top: power-systems trotz ("TRANSIENT STABILITY-CONSTRAINED PLANT GENERATION LIMITS"); no match | downgrade-to-heuristic |
| A15 | *Sequential Planning in Auto-regressive Models* (NeurIPS) | NeurIPS | NO-SUPPORT-FOUND | No exact hit; OpenAlex top: time-series diffusion paper (different) | downgrade-to-heuristic |
| B1 | *SkillsBench: Benchmarking How Well Agent Skills Work* (arXiv:2602.12670) | arXiv ID | VERIFIED-with-ID (MISAPPLIED) | Paper is real — fetched `arxiv.org/abs/2602.12670` 2026-10-10 (Li et al., Feb 2026, 87 tasks, benchmark). But nothing in it supports B1's token-friction quadratic formula; title/abstract are about paired Skills evaluation, not a 600–2000 token curve | replace-with-ID + strip support claim (formula → heuristic) |
| B2 | *Stopword Saturation in Large Context Windows* (arXiv) | bare arXiv | FABRICATED-LOOKING | Bare `(arXiv)` with no ID; OpenAlex top unrelated (AI-social-network paper); no exact hit | downgrade-to-heuristic |
| B3 | *Lost in the Middle: How Language Models Use Long Contexts* (Liu et al., 2023) | author+year | VERIFIED-with-ID | Real: arXiv:2307.03172, DOI 10.1162/tacl_a_00638, ACL Anthology 2024.tacl-1.9 (Liu et al.); Crossref exact-title match confirmed | replace-with-ID (arXiv:2307.03172) |
| B4 | *Structural Parsing Limits of Attention Mechanisms* (NIPS) | NIPS | NO-SUPPORT-FOUND | Crossref top: "Attention shifting for parsing speech" (2007, different); no exact hit | downgrade-to-heuristic |
| B5 | *Reference Resolution in Agent Multi-file Architectures* (NeurIPS) | NeurIPS | NO-SUPPORT-FOUND | Crossref top: "Organizational multi-agent architectures" (2002, different); no exact hit | downgrade-to-heuristic |
| B8 | *JSON Schema Validation in Agent Tool-use* (OWASP) | OWASP | FABRICATED-LOOKING | OWASP publishes Top-10/guides, not papers of this title; Crossref top is a book chapter on JSON Schema (different) | downgrade-to-heuristic |
| B9 | *State Tracking in Long-Context LLMs* (NeurIPS) | NeurIPS | NO-SUPPORT-FOUND | No exact hit; OpenAlex top: "Towards LLM-driven Dialogue State Tracking" (EMNLP 2023, different) | downgrade-to-heuristic |
| B11 | *Audit Logs in Agent Execution Trajectories* (IEEE) | IEEE | NO-SUPPORT-FOUND | No exact hit; OpenAlex top: "AgentRx: Diagnosing AI Agent Failures from Execution Trajectories" (different) | downgrade-to-heuristic |
| B12 | *State Checkpointing in Agent Workflows* (ACM) | ACM | NO-SUPPORT-FOUND | No exact hit; OpenAlex top: checkpoint/resume conformance paper (different) | downgrade-to-heuristic |
| B13 | *Token Bloat and Semantic Compression* (arXiv:2506) | arXiv:2506 (month-only) | FABRICATED-LOOKING | `arXiv:2506` is not a paper ID; exact-phrase web search returns only blogs/LinkedIn posts, no paper; Crossref top unrelated | downgrade-to-heuristic |
| B14 | *Information Bottlenecks in Transformer Layers* (ICML) | ICML | NO-SUPPORT-FOUND | Crossref top: "Transformer Layers as Painters" (AAAI, different); no exact hit | downgrade-to-heuristic |
| B15 | *Context Window Overflows in Agent Loop Architectures* (IEEE) | IEEE | NO-SUPPORT-FOUND | No exact hit; OpenAlex top: agentic-AI evaluation framework (different) | downgrade-to-heuristic |
| C3 | *Persona Hijacking in Multi-agent Systems* (ICML) | ICML | NO-SUPPORT-FOUND | No exact hit; closest are persona-persistence/multi-agent-hijacking papers with different titles (ICML 2026 posters, Trail of Bits) | downgrade-to-heuristic |
| C4 | *Safeguarding LLM Agent Outputs* (OWASP) | OWASP | FABRICATED-LOOKING | OWASP-as-paper-venue; no exact hit (Crossref top: "GUARDIAN: Safeguarding LLM Multi-Agent Collaborations…", different) | downgrade-to-heuristic |
| C5 | *Data Exfiltration Attacks in Tool-enabled LLMs* (arXiv) | bare arXiv | FABRICATED-LOOKING | Bare `(arXiv)`; Crossref top: DNS-exfiltration paper (different); no exact hit | downgrade-to-heuristic |
| C6 | *Privacy Guardrails in Prompt Templates* (ACM) | ACM | NO-SUPPORT-FOUND | No exact hit; OpenAlex top: visual prompt-injection guardrails paper (different) | downgrade-to-heuristic |
| C7 | *Secure Code Execution Guidelines for Agents* (USENIX) | USENIX | FABRICATED-LOOKING | Guidelines-style title is not a USENIX paper; OpenAlex top: "AgentBound: Securing Execution Boundaries of AI Agents" (different) | downgrade-to-heuristic |
| C8 | *Least Privilege Principle for LLM Tools* (arXiv) | bare arXiv | FABRICATED-LOOKING | Bare `(arXiv)`; OpenAlex top: "When Lower Privileges Suffice…" (different title) | downgrade-to-heuristic |
| C9 | *Enterprise Policy Compliance in Generative Agents* (IEEE) | IEEE | NO-SUPPORT-FOUND | Crossref top: "Leveraging Generative AI for Adaptive Compliance Workflows…" (different); no exact hit | downgrade-to-heuristic |
| C10 | *Prompt Sanitization Heuristics* (BlackHat) | BlackHat | FABRICATED-LOOKING | BlackHat-as-venue, no briefing ID; Crossref top: "Malicious Prompt Classifier… for Prompt Sanitization" (2026, different title) | downgrade-to-heuristic |
| C11 | *Self-Correcting Reasoning Loops* (ACL) | ACL | NO-SUPPORT-FOUND | No exact hit (Crossref 429 on retry; OpenAlex/web: no exact-title paper) | downgrade-to-heuristic |
| C12 | *API Endpoint Validation in Agent Systems* (NIPS) | NIPS | NO-SUPPORT-FOUND | Crossref top: "JScript and the REST Endpoint API" (book chapter, different); no exact hit | downgrade-to-heuristic |
| C13 | *Role-Based Access Control in LLMs* (ACM) | ACM | NO-SUPPORT-FOUND | No exact hit (Crossref 429 on retry; OpenAlex/web: no exact-title paper) | downgrade-to-heuristic |
| C14 | *Adversarial Override Defenses in LLM Agents* (ICLR) | ICLR | NO-SUPPORT-FOUND | Crossref top: Android-malware adversarial-agents paper (different); no exact hit | downgrade-to-heuristic |
| C15 | *Preventing Password Leakage in Agent Logs* (IEEE) | IEEE | NO-SUPPORT-FOUND | Crossref top: "Leakage Resilient Password Systems" (different); no exact hit | downgrade-to-heuristic |
| D1 | *Type Hallucinations in Tool Selection* (ICSE) | ICSE | FABRICATED-LOOKING | No exact hit (Crossref 429; OpenAlex/web: none); ICSE-venue claim with no proceedings ID | downgrade-to-heuristic |
| D2 | *JSON Schema Validation in OpenAPI Specifications* (W3C) | W3C | FABRICATED-LOOKING | W3C publishes standards, not papers of this title; Crossref top is the same unrelated JSON-Schema book chapter as B8 | downgrade-to-heuristic |
| D3 | *Descriptive Parameter Mismatches in Tool Use* (ACL) | ACL | NO-SUPPORT-FOUND | No exact hit (Crossref 429 on retry; OpenAlex/web: none) | downgrade-to-heuristic |
| D4 | *Parallel Execution Conflicts in Multi-Tool Agents* (arXiv) | bare arXiv | FABRICATED-LOOKING | Bare `(arXiv)`; Crossref top: parallel-simulation conflict paper from 2015 (different) | downgrade-to-heuristic |
| D5 | *Handling Rate Limits in Autonomous Workflows* (ACM) | ACM | NO-SUPPORT-FOUND | No exact hit (Crossref 429 on retry; OpenAlex/web: none) | downgrade-to-heuristic |
| D6 | *Robustness of Agent Tool Call Trajectories* (NIPS) | NIPS | NO-SUPPORT-FOUND | No exact hit (Crossref 429 on retry; OpenAlex/web: none) | downgrade-to-heuristic |
| D7 | *Structured Output Extraction in Agent Libraries* (arXiv) | bare arXiv | FABRICATED-LOOKING | Bare `(arXiv)`; Crossref top: "Structured Output Prediction" (different) | downgrade-to-heuristic |
| D8 | *Heuristics for Tool Selection under Large Context* (ICML) | ICML | NO-SUPPORT-FOUND | Crossref top: "Heuristics in context" (psychology, different); no exact hit | downgrade-to-heuristic |
| D9 | *Encoding Mismatches in Network Tools* (USENIX) | USENIX | FABRICATED-LOOKING | No exact hit; USENIX-venue claim with no paper ID | downgrade-to-heuristic |
| D10 | *DAG Execution Planners in Generative Agents* (VLDB) | VLDB | FABRICATED-LOOKING | No exact hit; OpenAlex top: DAG-orchestrated QA paper (different); VLDB-venue claim with no ID | downgrade-to-heuristic |
| D11 | *Fail-Safe Mechanisms in Autonomous LLM Systems* (IEEE) | IEEE | NO-SUPPORT-FOUND | OpenAlex top: autonomous-vehicle self-protection review (different); no exact hit | downgrade-to-heuristic |
| D12 | *API Schema Drifts in Autonomous Agents* (OWASP) | OWASP | FABRICATED-LOOKING | OWASP-as-paper-venue; OpenAlex top: API test-generation paper (different) | downgrade-to-heuristic |
| D13 | *Network Resource Optimization in LLM Pipelines* (ACM) | ACM | NO-SUPPORT-FOUND | OpenAlex top: GNN–LLM pipeline paper (different); no exact hit | downgrade-to-heuristic |
| D14 | *Asynchronous Tool Invocation Protocols* (IEEE) | IEEE | NO-SUPPORT-FOUND | OpenAlex top: HTTP-async-monitoring web tool (different); no exact hit | downgrade-to-heuristic |
| D15 | *Memory Leak Protections in Agent Kernels* (ACM) | ACM | NO-SUPPORT-FOUND | OpenAlex top: kernel memory-protection paper from 2020 (different); no exact hit | downgrade-to-heuristic |
| E1 | *Defensive Prompting: Preventing Failure Modes* (NIPS) | NIPS | NO-SUPPORT-FOUND | OpenAlex top: chatbot prompt-injection paper (different); no exact hit | downgrade-to-heuristic |
| E2 | *Halting Problems in Autonomous Agent Reasoning* (ICML) | ICML | NO-SUPPORT-FOUND | OpenAlex top: frame/halting-problems equivalence (different); no exact hit | downgrade-to-heuristic |
| E3 | *Self-Healing Protocols in Code Generation* (EMNLP) | EMNLP | NO-SUPPORT-FOUND | OpenAlex top: self-healing multi-agent code-gen framework (different title); no exact hit | downgrade-to-heuristic |
| E4 | *Resilience in Agentic Planning* (NeurIPS) | NeurIPS | NO-SUPPORT-FOUND | OpenAlex top: human-agent planning for resilience (different); no exact hit | downgrade-to-heuristic |
| E5 | *Error Recovery Vectors in Transformer Prompts* (ACL) | ACL | NO-SUPPORT-FOUND | OpenAlex top: crystalline-materials transformers (different); no exact hit | downgrade-to-heuristic |
| E6 | *Interactive Query Clarification in LLMs* (SIGIR) | SIGIR | FABRICATED-LOOKING | No exact hit; OpenAlex top: STL-clarification agent framework (different); SIGIR-venue claim with no ID | downgrade-to-heuristic |
| E7 | *Virtual Machine State Checks in Code Interpreters* (USENIX) | USENIX | FABRICATED-LOOKING | No exact hit; OpenAlex top: interpreter-to-VM functional derivation (different) | downgrade-to-heuristic |
| E8 | *Diagnostic Tracing Protocols in Generative AI* (ACM) | ACM | NO-SUPPORT-FOUND | OpenAlex top: generative-AI-in-education paper (different); no exact hit | downgrade-to-heuristic |
| E9 | *Inference Cost Caps in Agent Loops* (IEEE) | IEEE | NO-SUPPORT-FOUND | OpenAlex top: multi-agent inference-cost paper (different title); no exact hit | downgrade-to-heuristic |
| E11 | *Property-Based Testing of LLM Outputs* (ICSE) | ICSE | FABRICATED-LOOKING | Closest is a Zenodo preprint "Property-Based Testing for LLM Outputs: Hypothesis Strategies…" (different title, not ICSE); no ICSE proceedings entry | downgrade-to-heuristic |
| E12 | *Distraction Resistance in Autoregressive Models* (ACL) | ACL | NO-SUPPORT-FOUND | OpenAlex top: driver-distraction thesis (different); no exact hit | downgrade-to-heuristic |
| E13 | *Runtime Assertion Guarantees in Prompt Executions* (NeurIPS) | NeurIPS | NO-SUPPORT-FOUND | OpenAlex top: LLM-debugger paper (ACL Findings 2024, different); no exact hit | downgrade-to-heuristic |
| E14 | *Multi-Objective Optimizations in System Prompts* (ICLR) | ICLR | NO-SUPPORT-FOUND | OpenAlex top: FairPrompt multi-objective paper (different); no exact hit | downgrade-to-heuristic |
| E15 | *Hallucination Cycles in Self-Refining Loops* (arXiv) | bare arXiv | FABRICATED-LOOKING | Bare `(arXiv)`; OpenAlex top: self-reflection hallucination paper (EMNLP Findings 2023, different) | downgrade-to-heuristic |
| F2 | *Token Redundancy and Response Compactness* (EMNLP) | EMNLP | NO-SUPPORT-FOUND | OpenAlex top: visual-token-pruning paper (different); no exact hit | downgrade-to-heuristic |
| F3 | *Information Compression in Prompt Engineering* (ICML) | ICML | NO-SUPPORT-FOUND | OpenAlex top: "Prompt Engineering" (different); no exact hit | downgrade-to-heuristic |
| F4 | *Early Exit Mechanisms in Long Context Reasoning* (NeurIPS) | NeurIPS | NO-SUPPORT-FOUND | OpenAlex top: FlashThink early-exit reasoning (different title); no exact hit | downgrade-to-heuristic |
| F5 | *Optimizing Prompt Cache Hits in LLM APIs* (ACM) | ACM | NO-SUPPORT-FOUND | OpenAlex top: prompt-cache-isolation paper (different); no exact hit | downgrade-to-heuristic |
| F6 | *Throughput Optimization in Agent Operations* (IEEE) | IEEE | NO-SUPPORT-FOUND | OpenAlex top: NR-TDD throughput paper (different); no exact hit | downgrade-to-heuristic |
| F7 | *Prompt Compression Algorithms for Long History* (arXiv) | bare arXiv | FABRICATED-LOOKING | Bare `(arXiv)`; OpenAlex top: 2022 EMNLP Findings controllability paper (different) | downgrade-to-heuristic |
| F8 | *Intermediate State Sharing in Agent Chains* (NeurIPS) | NeurIPS | NO-SUPPORT-FOUND | OpenAlex top: supply-chain risk paper (different); no exact hit | downgrade-to-heuristic |
| F9 | *Cost-Efficient Model Cascades in Agent Pipelines* (ACM) | ACM | NO-SUPPORT-FOUND | OpenAlex top: LLM cascades with mixture-of-thoughts (different title); no exact hit | downgrade-to-heuristic |
| F10 | *Eliminating Redundant Thoughts in Tree of Thoughts* (ACL) | ACL | NO-SUPPORT-FOUND | OpenAlex top: chains/trees/graphs-of-thoughts survey (different); no exact hit | downgrade-to-heuristic |
| F12 | *Cost of Markdown Decoration Tokens in LLM Decoding* (arXiv) | bare arXiv | FABRICATED-LOOKING | Bare `(arXiv)`; OpenAlex top unrelated (computer-environment agents); no exact hit | downgrade-to-heuristic |
| F13 | *High-Frequency Token Steering in Instruct Models* (NAACL) | NAACL | NO-SUPPORT-FOUND | OpenAlex top: sycophancy-steering paper (different); no exact hit | downgrade-to-heuristic |
| F14 | *Batch Inference vs Interactive Chat Execution* (IEEE) | IEEE | NO-SUPPORT-FOUND | OpenAlex top: multi-bin batching paper (different); no exact hit | downgrade-to-heuristic |
| F15 | *Lazy Computations in Large Language Agents* (ACM) | ACM | NO-SUPPORT-FOUND | OpenAlex top: lazy agents in EBG language (different); no exact hit | downgrade-to-heuristic |
| G1 | *Structured Metadata in ## Dimensions H through Z: Advanced Agentic Calculations* (truncated, no venue) | none (broken line) | FABRICATED-LOOKING | Line 464 is truncated mid-sentence and bleeds into the H–Z heading; not a reference at all | downgrade-to-heuristic (delete line) |
| G2 | *Package Spec Schema Validation Protocols* (IEEE) | IEEE | NO-SUPPORT-FOUND | OpenAlex top: XFSP schema protocol for virtual environments (different); no exact hit | downgrade-to-heuristic |
| G3 | *Document Structural Parsers in Layout Analysis* (CVPR) | CVPR | NO-SUPPORT-FOUND | OpenAlex top: layout-interface parser paper (different); no exact hit | downgrade-to-heuristic |
| G4 | *Markdown Parser Sanity Standards* (W3C) | W3C | FABRICATED-LOOKING | W3C-as-venue for a "sanity standards" paper; OpenAlex top unrelated (agentic-skill algebra); no exact hit | downgrade-to-heuristic |
| G5 | *Syntax Highlighter Parsers for Source Files* (ACM) | ACM | NO-SUPPORT-FOUND | OpenAlex top: Kamailio config parser (different); no exact hit | downgrade-to-heuristic |
| G6 | *Hyperlink Integrity on Version Controlled Markdown* (IEEE) | IEEE | NO-SUPPORT-FOUND | OpenAlex top unrelated (peer-review report); no exact hit | downgrade-to-heuristic |
| G7 | *Information Redundancy in Semantic Structures* (ACL) | ACL | NO-SUPPORT-FOUND | OpenAlex top: semantic-segmentation pruning paper (different); no exact hit | downgrade-to-heuristic |
| G8 | *HTML Entity Parsers and Escape Vulnerabilities* (OWASP) | OWASP | FABRICATED-LOOKING | OWASP-as-paper-venue; OpenAlex top: HTML-parser-quirks fingerprinting (different) | downgrade-to-heuristic |
| G9 | *Markdown Formatting Linters standards* (W3C) | W3C | FABRICATED-LOOKING | W3C-as-venue for a linter paper (lowercase "standards" typo included); no exact hit | downgrade-to-heuristic |
| G10 | *Character Encoding Security and Robustness* (RFC 3629) | RFC 3629 | VERIFIED-with-ID | RFC 3629 is the real UTF-8 standard ("UTF-8, a transformation format of ISO 10646"); ID already present | replace-with-ID (keep as-is; already an ID) |
| G12 | *Grammatical Parsing Integrity of Markdown Templates* (ACL) | ACL | NO-SUPPORT-FOUND | OpenAlex top: Chinese-grammar knowledge graphs (different); no exact hit | downgrade-to-heuristic |
| G13 | *Visual Density and Attention Allotment in Prompt Layouts* (CHI) | CHI | FABRICATED-LOOKING | No exact hit; OpenAlex top is an allotment-history thesis (different); CHI-venue claim with no ID | downgrade-to-heuristic |
| G14 | *Secure Documentation Practices in Version Control* (USENIX) | USENIX | FABRICATED-LOOKING | No exact hit; OpenAlex top: Java secure-coding paper (different); USENIX-venue claim with no ID | downgrade-to-heuristic |
| G15 | *Parsing Structural Hierarchy in Autoregressive Models* (EMNLP) | EMNLP | NO-SUPPORT-FOUND | OpenAlex top: semi-autoregressive dependency parsing (ACL Findings 2023, different); no exact hit | downgrade-to-heuristic |

## Recommended per-item action (summary)

- `replace-with-ID` (3): B3 → cite `arXiv:2307.03172` (Liu et al.; TACL 2024, DOI 10.1162/tacl_a_00638); B1 → keep `arXiv:2602.12670` as related work but remove it as support for the token-friction formula (formula becomes `heuristic`); G10 → keep `(RFC 3629)` (already a valid ID).
- `downgrade-to-heuristic` (92): every other row in the table — replace the `*Title* (Venue)` line with `heuristic` (or `heuristic; <one-line rationale>`), matching the convention already used by A5/B6/B7/B10/C1/C2/E10/F1/F11/G11; G1's broken line should be deleted or replaced with `heuristic`.
- Note: dimensions H–Z carry no `Reference` lines at all (description + formula only) — nothing to verify there.

## Method note (repro)

- Crossref: `GET https://api.crossref.org/works?query.title=<exact title>&rows=1..2&select=title,DOI,score`; verdict requires case-insensitive full-title equality with the top hit. All checked titles returned either a clearly unrelated top hit or HTTP 429 on retry (re-checked via OpenAlex); none returned an exact match.
- OpenAlex: `GET https://api.openalex.org/works?search=<exact title>&per-page=1&select=title,doi,relevance_score`; same equality test. All 90+ queried titles: `exact: false`.
- Primary-source spot checks: `arxiv.org/abs/2602.12670` (SkillsBench, exists, content mismatch with B1); `arxiv.org/abs/2307.03172` + `aclanthology.org/2024.tacl-1.9` (Lost in the Middle, exists); exact-phrase web searches for "Quantifying Prompt Precision…", "Token Bloat and Semantic Compression", "Self-Contradiction in Prompt Instruct Tuned Models", "Persona Hijacking in Multi-agent Systems" returned no matching paper.
- Limitation: 429s from Crossref on some queries (rate limiting); every such title was re-checked via OpenAlex with the same `exact: false` outcome, so no verdict rests on a single failed request.
