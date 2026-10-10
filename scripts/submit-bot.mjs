import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { auditSkill, auditSkillAsync } from '../packages/core/dist/index.js';

// Parse arguments: node scripts/submit-bot.mjs --repository <url>
const args = process.argv.slice(2);
let repoUrl = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--repository' && args[i + 1]) {
    repoUrl = args[i + 1];
  }
}

if (!repoUrl) {
  console.error('Error: Missing repository URL. Pass --repository <url>');
  process.exit(1);
}

// Helper to parse owner/repo (dots preserved: owner/my.repo stays my.repo)
function parseGitUrl(url) {
  const match = url.match(/(?:github\.com[\/:])([^\/]+)\/([^\/]+?)(?:\.git)?\/?$/);
  if (!match) throw new Error(`Invalid GitHub repository URL: ${url}`);
  return { owner: match[1], repo: match[2] };
}

const { owner: repoOwner, repo: repoName } = parseGitUrl(repoUrl);
const author = repoOwner;
console.log(`Processing submission for repository: ${repoUrl} by author: @${author}`);
const tempDir = path.join(process.cwd(), 'temp-clone');

// Clean temp-clone if exists
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

// Clone target repository
try {
  console.log(`Cloning ${repoUrl}...`);
  execSync(`git clone --depth 1 "${repoUrl}" "${tempDir}"`, { stdio: 'inherit' });
} catch (err) {
  console.error(`Failed to clone the repository ${repoUrl}:`, err);
  process.exit(1);
}

// Scan for Markdown files with YAML frontmatter
function findMarkdownFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const files = fs.readdirSync(dir, { recursive: true });
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file.endsWith('.md') && fs.statSync(fullPath).isFile()) {
      const normalizedPath = file.replace(/\\/g, '/');
      if (
        normalizedPath.includes('node_modules/') ||
        normalizedPath.includes('.git/') ||
        normalizedPath.includes('.github/') ||
        normalizedPath.startsWith('docs/') ||
        normalizedPath.includes('/docs/') ||
        normalizedPath.includes('tests/') ||
        normalizedPath.includes('temp/')
      ) {
        continue;
      }
      results.push(normalizedPath);
    }
  }
  return results;
}

const mdFiles = findMarkdownFiles(tempDir);
const validSkills = [];
const apiKey = process.env.GEMINI_API_KEY || '';

for (const file of mdFiles) {
  const fullPath = path.join(tempDir, file);
  const content = fs.readFileSync(fullPath, 'utf-8');
  
  if (content.trim().startsWith('---') && content.includes('name:') && content.includes('description:')) {
    try {
      const report = apiKey ? await auditSkillAsync(content, apiKey) : auditSkill(content);
      const skillName = report.name || path.basename(file, '.md');
      validSkills.push({
        file,
        name: skillName,
        content,
        score: report.overallScore,
        tier: report.tier,
        explanation: report.explanation || ''
      });
      console.log(`Found valid skill: ${skillName} (${file})`);
    } catch (err) {
      console.error(`Failed to audit ${file}:`, err);
    }
  }
}

// Clean temp-clone
fs.rmSync(tempDir, { recursive: true, force: true });

if (validSkills.length === 0) {
  console.error('Error: No valid skill files detected (missing YAML headers or name/description fields).');
  process.exit(1);
}

// Duplicate policy (same repo only — names may collide across repos):
// identical (same name + same content) -> auto-close with "already exists";
// updated (same name, new content) -> proceed, update-leaderboard overwrites;
// new names -> proceed. Cross-repo hash matches stay a manual review matter.
const { createHash } = await import('crypto');
const normalizedHash = (c) => createHash('sha256')
  .update(c.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, '').toLowerCase())
  .digest('hex');
const cleanName = (n) => String(n).replace('🌟 ', '');
const slugOf = (o, r) => `${o}-${r}`.toLowerCase().replace(/[^a-z0-9_\-]+/g, '-').replace(/^-+|-+$/g, '');
const slug = slugOf(repoOwner, repoName);
let dbSkills = [];
try {
  dbSkills = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'leaderboard.json'), 'utf-8')).skills || [];
} catch {}
const fresh = validSkills.filter((s) => {
  const hit = dbSkills.find((d) => cleanName(d.name) === cleanName(s.name) && d.repository === slug);
  return !hit || hit.hash !== normalizedHash(s.content);
});
if (fresh.length === 0) {
  const branchName = `contrib-${slug}`;
  console.log('All submitted skills already exist with identical content.');
  try {
    const openPrs = JSON.parse(execSync(`gh pr list --head "${branchName}" --json url number`).toString().trim());
    if (openPrs && openPrs.length > 0) {
      execSync(`gh pr comment ${openPrs[0].number} --body "Already exists: every skill in this submission matches the leaderboard byte-for-byte. Auto-closing."`);
      execSync(`gh pr close ${openPrs[0].number}`);
      console.log(`Closed already-up-to-date PR #${openPrs[0].number}.`);
    } else {
      console.log('No open PR to close. Nothing to do.');
    }
  } catch (err) {
    console.error('Failed to close already-existing PR:', err.message || err);
  }
  process.exit(0);
}
console.log(`${fresh.length}/${validSkills.length} skills are new or updated; proceeding.`);

