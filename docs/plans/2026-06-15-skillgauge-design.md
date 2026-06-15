# Design Document: SkillGauge Core Engine

## 1. Executive Summary
**SkillGauge** is an automated auditing, quantitative evaluation, and multi-criteria tier-ranking platform for agent skill configuration files (such as `.md`, JSON, YAML, and MCP-Definitions). 

Instead of evaluating the AI agent's execution dynamically, SkillGauge statically audits the skill file's structure, payload, and instructions to ensure maximum performance and economic efficiency. It acts as a gatekeeper to prevent "skill bloat" (where overly detailed documentation degrades performance, as benchmarked by *SkillsBench (2026)*). It also provides an automated optimizer inspired by *AutoPDL (2025)* to compress and refine sub-optimal skills into Tier 1 assets.

---

## 2. Core Architecture & Monorepo Design
SkillGauge uses an npm workspaces monorepo structure to isolate the platform-independent core logic from the execution environment wrappers.

```
/brainstorm (root)
  ├── package.json (monorepo config)
  ├── docs/
  │    └── plans/
  │         ├── task.md (tracking file)
  │         ├── 2026-06-15-core-calculation-spec.md (calculations specification)
  │         └── 2026-06-15-skillgauge-design.md (this document)
  └── packages/
       ├── core/  (Pure TypeScript library for auditing and optimization)
       ├── cli/   (Node.js CLI executable wrapper)
       └── web/   (Vite React frontend - deferred to USER)
```

### 2.1 Dependencies
*   `packages/core`:
    *   `js-tiktoken` (estimating token count client-side and server-side).
    *   `yaml` (parsing YAML frontmatter or MCP configuration files).
*   `packages/cli`:
    *   `commander` (CLI argument parsing).
    *   `chalk` (terminal color styling).
    *   `glob` (file pattern matching).

---

## 3. Core Engine Specification (`packages/core`)
The core package is completely decoupled from Node's `fs` module, accepting plain strings or file buffers. This allows it to run natively in both Web browsers (via HTML5 FileReader) and the CLI.

### 3.1 Auditing Workflow
1.  **Read & Parse**: Identify format (Markdown vs. JSON/YAML) and parse the contents.
2.  **Evaluate Metrics**: Run the 9 scoring rules (Efficacy, Token Friction, Compactness, Guardrails, Schema Clarity, Semantic Cohesion, Ambiguity Index, State Overhead, and Security Protection).
3.  **Tier Assignment**: Compute the multiplicative product $S_{overall}$. Assign the tier based on $S_{overall}$:
    *   **Tier 1 (Optimal Pack)**: $S_{overall} \ge 0.85$
    *   **Tier 2 (Sub-optimal)**: $0.60 \le S_{overall} < 0.85$
    *   **Tier 3 (Risky)**: $S_{overall} < 0.60$
4.  **Reporting**: Output a structured JSON audit report detailing the scores, triggering lines/keywords, and optimization recommendations.

---

## 4. CLI Specification (`packages/cli`)
The CLI provides developer-friendly integration for terminal audits and CI/CD pipelines.

### 4.1 CLI Commands
*   `skillgauge audit <path_to_file_or_glob>`: Audits specified files and prints a formatted report to stdout.
    *   *Options*: `--format <json|table|pretty>`, `--fail-under <tier>` (e.g. `--fail-under 2` returns a non-zero exit code if any file is Tier 2 or 3, perfect for CI/CD checks).
*   `skillgauge optimize <path_to_file>`: Invokes the AutoPDL compressor.
    *   *Options*: `--api-key <key>`, `--provider <gemini|openai>`.

---

## 5. AutoPDL Compressor Specification
The compressor module inside `core` optimizes sub-optimal skills:
1.  **Candidate Rewrites**: Prompts a lightweight cloud LLM to generate 4 variations of the original instructions, stripping verbose explanations and flattening nested lists.
2.  **Successive Halving**: Performs static audit scores on the 4 candidates. Discards the 2 lowest-scoring candidates.
3.  **Semantic Similarity Validation**: Prompts the LLM to rate the semantic coverage of the remaining 2 candidates.
4.  **Result**: Outputs the best candidate, showing a `diff` visualization of the compressed vs. original prompt along with estimated token/cost savings.

---

## 6. Next Steps & Transitions
1.  **Obtain User Design Approval**: Present this design document to the user for sign-off.
2.  **Write Implementation Plan**: Create a task list using the `writing-plans` skill.
3.  **Core Development**: Build `packages/core` (parsers, scorers, optimizer).
4.  **CLI Development**: Build `packages/cli` wrapper.
5.  **UI Handover**: Notify the user and hand over the core library for their React frontend integration.
