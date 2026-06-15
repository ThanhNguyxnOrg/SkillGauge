# SkillGauge Multi-File & Directory Package Auditing Specification

This document extends the Core Engine specification to support multi-file skill packages, repositories, and directories containing interlinked skill configurations (e.g., `.md` skills, JSON/YAML tools, and prompt definitions).

---

## 1. Concept of a "Skill Package"

In production agent environments, a single agent is rarely defined by one file. Instead, an agent skill set is typically packed as a folder containing:
1.  **Main Entrypoints (`SKILL.md`)**: The core procedural instruction files.
2.  **Tool Definitions (`tools/*.json` or `tools/*.yaml`)**: Model Context Protocol (MCP) schemas detailing tools available to the agent.
3.  **Prompt Templates (`prompts/*.json`)**: Structured prompts called dynamically.
4.  **Resources (`resources/*`)**: Context files, documents, and reference payloads.

```
/my-agent-skills (Package Root)
  ├── SKILL.md (Entrypoint instruction)
  ├── tools/
  │    ├── query_db.json (MCP tool definition)
  │    └── run_script.yaml
  ├── prompts/
  │    └── template.json (Prompt template)
  └── resources/
       └── lookup_table.csv (Context payload)
```

---

## 2. Relational & Package-Level Auditing Metrics

When scanning a folder, SkillGauge performs **Package-Level Auditing** with three core relational metrics:

### 2.1 Reference Integrity Score ($S_{integrity}$)
Validates that all external dependencies, scripts, tools, and prompts referenced in the Markdown instructions actually exist within the package.
*   **Heuristics**:
    *   Find relative links `[label](relative/path/to/file)` inside markdown files.
    *   Find references to MCP tools by name, e.g., "use `run_script` tool".
    *   Verify if the target files/tools exist in the scanned directory.
*   **Formula**:
    $$S_{integrity} = 1.0 - \frac{N_{broken\_references}}{N_{total\_references} + \epsilon}$$
    *(where $\epsilon = 0.0001$; if no references are present, $S_{integrity} = 1.0$)*

### 2.2 Redundancy & Duplication Penalty ($P_{redundancy}$)
Measures instruction overlap across multiple skill files. Re-stating identical rules in different files wastes the context window (Token Friction) when multiple skills are loaded.
*   **Heuristics**:
    *   Calculates Jaccard Similarity of sentences or lines across all `.md` files.
    *   Let $D$ be the ratio of duplicated lines/paragraphs across different files (lines that appear in more than one `.md` file, excluding headers).
*   **Formula**:
    $$P_{redundancy} = 1.0 - D^2$$

### 2.3 Package Cohesion Score ($S_{package\_cohesion}$)
Checks if the folder contains a focused set of capabilities, rather than a monolithic dumping ground of unrelated tasks.
*   **Heuristics**:
    *   Compare the names and descriptions of tools and prompts.
    *   Check directory structure depth. Deeply nested, disorganized folders decrease this score.
*   **Formula**:
    $$S_{package\_cohesion} = \max\left(0.1, 1.0 - 0.1 \times N_{unreferenced\_files}\right)$$
    *(where $N_{unreferenced\_files}$ is the count of resources/tools in the folder that are never linked/called in the main instructions)*

---

## 3. Aggregate Package Score ($S_{package}$)

The final score for the entire directory is computed by combining the average score of all individual files with the package-level relational metrics:

$$S_{package} = \left( \frac{1}{N} \sum_{i=1}^{N} S_{overall, i} \right) \times S_{integrity} \times P_{redundancy} \times S_{package\_cohesion}$$

Where:
*   $N$ is the number of main skill files (`.md` or `.json` prompt files).
*   $S_{overall, i}$ is the individual score of the $i$-th file calculated using the 9 core metrics.

---

## 4. Implementation Steps in `core` and `cli`

### 4.1 Core Package Extension (`packages/core/src/packageEngine.ts`)
*   Create a `parsePackage(directoryPath: string)` function that recursively scans the folder.
*   Maps all files to their types (Skill, Tool, Prompt, Resource).
*   Runs cross-file analysis to detect links and check reference integrity.
*   Applies sentence-matching to detect line duplication.

### 4.2 CLI Extension
Modify the `skillgauge audit` command to support directory inputs:
*   `skillgauge audit ./packages/my-agent-skills/`
    *   Detects if the input is a directory.
    *   Runs the package-level auditor.
    *   Prints a consolidated report summarizing individual file scores, broken references, redundant instructions, and the final package tier.
