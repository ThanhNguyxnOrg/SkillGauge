# Design Specification: GitHub Actions Automated Leaderboard Bot

This document outlines the architecture, data structures, and automation flows for building a serverless, GitHub-Actions-driven backend for the SkillGauge Leaderboard. 

---

## 1. High-Level Workflow Architecture

Instead of hosting a paid backend server, the entire submission, audit, optimization, anti-spam check, merge, and leaderboard update workflow is offloaded to **GitHub Actions (CI/CD)** and the **GitHub API**. The database is stored as a static `leaderboard.json` file in the repository.

```
[User Forks & Adds Skills]
       │
       ▼
[User Opens Pull Request]
       │
       ▼ (Triggers GitHub Actions Workflow)
[Anti-Spam / Duplicate Check] ──(Dupe Found?)──► [Close PR + Comment]
       │ (No Duplicates)
       ▼
[Run SkillGauge Audits & Scores]
       │
       ▼
[AutoPDL Optimizer (if Tier 2/3)] ──► [Commit Optimized Skill to PR Branch]
       │
       ▼
[Update leaderboard.json & README.md]
       │
       ▼
[Auto-Squash & Merge PR] ──► [GitHub Pages Fetches leaderboard.json & Renders UI]
```

---

## 2. Database Schema (`leaderboard.json`)

The leaderboard is represented by a single, version-controlled JSON database:

```json
{
  "skills": [
    {
      "id": "math-solver-abc123",
      "name": "Math Solver",
      "description": "Solves complex math equations",
      "hash": "8f42a9b3d...",
      "author": "github_username",
      "tier": "Tier 1",
      "overallScore": 0.895,
      "scores": {
        "efficacy": 1.0,
        "friction": 0.95,
        "compactness": 0.9,
        "guardrails": 1.0,
        "schema": 1.0,
        "cohesion": 1.0,
        "ambiguity": 0.9,
        "memory": 0.8,
        "protection": 1.0,
        "negConstraint": 0.9,
        "saturationRisk": 0.85,
        "isolation": 1.0,
        "position": 0.95,
        "variableSafety": 1.0,
        "exampleRatio": 1.0
      },
      "submittedAt": "2026-06-15T16:43:19Z"
    }
  ]
}
```

---

## 3. Automation Modules

### 3.1 Duplicate Detection (Anti-Spam)
To prevent users from copy-pasting existing skill repos (such as `anthropics/skills`), the bot calculates a normalized content hash:
1.  **Normalize**: Remove markdown comments, extra whitespace, formatting wrappers, and lowercase the text.
2.  **Hash**: Calculate the SHA-256 hash of the normalized text.
3.  **Check**: If the computed hash matches any hash in `leaderboard.json`, the workflow:
    *   Uses GitHub CLI (`gh pr comment` / `gh pr close`) to reject the PR automatically.
    *   Exits with status `0` (terminating the run cleanly).

### 3.2 Automated PR Commit & Git Clean-up
If the skill is Tier 2 or Tier 3, the bot:
1.  Runs the optimizer in `core`.
2.  Overwrites the user's files with the optimized version.
3.  Commits the changes back to the PR branch:
    ```bash
    git config --global user.name "SkillGauge Bot"
    git config --global user.email "bot@skillgauge.ai"
    git add .
    git commit -m "style: optimize skill package via SkillGauge"
    git push
    ```
4.  When the PR is merged, the workflow uses `--squash` to combine all commits into a single commit under the author's name, maintaining a clean commit history on the `main` branch.

### 3.3 Rebuilding the Leaderboard
1.  Appends the new entry to `leaderboard.json`.
2.  Sorts the `skills` array by `overallScore` descending.
3.  Generates a clean markdown table of the Top 50 skills.
4.  Injects the table into the `README.md` between comment boundaries:
    ```markdown
    <!-- LEADERBOARD_START -->
    | Rank | Name | Tier | Score | Author |
    | --- | --- | --- | --- | --- |
    | 1 | Math Solver | Tier 1 | 0.895 | @github_username |
    <!-- LEADERBOARD_END -->
    ```
5.  Commits the updated `leaderboard.json` and `README.md` directly.

---

## 4. GitHub Actions Workflow Template (`.github/workflows/leaderboard-bot.yml`)

```yaml
name: SkillGauge Leaderboard Bot

on:
  pull_request_target:
    types: [opened, synchronize]
    paths:
      - 'skills/**/*.md'

permissions:
  contents: write
  pull-requests: write

jobs:
  audit-and-merge:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.ref }}
          repository: ${{ github.event.pull_request.head.repo.full_name }}
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Anti-Spam Check
        id: anti-spam
        run: |
          node packages/cli/dist/index.js check-duplicate --target "skills/**/*.md" --db "leaderboard.json"
        # If exit code indicates duplicate, this step fails or sets an output to skip subsequent tasks

      - name: Run SkillGauge Audit
        run: |
          node packages/cli/dist/index.js audit "skills/**/*.md" --fail-under 0 --summary summary.md

      - name: Auto-Optimize Skills
        run: |
          node packages/cli/dist/index.js optimize "skills/**/*.md"

      - name: Commit Optimized Versions
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add .
          git diff-index --quiet HEAD || (git commit -m "style: optimize skills via SkillGauge Bot" && git push)

      - name: Update Leaderboard JSON & README
        run: |
          node packages/cli/dist/index.js update-leaderboard --author "${{ github.event.pull_request.user.login }}" --db "leaderboard.json" --readme "README.md"

      - name: Publish Step Summary
        run: cat summary.md >> $GITHUB_STEP_SUMMARY

      - name: Auto-Merge Pull Request
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr merge ${{ github.event.pull_request.number }} --squash --auto --delete-branch
```
