# 💻 SkillGauge Web Dashboard

This package contains the interactive Single Page Application (SPA) dashboard for SkillGauge. It is built using **React**, **TypeScript**, and **Vite**, featuring a clean design, dark/light theme options, a live sandbox auditor, a repository scanner, and the global leaderboard.

---

## 🚀 Getting Started

### 1. Installation
Ensure you are in the workspace root and run:
```bash
npm install
```

### 2. Run the Development Server
Starts the local development server at `http://localhost:5173`:
```bash
npm run dev -w packages/web
# or via root shortcut:
npm run web:dev
```

### 3. Build for Production
Compiles the React+Vite app and outputs static files to `packages/web/dist`:
```bash
npm run build -w packages/web
# or via root shortcut:
npm run web:build
```

---

## 🔌 API & Submission Flow Integration

The **Submit Skill** page enables users to submit a public GitHub repository for auditing without needing to log in or supply their own credentials.

### How it Works:
1. **Triggering Workflow Dispatch**: When a user inputs a repository URL and clicks **Submit**, the frontend sends a `POST` request to the GitHub Actions `workflow_dispatch` API for `submit-repo-bot.yml`.
2. **Access Token (`VITE_SUBMIT_TOKEN`)**: To dispatch the workflow, the request is authenticated using a build-time token. This is injected during the build phase via the environment variable `VITE_SUBMIT_TOKEN`.
3. **PR Polling**: Once triggered, the frontend polls the GitHub Pull Requests API for the repository (`ThanhNguyxnOrg/SkillGauge`) to find a PR created by the bot branch (`contrib-[repo_name]`).
4. **Displaying the Link**: When the PR is found, the polling halts and the live Pull Request URL is displayed to the user.

---

## 🖼️ Asset Pathing and Hosting

When deploying to a custom subpath (like GitHub Pages, e.g., `https://username.github.io/SkillGauge/`), asset paths must be resolved relatively:

*   **TSX Images**: All image sources (such as logo icons) must be prefixed with `import.meta.env.BASE_URL` to ensure they map to the correct base path at runtime:
    ```tsx
    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" />
    ```
*   **HTML Links**: The `<link rel="icon">` in `index.html` uses relative pathing `./favicon.png` so it remains valid regardless of root or subpath deployment.
*   **Vite Configuration**: The `base` parameter in `vite.config.ts` matches the subpath:
    ```typescript
    export default defineConfig({
      base: '/SkillGauge/',
      // ...
    });
    ```