// Copy skill files into the monorepo skills directory (slug defined above:
// owner+repo, collision-proof across same-named repos).
const destDir = path.join(process.cwd(), 'skills', slug);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

for (const skill of validSkills) {
  const fileSlug = skill.name
    .toLowerCase()
    .replace(/[^a-z0-9_\-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const fileName = `${fileSlug}.md`;
  const destPath = path.join(destDir, fileName);
  fs.writeFileSync(destPath, skill.content, 'utf-8');
}

// Re-run sync-skills.js to update packages/web data bundle
console.log('Running sync-skills...');
execSync('node scripts/sync-skills.js', { stdio: 'inherit' });

// Run CLI update-leaderboard
console.log('Updating leaderboard...');
execSync(`node packages/cli/dist/index.js update-leaderboard --target "skills/${slug}/*.md" --db leaderboard.json --readme README.md --author "${author}"`, { stdio: 'inherit' });

// Git branching and PR creation
const branchName = `contrib-${slug}`;
try {
  // Configure bot git identity (ThanhNguyxnAgent, never github-actions[bot])
  execSync('git config user.name "ThanhNguyxnAgent[bot]"');
  execSync('git config user.email "296222857+thanhnguyxnagent[bot]@users.noreply.github.com"');

  // Check if branch already exists locally/remotely to clean it up
  try {
    execSync(`git branch -D ${branchName}`, { stdio: 'ignore' });
  } catch {}

  console.log(`Creating branch ${branchName}...`);
  execSync(`git checkout -b ${branchName}`);
  
  console.log('Staging changes...');
  execSync('git add skills/');
  
  console.log('Committing changes...');
  execSync(`git commit -m "feat: add skills from repository ${repoOwner}/${repoName}"`);
  
  console.log('Pushing branch (force)...');
  execSync(`git push origin ${branchName} --force`);
  
  // Check if PR already exists
  const existingPrsStr = execSync(`gh pr list --head "${branchName}" --json url`).toString().trim();
  const existingPrs = JSON.parse(existingPrsStr);

  // Create Pull Request body
  const prTitle = `Submit skills from ${repoOwner}/${repoName}`;
  let prBody = `### 🎉 Successfully Audited and Prepared Skills!\n\n`;
  prBody += `This PR was automatically created by the SkillGauge Bot in response to your repository submission.\n\n`;
  prBody += `**Source Repository:** [${repoOwner}/${repoName}](${repoUrl})\n\n`;
  prBody += `#### 📊 Audit Summary:\n\n`;
  prBody += `| Skill Name | Path | Score | Tier | Notes |\n`;
  prBody += `| --- | --- | --- | --- | --- |\n`;
  const displaySkills = validSkills.slice(0, 15);
  for (const s of displaySkills) {
    let emoji = s.tier === 'Tier 1' ? '🟢' : s.tier === 'Tier 2' ? '🟡' : '🔴';
    let notesContent = s.explanation || 'Passes quality specifications.';
    if (notesContent && notesContent !== 'Passes quality specifications.') {
      notesContent = `<details><summary>🔍 View warnings</summary>${notesContent}</details>`;
    }
    prBody += `| \`${s.name}\` | \`${s.file}\` | \`${s.score.toFixed(3)}\` | ${emoji} **${s.tier}** | ${notesContent} |\n`;
  }

  if (validSkills.length > 15) {
    const remaining = validSkills.length - 15;
    prBody += `| *...* | *...* | *...* | *...* | *and ${remaining} more skills. View all details on the [Live Leaderboard](https://thanhnguyxnorg.github.io/SkillGauge/).* |\n`;
  }


  const prBodyFile = path.join(process.cwd(), 'pr-body.txt');
  fs.writeFileSync(prBodyFile, prBody, 'utf-8');

  if (existingPrs && existingPrs.length > 0) {
    console.log(`PR already exists: ${existingPrs[0].url}. Updating branch instead...`);
  } else {
    console.log('Creating Pull Request...');
    const prUrl = execSync(`gh pr create --title ${JSON.stringify(prTitle)} --body-file "${prBodyFile}" --head "${branchName}" --base "main"`).toString().trim();
    console.log(`All done! PR created: ${prUrl}`);
  }

  // Clean up temporary file
  if (fs.existsSync(prBodyFile)) {
    fs.rmSync(prBodyFile, { force: true });
  }

} catch (err) {
  console.error('Failed to create PR or commit:', err);
  process.exit(1);
}
