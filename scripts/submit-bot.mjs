import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { auditSkill } from '../packages/core/dist/index.js';

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

// Helper to parse owner/repo
function parseGitUrl(url) {
  const match = url.match(/(?:github\.com[\/:])([^\/]+)\/([^\/\.]+)/);
  if (!match) throw new Error(`Invalid GitHub repository URL: ${url}`);
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
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
      results.push(file.replace(/\\/g, '/'));
    }
  }
  return results;
}

const mdFiles = findMarkdownFiles(tempDir);
const validSkills = [];

for (const file of mdFiles) {
  const fullPath = path.join(tempDir, file);
  const content = fs.readFileSync(fullPath, 'utf-8');
  
  if (content.trim().startsWith('---') && content.includes('name:') && content.includes('description:')) {
    try {
      const report = auditSkill(content);
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

// Copy skill files into the monorepo skills directory
const destDir = path.join(process.cwd(), 'skills', repoName);
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
execSync(`node packages/cli/dist/index.js update-leaderboard --target "skills/${repoName}/*.md" --db leaderboard.json --readme README.md --author "${author}"`, { stdio: 'inherit' });

// Git branching and PR creation
const branchName = `contrib-${repoName.toLowerCase()}`;
try {
  // Configure bot git identity
  execSync('git config user.name "github-actions[bot]"');
  execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');

  // Check if branch already exists locally/remotely to clean it up
  try {
    execSync(`git branch -D ${branchName}`, { stdio: 'ignore' });
  } catch {}

  console.log(`Creating branch ${branchName}...`);
  execSync(`git checkout -b ${branchName}`);
  
  console.log('Staging changes...');
  execSync('git add skills/ leaderboard.json README.md packages/web/src/data/');
  
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
  for (const s of validSkills) {
    let emoji = s.tier === 'Tier 1' ? '🟢' : s.tier === 'Tier 2' ? '🟡' : '🔴';
    prBody += `| \`${s.name}\` | \`${s.file}\` | \`${s.score.toFixed(3)}\` | ${emoji} **${s.tier}** | ${s.explanation} |\n`;
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
