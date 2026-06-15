# 🛠️ SkillGauge CLI Complete Reference & Integration Guide

The SkillGauge Command Line Interface (CLI) is the operational gateway to audit, check duplicates, optimize, and manage leaderboards for AI agent skills in both local environments and continuous integration pipelines.

---

## 🚀 Installation & Build Lifecycle

SkillGauge is built as a TypeScript monorepo using npm Workspaces. Before running the CLI, build the codebase to generate the JavaScript targets in the `dist` folders.

### 1. Install Dependencies
Installs all dependencies across the workspace (both `@skillgauge/core` and `@skillgauge/cli`):
```bash
npm install
```

### 2. Compile TypeScript Packages
Builds the core engine package followed by the command-line interface:
```bash
# Compile core engine package
npm run build -w packages/core

# Compile CLI executable wrapper
npm run build -w packages/cli
```

The compiled CLI target is generated at `packages/cli/dist/index.js` and is configured as an executable node script via the shebang `#!/usr/bin/env node`.

---

## ⚙️ Environment Configuration

The CLI supports advanced behaviors using system environment variables:

| Variable Name | Description | Default |
| --- | --- | --- |
| `GEMINI_API_KEY` | Optional. If provided, the `optimize` command uses the Gemini API (model `gemini-1.5-flash`) to perform high-quality LLM-driven prompt pruning and compression. | *None (falls back to heuristics)* |
| `PAGER` | Configures output paging. The sandbox runtime automatically defaults to `cat` to prevent interactive shell blocking. | *None* |

---

## 🔍 Commands Reference

### 1. `audit <target>`
Performs a structural and semantic audit on files, folders, or remote Git repositories.

#### Argument:
*   `<target>`: The path to a local markdown file, a directory containing skills, a glob pattern (e.g. `skills/**/*.md`), or a remote GitHub URL/shorthand.

#### Options:
*   `-f, --format <format>`: Determines output formatting. Available values: `pretty` (human-readable reports) or `json` (ideal for piping to other tools). Default is `pretty`.
*   `--fail-under <tier>`: Exit with a non-zero exit code if the graded quality tier is below the target (e.g., set to `2` to fail builds if a skill falls to `Tier 3`). Default is `0` (never fail based on score).
*   `--summary <file>`: Writes a structured markdown summary report of the audited target. Frequently used to populate GitHub `GITHUB_STEP_SUMMARY`.
*   `-v, --verbose`: Verbose output. Prints the raw scores (out of 1.0) for all 100 scientific criteria individually.

#### Command Examples:

##### Audit a local skill file:
```bash
node packages/cli/dist/index.js audit skills/superpowers/brainstorm.md
```

##### Audit a local directory (calculates package aggregation):
```bash
node packages/cli/dist/index.js audit skills/
```

##### Audit a remote Git repository:
You can pass a full GitHub URL (HTTPS or SSH) or a shorthand `owner/repository` string. The CLI will clone the repository, run the audit, and delete the clone when finished:
```bash
# Shorthand notation
node packages/cli/dist/index.js audit ThanhNguyxnOrg/awesome-cert-sherpa

# Full URL notation
node packages/cli/dist/index.js audit https://github.com/ThanhNguyxnOrg/awesome-cert-sherpa.git
```

#### JSON Output Schema Example:
When `--format json` is specified, the command prints a single, structured JSON object:
```json
{
  "packageScore": 336.069,
  "tier": "Tier 3",
  "integrityScore": 0.43,
  "redundancyPenalty": 1.00,
  "individualAudits": [
    {
      "path": "writing-skills/SKILL.md",
      "report": {
        "name": "writing-skills",
        "overallScore": 60.31,
        "tier": "Tier 2",
        "dimensions": {
          "dimA": 11.23,
          "dimB": 10.45,
          "dimC": 8.12,
          "dimD": 9.34,
          "dimE": 12.01,
          "dimF": 6.12,
          "dimG": 3.04
        },
        "scores": {
          "A1": 1.0,
          "A2": 0.85
        },
        "explanation": "Satisfactory structure but needs safety exfiltration guidelines and clearer parameter specifications."
      }
    }
  ]
}
```

---

### 2. `check-duplicate --target <target> --db <db>`
An anti-spam and validation utility that scans a target file/repository and compares it against the existing leaderboard database.

#### Parameters:
*   `--target <target>`: The glob pattern, local folder path, or remote Git URL/shorthand.
*   `--db <db>`: The path to the `leaderboard.json` file.

#### Verification Logic:
1.  Loads the existing database.
2.  Normalizes submitted file contents (strips markdown comments and whitespaces, converts to lowercase) and hashes it with SHA-256.
3.  Resolves display names in the `[Repository] - [Skill Name]` format.
4.  Rejects the submission (exits with code `2`) if the content hash OR the resolved display name already exists in the database.

#### Example:
```bash
node packages/cli/dist/index.js check-duplicate --target "skills/**/*.md" --db "leaderboard.json"
```

---

### 3. `update-leaderboard --target <target> --db <db> --readme <readme> --author <author>`
Performs a full audit on the target, checks for duplicates, updates the JSON leaderboard database, sorts all skills by score descending, and injects a sorted markdown ranking table directly back into the project's root `README.md`.

#### Options:
*   `--target <target>`: Glob pattern, directory, or remote Git URL.
*   `--db <db>`: Path to `leaderboard.json`.
*   `--readme <readme>`: Path to `README.md`.
*   `--author <author>`: Author username to credit on the leaderboard.

#### Target Markdown Placeholders:
The command scans the `README.md` and replaces all content between the following HTML comment markers:
```markdown
<!-- LEADERBOARD_START -->
<!-- LEADERBOARD_END -->
```

#### Example:
```bash
node packages/cli/dist/index.js update-leaderboard --target "skills/**/*.md" --db "leaderboard.json" --readme "README.md" --author "contrib-user"
```

---

### 4. `optimize <target>`
Compresses prompts, prunes redundancies, and resolves linguistic ambiguity to maximize a skill's Quality Tier.

#### Target:
*   `<target>`: Path, glob pattern, or Git URL of files to optimize in-place.

#### Execution Process:
1.  If `GEMINI_API_KEY` is set: calls the Gemini API to intelligently compress prompt length while maintaining original semantics and safety instructions.
2.  If the API call fails or no key is configured: falls back to the local rules-based engine:
    *   **Filler Removal**: Prunes common bloating phrases like *"please note that"*, *"remember to"*, etc.
    *   **Ambiguity Resolution**: Replaces qualifiers like *"should"*, *"could"*, *"try to"*, or *"if possible"* with strong, imperative constraints like *"must"*, *"never"*, *"shall"*, or *"strictly"*.
    *   **Formatting Cleanup**: Removes triple or quadruple empty lines, tightening the file's layout.

#### Example:
```bash
node packages/cli/dist/index.js optimize "skills/**/*.md"
```

---

## 🚪 Exit Codes Reference

To assist shell scripts and automated runners in pipeline triage, the CLI returns standard exit codes:

| Exit Code | Meaning |
| --- | --- |
| `0` | Success (Audit passes / No duplicates found / Leaderboard updated). |
| `1` | General error or Audit failed due to `--fail-under` tier constraints. |
| `2` | Duplicate skill content or name clash detected during `check-duplicate`. |
