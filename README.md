<p align="center">
  <img src="packages/web/public/logo.png" alt="SkillGauge logo" width="120" />
</p>

# 🏆 SkillGauge: Agent Skills Leaderboard & Scientific Auditor

**SkillGauge** is an automated static auditing engine and leaderboard platform for agentic process instructions (such as Anthropic-style `SKILL.md` or `.agent/skills/` files). 

Instead of evaluating AI agent executions dynamically (which is expensive and non-deterministic), **SkillGauge** audits the structural quality, safety, and operational economy of skill prompts directly through **105 weighted static signals (7 dimensions × 15) + static anti-gaming integrity checks**. Scores are a cheap community-linter reference, not a measure of task success.

---

## ⭐️ Top Agent Skills Leaderboard

The live ranking table is dynamically managed and updated on our web dashboard:

👉 **[View the Live Leaderboard](https://thanhnguyxnorg.github.io/SkillGauge/)**

<!-- LEADERBOARD_START -->

| Rank 🏆 | Skill Name 📦 | Repository 🏠 | Tier 🏷️ | Score ⭐️ | Author 👤 |
| --- | --- | --- | --- | --- | --- |
| 🏆 1 | `windows-desktop-e2e` | `ecc` | 🟢 **Tier 1** | **92.893** | @ThanhNguyxn |
| 🥈 2 | `flutter-reviewer` | `ecc` | 🟢 **Tier 1** | **92.294** | @ThanhNguyxn |
| 🥉 3 | `intent-driven-development` | `ecc` | 🟢 **Tier 1** | **91.398** | @ThanhNguyxn |
| 4 | `code-reviewer` | `ecc` | 🟢 **Tier 1** | **91.365** | @ThanhNguyxn |
| 5 | `flutter-dart-code-review` | `ecc` | 🟢 **Tier 1** | **91.364** | @ThanhNguyxn |
| 6 | `spec-miner` | `ecc` | 🟢 **Tier 1** | **91.255** | @ThanhNguyxn |
| 7 | `code-review-and-quality` | `addyosmani-agent-skills` | 🟢 **Tier 1** | **91.108** | @thanhnguyxnagent[bot] |
| 8 | `google-cloud-solution-guided-gke-ai-migration` | `google-skills` | 🟢 **Tier 1** | **91.033** | @thanhnguyxnagent[bot] |
| 9 | `turnstile-spin` | `cloudflare-skills` | 🟢 **Tier 1** | **90.939** | @thanhnguyxnagent[bot] |
| 10 | `typescript-reviewer` | `ecc` | 🟢 **Tier 1** | **90.462** | @ThanhNguyxn |
| 11 | `vue-reviewer` | `ecc` | 🟢 **Tier 1** | **90.423** | @ThanhNguyxn |
| 12 | `observability-and-instrumentation` | `addyosmani-agent-skills` | 🟢 **Tier 1** | **90.212** | @thanhnguyxnagent[bot] |
| 13 | `gke-compute-classes` | `google-skills` | 🟢 **Tier 1** | **90.052** | @thanhnguyxnagent[bot] |
| 14 | `mle-workflow` | `ecc` | 🟢 **Tier 1** | **89.776** | @ThanhNguyxn |
| 15 | `agent-platform-troubleshooting` | `google-skills` | 🟢 **Tier 1** | **89.669** | @thanhnguyxnagent[bot] |
| 16 | `csharp-reviewer` | `ecc` | 🟢 **Tier 1** | **89.634** | @ThanhNguyxn |
| 17 | `git-workflow-and-versioning` | `addyosmani-agent-skills` | 🟢 **Tier 1** | **89.549** | @thanhnguyxnagent[bot] |
| 18 | `writing-skills` | `superpowers` | 🟢 **Tier 1** | **89.525** | @ThanhNguyxn |
| 19 | `gke-workload-troubleshooting` | `google-skills` | 🟢 **Tier 1** | **89.384** | @thanhnguyxnagent[bot] |
| 20 | `doubt-driven-development` | `addyosmani-agent-skills` | 🟢 **Tier 1** | **89.277** | @thanhnguyxnagent[bot] |
| 21 | `security-and-hardening` | `addyosmani-agent-skills` | 🟢 **Tier 1** | **89.196** | @thanhnguyxnagent[bot] |
| 22 | `network-troubleshooter` | `ecc` | 🟢 **Tier 1** | **89.181** | @ThanhNguyxn |
| 23 | `production-audit` | `ecc` | 🟢 **Tier 1** | **89.066** | @ThanhNguyxn |
| 24 | `cloudflare` | `cloudflare-skills` | 🟢 **Tier 1** | **88.943** | @thanhnguyxnagent[bot] |
| 25 | `google-ads-api-mcp-setup` | `google-skills` | 🟢 **Tier 1** | **88.814** | @thanhnguyxnagent[bot] |
| 26 | `autonomous-loops` | `ecc` | 🟢 **Tier 1** | **88.733** | @ThanhNguyxn |
| 27 | `secops-detection-engineering` | `google-skills` | 🟢 **Tier 1** | **88.556** | @thanhnguyxnagent[bot] |
| 28 | `google-cloud-solution-n-tier-serverless-web-app` | `google-skills` | 🟢 **Tier 1** | **88.437** | @thanhnguyxnagent[bot] |
| 29 | `secops-cases` | `google-skills` | 🟢 **Tier 1** | **88.328** | @thanhnguyxnagent[bot] |
| 30 | `application-design-center-design-deploy` | `google-skills` | 🟢 **Tier 1** | **88.317** | @thanhnguyxnagent[bot] |

*Showing top 30 of 630 skills — [view the full Live Leaderboard](https://thanhnguyxnorg.github.io/SkillGauge/).*

<!-- LEADERBOARD_END -->

---

## 📖 Documentation Directory

To learn more about the scientific methodology, CLI commands, and automated pipelines, please check the detailed guides:

1. **[Scientific Specification](docs/scientific_metrics.md)**
   Detailed formulas, quality tier divisions, and references for the 105 weighted static signals across 7 dimensions:
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

Both ways go through GitHub, so you need a signed-in GitHub account, and a maintainer reviews every submission before anything is merged into the leaderboard:

1. **Via Web Dashboard (Recommended)**:
   * Navigate to the **Submit Skill** tab on the live dashboard.
   * Paste your GitHub repository URL (e.g., `https://github.com/owner/my-agent-skills`) or `owner/repo` shorthand.
   * Click **Submit Repository**. The site opens a pre-filled `[Submission] owner/repo` issue on this repository in a new tab; file it from your GitHub account. The site holds no credentials and does not trigger any workflow itself.
   * A maintainer approves the submission by applying the `submission-request` label. That label starts `submit-repo-bot.yml`, which clones your repository, audits all valid skills, and opens a Pull Request from the `contrib-<owner>-<repo>` branch.
   * The dashboard watches for that Pull Request and links it once it exists; until a maintainer applies the label, the submission waits.

2. **Via Manual Pull Request**:
   * Place your markdown skill files (which must start with YAML frontmatter containing `name:` and `description:`) in a folder named `skills/<your-repo-name>/<skill-name>.md`.
   * Open a Pull Request against the `main` branch.
   * Our verification runner will automatically check for duplicate entries, score your skill against the 105-signal weighted static matrix + anti-gaming checks, and comment with a detailed report card.

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
