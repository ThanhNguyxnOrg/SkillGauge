# 🤖 GitHub Actions Leaderboard CI Bot Guide

SkillGauge provides a serverless continuous integration workflow designed to automate skill submissions, run anti-spam checks, execute quality auditing, perform prompt optimization, and publish scores to the leaderboard.

This guide details the pipeline structure, event triggers, security considerations, and provides a production-ready GitHub Actions YAML configuration.

---

## 🔄 Pipeline Workflow Overview

```mermaid
graph TD
    A[Pull Request opened targeting skills/] --> B[Checkout repository]
    B --> C[Install dependencies]
    C --> D[Compile packages/core & packages/cli]
    D --> E[Check for Duplicate Submissions]
    E -->|Duplicate Found (Exit 2)| F[Fail PR & Log Error]
    E -->|No Duplicates| G[Execute Quality Audit]
    G --> H[Check fail-under Tier]
    H -->|Fails constraint (Exit 1)| I[Fail Build]
    H -->|Passes| J[Run Auto-Optimizer]
    J --> K[Update leaderboard.json & README.md]
    K --> L[Commit & Push changes to main]
```

---

## 📝 Production GitHub Action Configuration

Below is the complete, production-ready workflow file to be placed at `.github/workflows/leaderboard-bot.yml` in your repository:

```yaml
name: 🏆 SkillGauge Leaderboard Auditor Bot

on:
  pull_request:
    paths:
      - 'skills/**/*.md'
  push:
    branches:
      - main
    paths:
      - 'skills/**/*.md'

permissions:
  contents: write
  pull-requests: write

jobs:
  audit-and-publish:
    runs-on: ubuntu-latest
    steps:
      # 1. Checkout repository content
      - name: 📁 Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # 2. Setup Node.js workspace environment
      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      # 3. Install Monorepo Dependencies
      - name: 📦 Install Dependencies
        run: npm install

      # 4. Compile packages/core and packages/cli
      - name: 🔨 Compile TypeScript Workspaces
        run: |
          npm run build -w packages/core
          npm run build -w packages/cli

      # 5. Check for Duplicate Submissions (Anti-Spam Filter)
      - name: 🚨 Scan for Duplicates
        run: |
          node packages/cli/dist/index.js check-duplicate --target "skills/**/*.md" --db "leaderboard.json"

      # 6. Audit Submissions and Write Summary Report
      - name: 🔬 Audit Quality and Tier Grading
        id: audit
        run: |
          node packages/cli/dist/index.js audit "skills/**/*.md" --summary "audit-summary.md" --fail-under 3
          
      # 7. Publish Audit Summary to GitHub Step Summary
      - name: 📝 Publish Summary to Runner Panel
        if: always()
        run: |
          if [ -f audit-summary.md ]; then
            cat audit-summary.md >> $GITHUB_STEP_SUMMARY
          fi

      # 8. Optimize Skill Prompts
      - name: ⚡ Run Auto-Optimizer
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          node packages/cli/dist/index.js optimize "skills/**/*.md"

      # 9. Update Database and Rebuild README Leaderboard
      - name: 📊 Rebuild Leaderboard
        run: |
          # Use the PR author or committing git user name
          AUTHOR_NAME="${{ github.event.pull_request.user.login || github.actor }}"
          node packages/cli/dist/index.js update-leaderboard --target "skills/**/*.md" --db "leaderboard.json" --readme "README.md" --author "$AUTHOR_NAME"

      # 10. Commit and Push Changes back to the repository
      - name: 🚀 Commit & Publish Updates
        if: github.ref == 'refs/heads/main'
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add leaderboard.json README.md "skills/**/*.md"
          # Only commit and push if there are actual diff changes
          if ! git diff-index --quiet HEAD; then
            git commit -m "chore: auto-update leaderboard database & optimized skills [skip ci]"
            git push origin main
          else
            echo "No leaderboard modifications detected. Skipping commit."
          fi
```

---

## 🔒 Security & Runner Configurations

### 1. Repository Write Permissions
The CI runner requires write permissions to commit the updated `leaderboard.json` and `README.md` files back to the main branch. Ensure the following settings are active in your GitHub repository:
*   Go to **Settings** > **Actions** > **General**.
*   Under **Workflow permissions**, select **Read and write permissions**.
*   Check the box **Allow GitHub Actions to create and approve pull requests**.

### 2. Gemini API Secrets Setup
To enable LLM-driven premium prompt optimization via the Gemini API, you must add your Gemini API Key as a repository secret:
*   Go to **Settings** > **Secrets and variables** > **Actions**.
*   Click **New repository secret**.
*   Name: `GEMINI_API_KEY`.
*   Value: Your personal API key obtained from Google AI Studio.

If this secret is missing, the workflow will automatically fall back to the local, rule-based heuristics engine without failing the runner.
