# 🎨 SkillGauge UI Design Specification

**Date:** 2026-06-15
**Topic:** SkillGauge Interactive Dashboard & Auditor Web App
**Status:** Approved by User

---

## 📌 Executive Summary
The goal is to design and implement a premium Web UI for **SkillGauge** that represents the current state of the repository. The web application will serve as a single-page interactive dashboard allowing users to:
1. View the global rankings and stats of audited skills (retrieved from `leaderboard.json`).
2. Explore installed local skills listed in `skills-lock.json` and view their detailed score breakdowns across the 7 dimensions.
3. Use an interactive sandbox auditor to paste or upload new skill prompts and analyze/optimize them on the fly directly in the browser using the `@skillgauge/core` package.

The application will be built as a client-side Single Page Application (SPA) using React, Vite, and TypeScript, structured as a new monorepo package `packages/web`, and configured for seamless deployment to **GitHub Pages**.

---

## 💎 Design System & Visual Vibe (Awwwards-Tier)
To align with the recently imported design skills (`high-end-visual-design` and `design-taste-frontend`), the UI will enforce the **Ethereal Glass / Dark Mode** design language:

### 1. Palette & Atmosphere
- **Base Background:** Deepest OLED black (`#050505`) with a subtle noise texture overlay for tactile depth.
- **Backing Meshes:** Blurry, floating radial gradients of Neon Purple (`#8B5CF6`) and Emerald Green (`#10B981`) placed in the background (`backdrop-filter` & `blur-[120px]`) to break flat color monotony.
- **Glass Cards:** Cards sit on the dark canvas using `background: rgba(10, 10, 10, 0.65)` with heavy `backdrop-blur-2xl` and outer thin highlights (`border: 1px solid rgba(255, 255, 255, 0.08)`).
- **Accents:**
  - **Tier 1:** Emerald (`#10B981`)
  - **Tier 2:** Amber/Gold (`#F59E0B`)
  - **Tier 3:** Crimson/Red (`#EF4444`)

### 2. Typography
- **Core Font:** `Plus Jakarta Sans` or `Outfit` loaded from Google Fonts (strict ban on Inter, Roboto, Arial).
- **Scale:** Large, spacious title layouts with wide tracking (`letter-spacing`) and clean geometric headings.

### 3. Nested Architecture (Double-Bezel)
No cards will sit flatly on the background. All cards follow the double-bezel principle:
- **Outer Shell:** Subtle container `div` with `bg-white/5` padding and `rounded-[2rem]`.
- **Inner Core:** Actual content block with calculated concentric radius `rounded-[calc(2rem-0.5rem)]` and deep internal shadow overlays.

---

## 🛠️ Tech Stack & Architecture
- **Framework:** React + TypeScript.
- **Build Tool:** Vite.
- **Styling:** Vanilla CSS (CSS Modules) to enforce absolute control and performance. Tailwind is avoided as per core guidelines.
- **Dependencies:**
  - `@skillgauge/core` (imported locally as a monorepo workspace dependency).
  - `lucide-react` (or custom light SVG path icons for lightweight visual indicators).
- **Pre-build Sync Script:**
  - A utility script `scripts/sync-skills.js` runs prior to development and building.
  - It reads `skills-lock.json` and parses all skill files listed (e.g., in `.agents/skills` or `skills/`), resolving their content and saving them into `packages/web/src/data/skills-bundle.json`.
  - It also copies `leaderboard.json` to `packages/web/src/data/leaderboard.json`.

---

## 📲 Functional Layout
The single-page dashboard consists of three main segments:

```
+-------------------------------------------------------------+
|                       Floating Nav Pill                     |
+-------------------------------------------------------------+
|                                                             |
|   1. LEADERBOARD (Rankings & Metadata)                       |
|      +-------------------------------------------------+    |
|      | Rank | Name | Repo | Tier | Score | Author      |    |
|      +-------------------------------------------------+    |
|                                                             |
|   2. LOCAL SKILLS EXPLORER (Bento Grid)                     |
|      +-----------------+  +-----------------+               |
|      | Brandkit Skill  |  | Minimalist Skill|               |
|      +-----------------+  +-----------------+               |
|                                                             |
|   3. INTERACTIVE SANDBOX AUDITOR                            |
|      +-------------------------------------------------+    |
|      | [ Markdown Input Text Area ]                    |    |
|      |                                                 |    |
|      |    [ Audit Skill ]        [ Optimize ]          |    |
|      +-------------------------------------------------+    |
|                                                             |
+-------------------------------------------------------------+
```

### Detail Panel (Modal or Drawer)
Clicking a local skill card triggers a sliding panel presenting:
- An overall score dial (SVG animated ring).
- Breakdown of 7 dimensions (A to G) showing achieved points out of max points.
- Categorized view of the 100 criteria. Low scores are highlighted with helpful troubleshooting warnings (retrieved from the scorer's rule descriptions).

---

## 🚀 Execution & Verification Plan
1. Create a script in the root to extract local skill files into JSON bundle.
2. Initialize `packages/web` using Vite (React + TypeScript) in non-interactive mode.
3. Configure monorepo workspace link for `@skillgauge/core`.
4. Implement CSS-based double-bezel styling and layout.
5. Code the three core segments.
6. Verify and test locally.
7. Configure GitHub Pages deployment action.
