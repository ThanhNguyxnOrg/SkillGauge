# 🛠️ SkillGauge CLI Usage Guide

The SkillGauge CLI is a powerful command-line interface to audit, check duplicates, optimize, and update leaderboards for agent skills.

## 🚀 Installation & Build

First, compile the workspaces:
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build
```

The compiled CLI is located at `packages/cli/dist/index.js`.

---

## 🔍 Commands

### 1. `audit <target>`
Audits local files, local directories, or remote GitHub repositories.

#### Options:
*   `-f, --format <format>`: Output format (`pretty` or `json`). Default: `pretty`.
*   `--fail-under <tier>`: Exit with code 1 if the audited quality tier is below the target (1, 2, or 3).
*   `--summary <file>`: Write a Markdown summary report (perfect for GitHub Action Step Summaries).
*   `-v, --verbose`: Verbose mode (pretty-prints all 100 individual scientific scores).

#### Examples:

##### Audit a local file:
```bash
node packages/cli/dist/index.js audit "skills/superpowers/brainstorm.md"
```

##### Audit a local directory (monorepo package style):
```bash
node packages/cli/dist/index.js audit "skills/superpowers"
```

##### Audit a remote GitHub repository:
You can pass the full HTTPS/SSH repository URL or a shorthand `owner/repository` string. The CLI will clone it to a temp folder, parse all skill files (markdown files starting with YAML frontmatter `name:` and `description:`), compute scores, and clean up automatically.
```bash
# Shorthand notation
node packages/cli/dist/index.js audit ThanhNguyxnOrg/awesome-cert-sherpa

# Full URL notation
node packages/cli/dist/index.js audit https://github.com/ThanhNguyxnOrg/awesome-cert-sherpa.git
```

---

### 2. `check-duplicate --target <target> --db <db>`
Verifies if a skill (local or remote) already exists in the database. It compares both the content hash (SHA-256) and the resolved display name (`[Repository] - [Skill Name]`). If a duplicate is found, the CLI prints an error and exits with code `2`.

#### Options:
*   `--target <target>`: Glob pattern, directory path, or remote Git URL.
*   `--db <db>`: Path to the `leaderboard.json` file.

#### Examples:
```bash
node packages/cli/dist/index.js check-duplicate --target "skills/**/*.md" --db "leaderboard.json"
```

---

### 3. `update-leaderboard --target <target> --db <db> --readme <readme> --author <author>`
Audits the target, updates the `leaderboard.json` database, and dynamically injects the sorted markdown table between the `<!-- LEADERBOARD_START -->` and `<!-- LEADERBOARD_END -->` comments in the `README.md`.

#### Options:
*   `--target <target>`: Glob pattern, directory path, or remote Git URL.
*   `--db <db>`: Path to the `leaderboard.json` file.
*   `--readme <readme>`: Path to `README.md`.
*   `--author <author>`: Author username to credit on the leaderboard.

#### Examples:
```bash
node packages/cli/dist/index.js update-leaderboard --target "skills/**/*.md" --db "leaderboard.json" --readme "README.md" --author "ThanhNguyxn"
```

---

### 4. `optimize <target>`
Applies heuristic prompt refactoring and compression rules to the target files to decrease token footprint and improve overall safety scores, updating files in-place.

#### Examples:
```bash
node packages/cli/dist/index.js optimize "skills/**/*.md"
```
