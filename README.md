# 🏆 SkillGauge: Agent Skills Leaderboard & Scientific Auditor

**SkillGauge** is an automated static auditing engine and leaderboard platform for agentic process instructions (such as Anthropic-style `SKILL.md` or `.agent/skills/` files). 

Instead of evaluating AI agent executions dynamically (which is expensive and non-deterministic), **SkillGauge** audits the structural quality, safety, and operational economy of skill prompts directly through a strict **100-criteria scientific matrix**.

---

## ⭐️ Top Agent Skills Leaderboard

The ranking table below is dynamically managed by the CI runner. Submissions are sorted by their overall audited scores.

<!-- LEADERBOARD_START -->
<!-- LEADERBOARD_END -->

---

## 📖 Documentation Directory

To learn more about the scientific methodology, CLI commands, and automated pipelines, please check the detailed guides:

1. **[Scientific Specification](docs/scientific_metrics.md)**
   Detailed formulas, quality tier divisions, and academic whitepaper references for each of the 100 criteria across the 7 dimensions:
   * **Dim A:** Instruction Quality & Clarity
   * **Dim B:** Context & Memory Management
   * **Dim C:** Safety, Alignment & Security
   * **Dim D:** Tool-Use & MCP Clarity
   * **Dim E:** Robustness & Exception Handling
   * **Dim F:** Operational & Inference Economy
   * **Dim G:** Syntax, Structure & Metadata

2. **[CLI Usage Guide](docs/cli_usage.md)**
   How to install, compile, and run the CLI for local files, directories, or remote Git targets using either HTTPS links or `owner/repo` shorthand notation.

3. **[GitHub Actions CI Bot](docs/ci_pipeline.md)**
   How the serverless pipeline automatically performs validation, anti-spam duplicate checks, prompt optimization, and publishes results back to the leaderboard.

---

## 📁 Repository Structure
```
skills/
├── [repository-name]/
│   ├── [skill-name].md
│   └── SKILL.md
```
* **Repository Detection**: The CLI parses the repository name from the subdirectory (e.g. `skills/superpowers/brainstorm.md` -> repository `superpowers`). For Git targets, the repo name is extracted directly from the repository URL.
* **Leaderboard Name Format**: Entry names are rendered as `[Repository] - [Skill Name]` (e.g., `superpowers - brainstorm`).
