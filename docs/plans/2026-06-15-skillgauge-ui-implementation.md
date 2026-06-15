# SkillGauge Web Dashboard Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build a premium, high-end React + Vite + TypeScript single-page dashboard for SkillGauge inside `packages/web` that bundles local skills and leaderboard data, running full audits client-side using `@skillgauge/core`.

**Architecture:** A client-side SPA that imports pre-bundled static JSON data. It includes a custom prep script to aggregate data, runs all audits dynamically in the browser, displays a modern glassmorphic dashboard with 7-dimension visual charts, and includes an interactive audit sandbox.

**Tech Stack:** React, Vite, TypeScript, Vanilla CSS (CSS Modules), Lucide React.

---

### Task 1: Create Prep/Sync Script
Create a script in the root directory that reads `skills-lock.json`, extracts markdown contents of all installed skills, runs a basic pre-check, and outputs a bundled JSON along with `leaderboard.json` to the web package's source data directory.

**Files:**
- Create: `scripts/sync-skills.js`

**Step 1: Write the minimal implementation**
Write the Node.js script that reads `skills-lock.json`, reads all skill markdown content from their respective paths, parses them, and saves the bundle to `packages/web/src/data/skills-bundle.json` and copies `leaderboard.json` to `packages/web/src/data/leaderboard.json`.

```javascript
import fs from 'fs';
import path from 'path';

const skillsLockPath = path.resolve('skills-lock.json');
const leaderboardPath = path.resolve('leaderboard.json');
const outputDir = path.resolve('packages/web/src/data');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Copy leaderboard.json
if (fs.existsSync(leaderboardPath)) {
  fs.copyFileSync(leaderboardPath, path.join(outputDir, 'leaderboard.json'));
  console.log('Copied leaderboard.json');
}

// 2. Bundle skills
if (fs.existsSync(skillsLockPath)) {
  const lock = JSON.parse(fs.readFileSync(skillsLockPath, 'utf8'));
  const bundle = {};

  for (const [key, meta] of Object.entries(lock.skills)) {
    // Check local path (copied to .agents/skills/ in workspace)
    // Map paths from skills/taste-skill/SKILL.md to .agents/skills/design-taste-frontend/SKILL.md or similar
    // The keys match the directory names in .agents/skills/
    let skillFile = path.resolve('.agents', 'skills', key, 'SKILL.md');
    
    // Fallbacks
    if (!fs.existsSync(skillFile)) {
      skillFile = path.resolve('.agents', 'skills', key, 'skill.md');
    }
    if (!fs.existsSync(skillFile)) {
      // Try resolving directly using lock path relative
      skillFile = path.resolve(meta.skillPath);
    }
    if (!fs.existsSync(skillFile)) {
      // Try resolving under skills/
      skillFile = path.resolve('skills', key, 'SKILL.md');
    }

    if (fs.existsSync(skillFile)) {
      const content = fs.readFileSync(skillFile, 'utf8');
      bundle[key] = {
        name: key,
        path: skillFile,
        content
      };
      console.log(`Bundled skill: ${key}`);
    } else {
      console.warn(`Could not find file for skill ${key} at ${skillFile}`);
    }
  }

  fs.writeFileSync(
    path.join(outputDir, 'skills-bundle.json'),
    JSON.stringify(bundle, null, 2),
    'utf8'
  );
  console.log('Saved skills-bundle.json');
}
```

**Step 2: Create temporary folders and verify script runs**
Create `packages/web/src/data` directories temporarily and run `node scripts/sync-skills.js`. Verify both output files are generated.

---

### Task 2: Scaffold packages/web React App
Scaffold the React + TypeScript app in `packages/web` using Vite in non-interactive mode.

**Files:**
- Create: `packages/web` (scaffold)
- Modify: `package.json` (workspace dependencies and root scripts)

**Step 1: Initialize Vite app**
Run: `npx -y create-vite@latest packages/web --template react-ts --no-interactive --overwrite`

**Step 2: Add workspace dependencies and scripts to packages/web/package.json**
Add `@skillgauge/core` to the dependencies of `packages/web/package.json` pointing to `workspace:*` (or package version `0.1.0`), and add a custom script to sync data.
Also add `lucide-react` for icons.

**Step 3: Update root package.json**
Add script `"web:dev": "node scripts/sync-skills.js && npm run dev -w packages/web"` and `"web:build": "node scripts/sync-skills.js && npm run build -w packages/web"`.

---

### Task 3: Design the CSS Architecture
Implement a high-end, responsive dark theme design system in Vanilla CSS using CSS variables. Add glowing mesh radial gradients and a fixed glassmorphic sidebar/navbar.

**Files:**
- Create: `packages/web/src/index.css`
- Create: `packages/web/src/App.module.css`

**Step 1: Write Custom CSS Styles**
Configure high-end variables for colors, typography, double-bezel cards, overlays, animations, custom scrollbars, and keyframes. Include ambient mesh background grids.

---

### Task 4: Build Core Components & Dashboard Logic
Create the components:
1. **Leaderboard**: Standardized, premium rendering of the ranking list.
2. **Local Skills Bento Grid**: Displays installed local skills.
3. **Audit Sandbox**: Allows auditing custom paste/uploaded code.
4. **Detail Drawer/Modal**: Opens when a skill is clicked, displaying Overall score dials, Dimension breakdown progress tracks, and a list of all 100 criteria audits.

**Files:**
- Create: `packages/web/src/components/Leaderboard.tsx`
- Create: `packages/web/src/components/SkillExplorer.tsx`
- Create: `packages/web/src/components/AuditSandbox.tsx`
- Create: `packages/web/src/components/SkillDetailModal.tsx`
- Modify: `packages/web/src/App.tsx`

**Step 1: Code the Components**
Implement the components. Connect `@skillgauge/core`'s `auditSkill` function client-side to run the audit dynamically in the browser for local skills and sandbox inputs.

---

### Task 5: Verify, Refine, and Document Build
Validate that the app builds correctly, has no TypeScript compilation errors, and run it locally to confirm aesthetic excellence and correctness.

**Files:**
- Modify: `docs/plans/task.md` (mark completed)
- Create: `docs/plans/walkthrough.md` (summary of changes)
