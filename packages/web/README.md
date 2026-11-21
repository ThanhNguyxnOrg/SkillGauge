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

The **Submit Skill** page lets users submit a public GitHub repository for auditing. Filing the submission issue requires the submitter's own GitHub sign-in; no credentials are embedded in the site.

### How it Works:
1. **Submission Issue**: When a user inputs a repository URL and clicks **Submit**, the frontend opens a pre-filled `[Submission]` issue on `ThanhNguyxnOrg/SkillGauge` in a new tab. No credential is embedded in the bundle — GitHub requires the submitter's own signed-in account to file the issue.
2. **Maintainer Approval**: A maintainer applies the `submission-request` label to the issue, which triggers `submit-repo-bot.yml` to run the audit and open a PR.
3. **PR Polling**: Once the issue is filed, the frontend polls the public GitHub Pull Requests API for the repository (`ThanhNguyxnOrg/SkillGauge`) to find a PR created by the bot branch (`contrib-[repo_name]`).
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
