# 🏆 SkillGauge: Agent Skills Leaderboard & Scientific Auditor

**SkillGauge** is an automated static auditing engine and leaderboard platform for agentic process instructions (such as Anthropic-style `SKILL.md` or `.agent/skills/` files). 

Instead of evaluating AI agent executions dynamically (which is expensive and non-deterministic), **SkillGauge** audits the structural quality, safety, and operational economy of skill prompts directly through a strict **100-criteria scientific matrix**.

---

## ⭐️ Top Agent Skills Leaderboard

The live ranking table is dynamically managed and updated on our web dashboard:

👉 **[View the Live Leaderboard](https://thanhnguyxnorg.github.io/SkillGauge/)**

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
   Detailed guide on how the modular, split GitHub Actions workflows (`submit-repo-bot.yml`, `pr-verification.yml`, `update-leaderboard.yml`, `deploy-pages.yml`) orchestrate automated scan-and-submit tasks and post-merge optimizations.

---

## 🚀 How to Submit a Skill

Submitting your agent skills to the global leaderboard is incredibly simple and requires no login:

1. **Via Web Dashboard (Recommended)**:
   * Navigate to the **Submit Skill** tab on the live dashboard.
   * Paste your GitHub repository URL (e.g., `https://github.com/owner/my-agent-skills`).
   * Click **Submit**. The backend will trigger a background Action that clones your repository, audits all valid skills, and opens a Pull Request on your behalf.
   * Follow the live Pull Request link returned by the website to view your detailed score report!

2. **Via Manual Pull Request**:
   * Place your markdown skill files (which must start with YAML frontmatter containing `name:` and `description:`) in a folder named `skills/<your-repo-name>/<skill-name>.md`.
   * Open a Pull Request against the `main` branch.
   * Our verification runner will automatically check for duplicate entries, score your skill against the 100-criteria scientific matrix, and comment with a detailed report card.

---

## 📁 Repository Structure
```
skills/
├── [repository-name]/
│   ├── [skill-name].md
│   └── SKILL.md
```
* **Repository Detection**: The CLI parses the repository name from the subdirectory (e.g. `skills/superpowers/brainstorm.md` -> repository `superpowers`). For Git targets, the repo name is extracted directly from the repository URL.
* **Leaderboard Name Format**: Entry names are rendered as clean skill names (e.g. `brainstorm`), and their origin repositories are displayed in the dedicated "Repository" column.
