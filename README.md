# 🏆 SkillGauge: Agent Skills Leaderboard & Scientific Auditor

Welcome to **SkillGauge**, a highly strict, multi-stage static auditing engine and leaderboard platform for agentic process instructions (such as Anthropic-style `SKILL.md` files).

SkillGauge statically parses and grades agent skills across **100 scientific criteria** derived from prompt engineering and LLM evaluation literature, ensuring high-quality, robust, safe, and cost-effective agent behaviors.

---

## ⭐️ Top Agent Skills Leaderboard

<!-- LEADERBOARD_START -->
<!-- LEADERBOARD_END -->

---

## 🔬 Scientific Evaluation Engine

The core evaluation framework groups the 100 criteria into 7 dimensions. Individual scores are calculated out of a maximum of 100.00 points without arbitrary rounding to preserve precise rankings.

1. **Dimension A: Instruction Quality & Clarity (15 Metrics)**: Evaluates passive voice usage,Qualifier ambiguity, imperative verb density, and readability indexes.
2. **Dimension B: Context & Memory Management (15 Metrics)**: Audits nested depth limits, information density, lost-in-the-middle parabolic curves, and token footprints.
3. **Dimension C: Safety, Alignment & Security (15 Metrics)**: Validates prompt injection shields, system instruction protection, exfiltration defenses, and log obfuscation.
4. **Dimension D: Tool-Use & MCP Clarity (15 Metrics)**: Evaluates type specifications of parameter schemas, required field specs, parallel call rules, and rate limits.
5. **Dimension E: Robustness & Exception Handling (15 Metrics)**: Grades exit strategies, error-catching guidelines, retry budgets, and state recovery flows.
6. **Dimension F: Operational & Inference Economy (15 Metrics)**: Targets CoT loop prevention, output verbosity control, computation reuse, and model routing.
7. **Dimension G: Syntax, Structure & Metadata (10 Metrics)**: Audits frontmatter integrity, hierarchical jumps, code block language specifications, and UTF-8 encoding.

For details on the mathematical formulations and academic literature of each scorer, see [docs/scientific_metrics.md](docs/scientific_metrics.md).

### 🏷️ Quality Tiers
*   **Tier 1 (Optimal Pack):** $\text{Score} \ge 85.00$. High quality, safe, fully typed, resilient, and ready for production agent systems.
*   **Tier 2 (Sub-optimal):** $60.00 \le \text{Score} < 85.00$. Solid instructions but lacks advanced safety guardrails or tool specs.
*   **Tier 3 (Risky):** $\text{Score} < 60.00$. Ambiguous, overly verbose, or structurally malformed prompts.

---

## 📁 Submissions Folder Structure

To support continuous evaluation (where skill files are dynamically re-audited and updated when metrics or tests evolve), contributions are grouped by repository/project subfolders:
```
skills/
├── [repository-name]/
│   ├── [skill-name].md
│   └── SKILL.md
```
- **Repository Detection**: The CLI automatically parses the repository name from the folder layout (e.g. `skills/superpowers/brainstorm.md` resolves to repository `superpowers`).
- **Leaderboard Name**: Entry names are rendered as `[Repository] - [Skill Name]` (e.g. `superpowers - brainstorm`).

---

## 🛠️ CLI Usage

SkillGauge features a monorepo client-side tool. Compile the project with `npm run build` and use the following commands:

### 1. Audit Skills
Runs the evaluation on files, directories, or globs:
```bash
# Pretty-print grouped dimension scores
node packages/cli/dist/index.js audit "skills/**/*.md"

# Verbose mode (displays all 100 individual scores)
node packages/cli/dist/index.js audit "skills/**/*.md" -v
```

### 2. Duplicate Check (Anti-Spam)
Checks for clashing submissions against the database using content hashes (SHA-256) and resolved names (`[Repository] - [Skill Name]`):
```bash
node packages/cli/dist/index.js check-duplicate --target "skills/**/*.md" --db "leaderboard.json"
```

### 3. Update Leaderboard
Statically audits target files, checks duplicates, updates the JSON database, and injects the sorted table into the README:
```bash
node packages/cli/dist/index.js update-leaderboard --target "skills/**/*.md" --db "leaderboard.json" --readme "README.md" --author "username"
```

### 4. Optimize Skill
Applies heuristics to automatically compress, structure, and improve the quality tier of a skill file:
```bash
node packages/cli/dist/index.js optimize "skills/**/*.md"
```

---

## 🤖 GitHub Actions CI Pipeline
We provide a serverless workflow at `.github/workflows/leaderboard-bot.yml` that runs on every pull request targeting `skills/**/*.md`:
1. Runs `check-duplicate` to prevent spam/duplicate PRs.
2. Runs `audit` and logs a step summary.
3. Automatically runs `optimize` to improve the skill.
4. Updates `leaderboard.json` and injects the sorted markdown table back into `README.md`.
5. Merges and pushes the updates back to `main`.
