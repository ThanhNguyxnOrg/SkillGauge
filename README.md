# 🏆 SkillGauge: Agent Skills Leaderboard & Scientific Auditor

**SkillGauge** is an automated static auditing engine and leaderboard platform for agentic process instructions (such as Anthropic-style `SKILL.md` or `.agent/skills/` files). 

Instead of evaluating AI agent executions dynamically (which is expensive and non-deterministic), **SkillGauge** audits the structural quality, safety, and operational economy of skill prompts directly through a strict **100-criteria scientific matrix**.

---

## ⭐️ Top Agent Skills Leaderboard

The ranking table below is dynamically managed by the CI runner. Submissions are sorted by their overall audited scores.

<!-- LEADERBOARD_START -->

| Rank 🏆 | Skill Name 📦 | Repository 🏠 | Tier 🏷️ | Score ⭐️ | Author 👤 |
| --- | --- | --- | --- | --- | --- |
| 🏆 1 | `Math Solver` | `SkillGauge` | 🟡 **Tier 2** | **65.824** | @ThanhNguyxnOrg |
| 🥈 2 | `writing-skills` | `SkillGauge` | 🟡 **Tier 2** | **60.583** | @obra |
| 🥉 3 | `requesting-code-review` | `SkillGauge` | 🟡 **Tier 2** | **60.381** | @obra |
| 4 | `using-git-worktrees` | `SkillGauge` | 🟡 **Tier 2** | **60.341** | @obra |
| 5 | `verification-before-completion` | `SkillGauge` | 🟡 **Tier 2** | **60.244** | @obra |
| 6 | `executing-plans` | `SkillGauge` | 🟡 **Tier 2** | **60.219** | @obra |
| 7 | `receiving-code-review` | `SkillGauge` | 🟡 **Tier 2** | **60.079** | @obra |
| 8 | `finishing-a-development-branch` | `SkillGauge` | 🔴 **Tier 3** | **59.770** | @obra |
| 9 | `dispatching-parallel-agents` | `SkillGauge` | 🔴 **Tier 3** | **59.369** | @obra |
| 10 | `writing-plans` | `SkillGauge` | 🔴 **Tier 3** | **58.645** | @obra |
| 11 | `subagent-driven-development` | `SkillGauge` | 🔴 **Tier 3** | **58.228** | @obra |
| 12 | `systematic-debugging` | `SkillGauge` | 🔴 **Tier 3** | **58.199** | @obra |
| 13 | `test-driven-development` | `SkillGauge` | 🔴 **Tier 3** | **58.050** | @obra |
| 14 | `using-superpowers` | `SkillGauge` | 🔴 **Tier 3** | **57.853** | @obra |
| 15 | `brainstorming` | `SkillGauge` | 🔴 **Tier 3** | **57.321** | @obra |

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
