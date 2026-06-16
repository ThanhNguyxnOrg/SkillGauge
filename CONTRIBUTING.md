# 🤝 Contributing to SkillGauge

Thank you for your interest in contributing to **SkillGauge**! We welcome contributions to the static auditing engine, web dashboard, CLI, and the Global Agent Skills Leaderboard.

This guide outlines our submission flows, codebase structure, and verification checklists to help you get started.

---

## 📁 Codebase Architecture

SkillGauge is built as a TypeScript monorepo using npm Workspaces:

*   **[`packages/core`](file:///d:/Code/SkillGauge/packages/core)**: The central static auditing engine. Contains the scoring algorithms for all 100 criteria across the 7 dimensions, the prompt optimizer, and GitHub API helper utilities.
*   **[`packages/cli`](file:///d:/Code/SkillGauge/packages/cli)**: The command-line utility used to audit local/remote files, run duplicate filters, and update the database and README leaderboard.
*   **[`packages/web`](file:///d:/Code/SkillGauge/packages/web)**: The premium client-side Single Page Application (built with React + Vite + TypeScript) serving as the interactive dashboard, sandbox auditor, and repository scanner.
*   **`skills/`**: The folder containing all accepted skill prompt configurations. Each repository's skills are stored under `skills/<repository-name>/`.

---

## 🚀 Local Development Workflow

Follow these steps to compile the workspaces and run tests locally:

### 1. Install Workspace Dependencies
```bash
npm install
```

### 2. Compile all Packages
Since the CLI and Web packages depend on the Core package, you must build the TypeScript workspaces:
```bash
npm run build
```

### 3. Run Jest Unit Tests
Ensure all core engine test suites pass:
```bash
npm test
```

---

## 🏆 How to Submit a New Agent Skill

You can submit new agent skills (e.g. `SKILL.md` or custom prompt instruction sets) to the global leaderboard in two ways:

### Method A: Using the Web UI (Recommended)
1. Open the SkillGauge Web Dashboard locally or on GitHub Pages.
2. Navigate to the **Submit Skill** tab.
3. Log in with your **GitHub Personal Access Token (PAT)** (requires `public_repo` scope).
4. Enter the GitHub repository URL containing your skill files (e.g. `https://github.com/owner/repository`).
5. Click **Scan Repository** to auto-detect and score all valid skills in your repository.
6. Click **Push Skills to Leaderboard**. The dashboard will automatically fork this repository, commit your skills under `skills/<repository-name>/`, and open a consolidated Pull Request.

### Method B: Manual Fork & Pull Request
1. Fork this repository to your GitHub account.
2. Clone your fork locally.
3. Place your skill markdown files under `skills/<your-repository-name>/<skill-name>.md`.
   * *Note: The file content must begin with YAML frontmatter containing the `name:` and `description:` fields.*
4. Commit and push the changes to a branch on your fork:
   ```bash
   git checkout -b add-my-skills
   git add skills/
   git commit -m "feat: add my agent skills from repo"
   git push origin add-my-skills
   ```
5. Open a Pull Request targeting the `main` branch of `ThanhNguyxnOrg/SkillGauge`.

---

## ⚙️ Pull Request CI Validation Pipeline

When you open a Pull Request, our automated GitHub Actions workflow will:
1. **Verify Formatting & Headers**: Ensure all files in `skills/` contain valid YAML frontmatter header configurations.
2. **Filter Duplicates (Anti-Spam)**: Compare content hashes (SHA-256) and clean names against the database to block duplicate submissions.
3. **Audit Quality Grades**: Grade each skill against the **100-criteria matrix** to calculate dimensions scores and tiers.
   * If any check fails (e.g. formatting issue or missing metadata), the CI **will not close your PR**. It will comment on the PR with a detailed report card and diagnostic warnings to help you fix the issues.
4. **Auto-Optimize Prompts**: Run our optimization compiler to compress adverbs, tighten list formatting, and convert weak qualifiers into strict instructions.
5. **Re-rank & Rebuild Leaderboard**: Once merged by a maintainer, the database (`leaderboard.json`) and the root `README.md` ranking table will be updated.

---

## 📜 Code of Conduct & Standards

To maintain a professional ecosystem:
*   Do not submit empty skill files or low-effort prompts.
*   Ensure all code blocks inside your markdown files specify their syntax languages (e.g. ` ```typescript `).
*   Avoid personal identifiable information (PII) or secrets in submitted files.
