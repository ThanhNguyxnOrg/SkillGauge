# 🏆 SkillGauge: Agent Skills Leaderboard & Scientific Auditor

**SkillGauge** is an automated static auditing engine and leaderboard platform for agentic process instructions (such as Anthropic-style `SKILL.md` or `.agent/skills/` files). 

Instead of evaluating AI agent executions dynamically (which is expensive and non-deterministic), **SkillGauge** audits the structural quality, safety, and operational economy of skill prompts directly through **390 static signals (26 dimensions × 15)**. Scores are a cheap community-linter reference, not a measure of task success.

---

## ⭐️ Top Agent Skills Leaderboard

The live ranking table is dynamically managed and updated on our web dashboard:

👉 **[View the Live Leaderboard](https://thanhnguyxnorg.github.io/SkillGauge/)**

<!-- LEADERBOARD_START -->

| Rank 🏆 | Skill Name 📦 | Repository 🏠 | Tier 🏷️ | Score ⭐️ | Author 👤 |
| --- | --- | --- | --- | --- | --- |
| 🏆 1 | `agent-platform-eval-flywheel` | `google-skills` | 🟢 **Tier 1** | **48.816** | @thanhnguyxnagent[bot] |
| 🥈 2 | `gke-workload-troubleshooting` | `google-skills` | 🟢 **Tier 1** | **48.384** | @thanhnguyxnagent[bot] |
| 🥉 3 | `laravel-security` | `ecc` | 🟢 **Tier 1** | **48.012** | @ThanhNguyxn |
| 4 | `react-performance` | `ecc` | 🟢 **Tier 1** | **47.904** | @ThanhNguyxn |
| 5 | `data-scraper-agent` | `ecc` | 🟢 **Tier 1** | **47.748** | @ThanhNguyxn |
| 6 | `agents-sdk` | `cloudflare-skills` | 🟢 **Tier 1** | **47.707** | @thanhnguyxnagent[bot] |
| 7 | `gke-workload-scaling-troubleshooting` | `google-skills` | 🟢 **Tier 1** | **47.107** | @thanhnguyxnagent[bot] |
| 8 | `windows-desktop-e2e` | `ecc` | 🟢 **Tier 1** | **46.868** | @ThanhNguyxn |
| 9 | `vue-reviewer` | `ecc` | 🟢 **Tier 1** | **46.855** | @ThanhNguyxn |
| 10 | `redis-patterns` | `ecc` | 🟢 **Tier 1** | **46.538** | @ThanhNguyxn |
| 11 | `developing-genkit-go` | `google-skills` | 🟢 **Tier 1** | **46.518** | @thanhnguyxnagent[bot] |
| 12 | `agent-platform-migrate-from-ai-studio` | `google-skills` | 🟢 **Tier 1** | **46.440** | @thanhnguyxnagent[bot] |
| 13 | `deployment-patterns` | `ecc` | 🟢 **Tier 1** | **46.340** | @ThanhNguyxn |
| 14 | `perl-testing` | `ecc` | 🟢 **Tier 1** | **46.337** | @ThanhNguyxn |
| 15 | `security-and-hardening` | `addyosmani-agent-skills` | 🟢 **Tier 1** | **46.316** | @thanhnguyxnagent[bot] |
| 16 | `coding-standards` | `ecc` | 🟢 **Tier 1** | **46.238** | @ThanhNguyxn |
| 17 | `security-review` | `ecc` | 🟢 **Tier 1** | **46.220** | @ThanhNguyxn |
| 18 | `code-reviewer` | `ecc` | 🟢 **Tier 1** | **46.172** | @ThanhNguyxn |
| 19 | `kotlin-patterns` | `ecc` | 🟢 **Tier 1** | **46.165** | @ThanhNguyxn |
| 20 | `carrier-relationship-management` | `ecc` | 🟢 **Tier 1** | **46.142** | @ThanhNguyxn |
| 21 | `developing-genkit-js` | `google-skills` | 🟢 **Tier 1** | **46.141** | @thanhnguyxnagent[bot] |
| 22 | `sign-in-with-google-web` | `google-skills` | 🟢 **Tier 1** | **46.033** | @thanhnguyxnagent[bot] |
| 23 | `dpop-adoption` | `google-skills` | 🟢 **Tier 1** | **45.977** | @thanhnguyxnagent[bot] |
| 24 | `developing-genkit-dart` | `google-skills` | 🟢 **Tier 1** | **45.846** | @thanhnguyxnagent[bot] |
| 25 | `react-testing` | `ecc` | 🟢 **Tier 1** | **45.829** | @ThanhNguyxn |
| 26 | `gke-storage-troubleshooting` | `google-skills` | 🟢 **Tier 1** | **45.828** | @thanhnguyxnagent[bot] |
| 27 | `gke-compute-classes` | `google-skills` | 🟢 **Tier 1** | **45.817** | @thanhnguyxnagent[bot] |
| 28 | `kotlin-ktor-patterns` | `ecc` | 🟢 **Tier 1** | **45.810** | @ThanhNguyxn |
| 29 | `flutter-reviewer` | `ecc` | 🟢 **Tier 1** | **45.758** | @ThanhNguyxn |
| 30 | `fastapi-patterns` | `ecc` | 🟢 **Tier 1** | **45.740** | @ThanhNguyxn |

*Showing top 30 of 630 skills — [view the full Live Leaderboard](https://thanhnguyxnorg.github.io/SkillGauge/).*

<!-- LEADERBOARD_END -->

---

## 📖 Documentation Directory

To learn more about the scientific methodology, CLI commands, and automated pipelines, please check the detailed guides:

1. **[Scientific Specification](docs/scientific_metrics.md)**
   Detailed formulas, quality tier divisions, and references for each of the 390 static signals across the 26 dimensions:
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
   * Our verification runner will automatically check for duplicate entries, score your skill against the 390-signal static matrix, and comment with a detailed report card.

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
