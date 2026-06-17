import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { auditSkill, auditSkillAsync } from '../packages/core/dist/index.js';

async function main() {
  const branchName = process.env.GITHUB_REF_NAME;
  const apiKey = process.env.GEMINI_API_KEY || '';

  if (!branchName) {
    console.error('Error: GITHUB_REF_NAME environment variable is not defined.');
    process.exit(1);
  }

  if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not defined. Skipping Phase 2 PR description update.');
    process.exit(0);
  }

  console.log(`Checking open Pull Request for branch: ${branchName}`);
  let prs;
  try {
    const prJsonStr = execSync(`gh pr list --head "${branchName}" --json number,body,title`).toString().trim();
    prs = JSON.parse(prJsonStr);
  } catch (err) {
    console.error('Failed to list Pull Requests using gh CLI:', err.message);
    process.exit(1);
  }

  if (!prs || prs.length === 0) {
    console.log('No open Pull Request found for this branch. Skipping description update.');
    process.exit(0);
  }

  const pr = prs[0];
  console.log(`Found Pull Request #${pr.number}: "${pr.title}"`);

  // Parse repo info from the existing body to preserve the original links
  const repoMatch = pr.body.match(/\*\*Source Repository:\*\* \[(.*?)\]\((.*?)\)/);
  const repoText = repoMatch ? repoMatch[1] : '';
  const repoUrl = repoMatch ? repoMatch[2] : '';

  const repoName = branchName.replace(/^contrib-/, '');
  const skillsDir = path.join('skills', repoName);

  if (!fs.existsSync(skillsDir)) {
    console.error(`Skills directory not found at ${skillsDir}. Cannot audit skills.`);
    process.exit(1);
  }

  const files = fs.readdirSync(skillsDir);
  const auditedSkills = [];

  for (const file of files) {
    const fullPath = path.join(skillsDir, file);
    if (!file.endsWith('.md') || !fs.statSync(fullPath).isFile()) {
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.trim().startsWith('---') && content.includes('name:') && content.includes('description:')) {
      try {
        console.log(`Auditing skill file: ${file} (Phase 1 & Phase 2)...`);
        const baseReport = auditSkill(content);
        const dynamicReport = await auditSkillAsync(content, apiKey);
        const skillName = dynamicReport.name || path.basename(file, '.md');
        
        auditedSkills.push({
          file: `skills/${repoName}/${file}`,
          name: skillName,
          staticScore: baseReport.overallScore,
          dynamicScore: dynamicReport.overallScore,
          tier: dynamicReport.tier,
          explanation: dynamicReport.explanation || 'Passes quality specifications.'
        });
      } catch (err) {
        console.error(`Failed to audit file ${file}:`, err.message);
      }
    }
  }

  if (auditedSkills.length === 0) {
    console.log('No valid skill files found to update.');
    process.exit(0);
  }

  // Build the updated PR description
  let prBody = `### 🎉 Successfully Audited and Prepared Skills (Dynamic Phase 2 Completed)!\n\n`;
  prBody += `This PR was automatically created by the SkillGauge Bot and has been updated with Dynamic Phase 2 Audit results.\n\n`;
  if (repoText && repoUrl) {
    prBody += `**Source Repository:** [${repoText}](${repoUrl})\n\n`;
  }
  prBody += `#### 📊 Audit Summary (Unified 2-Phase Scores):\n\n`;
  prBody += `| Skill Name | Path | Static Score (P1) | Final Score (P2) | Tier | Notes |\n`;
  prBody += `| --- | --- | --- | --- | --- | --- |\n`;
  
  const displaySkills = auditedSkills.slice(0, 15);
  for (const s of displaySkills) {
    let emoji = s.tier === 'Tier 1' ? '🟢' : s.tier === 'Tier 2' ? '🟡' : '🔴';
    let notesContent = s.explanation;
    if (notesContent && notesContent !== 'Passes quality specifications.') {
      notesContent = `<details><summary>🔍 View warnings</summary>${notesContent}</details>`;
    }
    prBody += `| \`${s.name}\` | \`${s.file}\` | \`${s.staticScore.toFixed(3)}\` | \`${s.dynamicScore.toFixed(3)}\` | ${emoji} **${s.tier}** | ${notesContent} |\n`;
  }

  if (auditedSkills.length > 15) {
    const remaining = auditedSkills.length - 15;
    prBody += `| *...* | *...* | *...* | *...* | *...* | *and ${remaining} more skills. View all details on the [Live Leaderboard](https://thanhnguyxnorg.github.io/SkillGauge/).* |\n`;
  }


  const bodyFilePath = path.join(process.cwd(), 'pr-body-dynamic.txt');
  fs.writeFileSync(bodyFilePath, prBody, 'utf-8');

  try {
    console.log(`Updating PR #${pr.number} description...`);
    execSync(`gh pr edit ${pr.number} --body-file "${bodyFilePath}"`);
    console.log('Successfully updated Pull Request description with Phase 2 results!');
  } catch (err) {
    console.error('Failed to edit Pull Request description using gh CLI:', err.message);
  } finally {
    if (fs.existsSync(bodyFilePath)) {
      fs.rmSync(bodyFilePath, { force: true });
    }
  }
}

main().catch(err => {
  console.error('Unhandled error in update-pr-dynamic script:', err);
  process.exit(1);
});
