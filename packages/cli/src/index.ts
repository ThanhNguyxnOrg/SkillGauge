#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { auditSkill, auditSkillAsync, auditPackage, VirtualFile, optimizeSkill } from '@skillgauge/core';

const program = new Command();

program
  .name('skillgauge')
  .description('Audit agent skills for efficacy and token costs')
  .version('0.1.0');

// Normalize and hash helper for duplicate detection
function getNormalizedHash(content: string): string {
  const normalized = content
    .replace(/<!--[\s\S]*?-->/g, '') // remove comments
    .replace(/\s+/g, '')            // remove whitespaces
    .toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function getRepositoryName(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  if (normalized.includes('.agent/skills/')) {
    return getGitOrWorkspaceRepoName(filePath);
  }
  const match = normalized.match(/\/skills\/([^/]+)\//i);
  if (match && match[1]) {
    return match[1];
  }
  return getGitOrWorkspaceRepoName(filePath);
}

function getGitOrWorkspaceRepoName(filePath: string): string {
  let dir = path.resolve(filePath);
  if (fs.existsSync(dir) && !fs.lstatSync(dir).isDirectory()) {
    dir = path.dirname(dir);
  }
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, '.git')) || fs.existsSync(path.join(dir, 'package.json'))) {
      const pkgPath = path.join(dir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          if (pkg.name && pkg.name !== 'skillgauge-monorepo') {
            return pkg.name;
          }
        } catch {}
      }
      return path.basename(dir);
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.basename(process.cwd());
}

function getIntelligentSkillName(file: string, reportName?: string): string {
  if (reportName && reportName.trim()) {
    return reportName.trim();
  }
  const baseName = path.basename(file, '.md');
  if (['skill', 'index', 'readme', 'main'].includes(baseName.toLowerCase())) {
    return path.basename(path.dirname(file));
  }
  return baseName;
}


program
  .command('audit')
  .description('Audit skill files or a skill package directory')
  .argument('<target>', 'Path to a file, directory, or glob pattern to audit')
  .option('-f, --format <format>', 'Output format: json, pretty', 'pretty')
  .option('--fail-under <tier>', 'Exit status fails (non-zero) if tier is below given value (1, 2, or 3)', '0')
  .option('--summary <file>', 'Path to write a markdown summary report (great for GitHub Step Summary)')
  .option('-v, --verbose', 'Verbose mode: outputs all 100 individual scientific metrics')
  .action(async (target, options) => {
    try {
      const isDirectory = fs.existsSync(target) && fs.lstatSync(target).isDirectory();
      const failUnderTier = parseInt(options.failUnder);
      let exitCode = 0;
      let summaryContent = '';

      if (isDirectory) {
        // Directory auditing mode
        const normalizedTarget = path.join(target, '**/*').replace(/\\/g, '/');
        const allFiles = await glob(normalizedTarget, { nodir: true });
        const virtualFiles: VirtualFile[] = allFiles.map(file => {
          return {
            path: path.relative(target, file).replace(/\\/g, '/'),
            content: fs.readFileSync(file, 'utf-8')
          };
        });

        const report = auditPackage(virtualFiles);
        let tierNum = 3;
        if (report.tier === 'Tier 1') tierNum = 1;
        else if (report.tier === 'Tier 2') tierNum = 2;

        if (failUnderTier > 0 && tierNum > failUnderTier) {
          exitCode = 1;
        }

        if (options.format === 'json') {
          console.log(JSON.stringify(report, null, 2));
        } else {
          console.log(chalk.bold(`\nPackage Audit: ${target}`));
          console.log(`Package Aggregate Score: ${report.packageScore.toFixed(3)}`);
          
          let tierChalk = chalk.red(report.tier);
          if (report.tier === 'Tier 1') tierChalk = chalk.green(report.tier);
          else if (report.tier === 'Tier 2') tierChalk = chalk.yellow(report.tier);
          
          console.log(`Tier: ${tierChalk}`);
          console.log(`Integrity Score (Links validation): ${report.integrityScore.toFixed(2)}`);
          console.log(`Redundancy Penalty: ${report.redundancyPenalty.toFixed(2)}`);
          console.log('\nIndividual Skills Audited:');
          for (const ind of report.individualAudits) {
            const fullPath = path.join(target, ind.path);
            const displayName = getIntelligentSkillName(fullPath, ind.report.name);
            console.log(`  - ${displayName} (${ind.path}): score ${ind.report.overallScore.toFixed(3)} (${ind.report.tier})`);
          }
        }

        // Build markdown summary with beautiful Emojis and report card!
        summaryContent = `## 🏆 SkillGauge Package Audit Report\n\n`;
        summaryContent += `* **Target Directory 📁:** \`${target}\`\n`;
        summaryContent += `* **Package Aggregate Score ⭐️:** **${report.packageScore.toFixed(3)}**\n`;
        
        let tierEmoji = '🔴';
        if (report.tier === 'Tier 1') tierEmoji = '🟢';
        else if (report.tier === 'Tier 2') tierEmoji = '🟡';

        summaryContent += `* **Package Tier ${tierEmoji}:** **${report.tier}**\n`;
        summaryContent += `* **Reference Integrity Score 🔗:** \`${report.integrityScore.toFixed(2)}\`\n`;
        summaryContent += `* **Redundancy Penalty ♻️:** \`${report.redundancyPenalty.toFixed(2)}\`\n\n`;
        summaryContent += `### 🏷️ Individual Skills Audited\n\n`;
        summaryContent += `| Skill Name 📦 | File Path 📄 | Overall Score ⭐️ | Tier 🏷️ |\n| --- | --- | --- | --- |\n`;
        for (const ind of report.individualAudits) {
          let indEmoji = '🔴';
          if (ind.report.tier === 'Tier 1') indEmoji = '🟢';
          else if (ind.report.tier === 'Tier 2') indEmoji = '🟡';
          const fullPath = path.join(target, ind.path);
          const displayName = getIntelligentSkillName(fullPath, ind.report.name);
          summaryContent += `| \`${displayName}\` | \`${ind.path}\` | \`${ind.report.overallScore.toFixed(3)}\` | ${indEmoji} **${ind.report.tier}** |\n`;
        }
      } else {
        // File glob/pattern auditing mode
        const files = await glob(target);
        if (files.length === 0) {
          console.log(chalk.yellow('No files found matching target.'));
          process.exit(0);
        }

        summaryContent = `## 🏆 SkillGauge File Audit Report\n\n`;
        summaryContent += `| Skill Name 📦 | Repository 🏠 | File Path 📄 | Overall Score ⭐️ | Tier 🏷️ |\n| --- | --- | --- | --- | --- |\n`;

        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          
          // Verify if it is a valid skill file
          if (!content.trim().startsWith('---') || !content.includes('name:') || !content.includes('description:')) {
            console.log(chalk.yellow(`⚠️ Skipping non-skill file (missing YAML headers): ${file}`));
            continue;
          }

          const report = await auditSkillAsync(content);

          let tierNum = 3;
          if (report.tier === 'Tier 1') tierNum = 1;
          else if (report.tier === 'Tier 2') tierNum = 2;

          if (failUnderTier > 0 && tierNum > failUnderTier) {
            exitCode = 1;
          }

          let tierEmoji = '🔴';
          if (report.tier === 'Tier 1') tierEmoji = '🟢';
          else if (report.tier === 'Tier 2') tierEmoji = '🟡';

          if (options.format === 'json') {
            console.log(JSON.stringify({ file, report }, null, 2));
          } else {
            const displayName = getIntelligentSkillName(file, report.name);
            const repoName = getRepositoryName(file);
            console.log(chalk.bold(`\nFile: ${file}`));
            console.log(`Skill Name: ${chalk.cyan(displayName)} (from Repository: ${chalk.cyan(repoName)})`);
            console.log(`Overall Score: ${report.overallScore.toFixed(3)} / 100.00`);
            
            let tierChalk = chalk.red(report.tier);
            if (report.tier === 'Tier 1') tierChalk = chalk.green(report.tier);
            else if (report.tier === 'Tier 2') tierChalk = chalk.yellow(report.tier);
            
            console.log(`Tier: ${tierChalk}`);
            console.log('\nDimension Breakdown:');
            console.log(`  Dim A: Instruction Quality & Clarity:    ${report.dimensions.dimA.toFixed(2)} / 15.00`);
            console.log(`  Dim B: Context & Memory Management:     ${report.dimensions.dimB.toFixed(2)} / 15.00`);
            console.log(`  Dim C: Safety, Alignment & Security:    ${report.dimensions.dimC.toFixed(2)} / 15.00`);
            console.log(`  Dim D: Tool-Use & MCP Clarity:          ${report.dimensions.dimD.toFixed(2)} / 15.00`);
            console.log(`  Dim E: Robustness & Exception Handling: ${report.dimensions.dimE.toFixed(2)} / 15.00`);
            console.log(`  Dim F: Operational & Inference Economy: ${report.dimensions.dimF.toFixed(2)} / 15.00`);
            console.log(`  Dim G: Syntax, Structure & Metadata:    ${report.dimensions.dimG.toFixed(2)} / 10.00`);
            
            if (options.verbose) {
              console.log('\nIndividual 100 Scientific Scores:');
              const sortedKeys = Object.keys(report.scores).sort();
              for (const key of sortedKeys) {
                console.log(`  ${key}: ${report.scores[key].toFixed(2)}`);
              }
            }

            if (report.explanation) {
              console.log(`\nFeedback Notes: ${chalk.italic(report.explanation)}`);
            }
          }

          const displayName = getIntelligentSkillName(file, report.name);
          const repoName = getRepositoryName(file);
          summaryContent += `| \`${displayName}\` | \`${repoName}\` | \`${file}\` | \`${report.overallScore.toFixed(3)}\` | ${tierEmoji} **${report.tier}** |\n`;
          if (report.explanation) {
            summaryContent += `| | | | *Notes: ${report.explanation}* | |\n`;
          }
        }
      }

      if (options.summary) {
        fs.writeFileSync(path.resolve(options.summary), summaryContent, 'utf-8');
        if (options.format !== 'json') {
          console.log(chalk.cyan(`\nSummary report written to ${options.summary}`));
        }
      }

      process.exit(exitCode);
    } catch (err: any) {
      console.error(chalk.red(`Error running audit: ${err.message}`));
      process.exit(1);
    }
  });

// 1. check-duplicate command implementation
program
  .command('check-duplicate')
  .description('Check if a skill is a duplicate (SHA-256 matching)')
  .requiredOption('--target <target>', 'Glob pattern of files to check')
  .requiredOption('--db <db>', 'Path to leaderboard.json database')
  .action(async (options) => {
    try {
      const files = await glob(options.target);
      if (files.length === 0) {
        console.log(chalk.yellow('No files found to check.'));
        process.exit(0);
      }

      // Read database
      let db: any = { skills: [] };
      if (fs.existsSync(options.db)) {
        db = JSON.parse(fs.readFileSync(options.db, 'utf-8'));
      }

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        
        // Skip non-skill files
        if (!content.trim().startsWith('---') || !content.includes('name:') || !content.includes('description:')) {
          continue;
        }

        const hash = getNormalizedHash(content);
        const report = auditSkill(content);
        const parsedName = getIntelligentSkillName(file, report.name);
        const repoName = getRepositoryName(file);
        const displayName = `${repoName} - ${parsedName}`;

        const isDuplicate = db.skills.some((s: any) => {
          const sCleanName = String(s.name).replace('🌟 ', '');
          return s.hash === hash || sCleanName === displayName;
        });

        if (isDuplicate) {
          console.error(chalk.red(`🚨 Duplicate detected for file: ${file} (Name: "${displayName}" or content hash matches existing entry)`));
          process.exit(2); // Exit with code 2 to indicate duplicate
        }
      }

      console.log(chalk.green('✅ No duplicates found. Safe to proceed!'));
      process.exit(0);
    } catch (err: any) {
      console.error(chalk.red(`Error checking duplicates: ${err.message}`));
      process.exit(1);
    }
  });

// 2. update-leaderboard command implementation
program
  .command('update-leaderboard')
  .description('Update the leaderboard JSON database and README')
  .option('--target <target>', 'Glob pattern of files to add to leaderboard', 'skills/**/*.md')
  .requiredOption('--db <db>', 'Path to leaderboard.json database')
  .requiredOption('--readme <readme>', 'Path to README.md')
  .requiredOption('--author <author>', 'GitHub username of contributor')
  .action(async (options) => {
    try {
      const files = await glob(options.target);
      if (files.length === 0) {
        console.log(chalk.yellow('No files found to add.'));
        process.exit(0);
      }

      // Load DB
      let db: any = { skills: [] };
      if (fs.existsSync(options.db)) {
        db = JSON.parse(fs.readFileSync(options.db, 'utf-8'));
      }

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        
        // Skip non-skill files
        if (!content.trim().startsWith('---') || !content.includes('name:') || !content.includes('description:')) {
          console.log(chalk.yellow(`⚠️ Skipping non-skill file (missing YAML headers): ${file}`));
          continue;
        }

        const hash = getNormalizedHash(content);
        const report = await auditSkillAsync(content);
        const parsedSkillName = getIntelligentSkillName(file, report.name);
        const repoName = getRepositoryName(file);
        const displayName = `${repoName} - ${parsedSkillName}`;
        const skillName = report.tier === 'Tier 1' ? '🌟 ' + displayName : displayName;

        // Check if exists, update or add
        const cleanName = displayName.replace('🌟 ', '');
        const existingIndex = db.skills.findIndex((s: any) => {
          const sCleanName = String(s.name).replace('🌟 ', '');
          return s.hash === hash || sCleanName === cleanName;
        });
        const skillEntry = {
          name: skillName,
          repository: repoName,
          hash,
          author: options.author,
          tier: report.tier,
          overallScore: report.overallScore,
          submittedAt: new Date().toISOString()
        };

        if (existingIndex > -1) {
          db.skills[existingIndex] = skillEntry;
        } else {
          db.skills.push(skillEntry);
        }
      }

      // Sort skills by score descending
      db.skills.sort((a: any, b: any) => b.overallScore - a.overallScore);

      // Write DB
      fs.writeFileSync(options.db, JSON.stringify(db, null, 2), 'utf-8');
      console.log(chalk.green(`✅ Leaderboard database updated at ${options.db}`));

      // Update README markdown table
      if (fs.existsSync(options.readme)) {
        let readmeContent = fs.readFileSync(options.readme, 'utf-8');
        
        let leaderboardTable = `\n| Rank 🏆 | Skill Name 📦 | Repository 🏠 | Tier 🏷️ | Score ⭐️ | Author 👤 |\n`;
        leaderboardTable += `| --- | --- | --- | --- | --- | --- |\n`;
        
        db.skills.forEach((skill: any, index: number) => {
          let rankEmoji = `${index + 1}`;
          if (index === 0) rankEmoji = '🏆 1';
          else if (index === 1) rankEmoji = '🥈 2';
          else if (index === 2) rankEmoji = '🥉 3';

          let tierEmoji = '🔴';
          if (skill.tier === 'Tier 1') tierEmoji = '🟢';
          else if (skill.tier === 'Tier 2') tierEmoji = '🟡';

          const repoText = skill.repository ? `\`${skill.repository}\`` : `\_unknown\_`;
          leaderboardTable += `| ${rankEmoji} | \`${skill.name}\` | ${repoText} | ${tierEmoji} **${skill.tier}** | **${skill.overallScore.toFixed(3)}** | @${skill.author} |\n`;
        });

        // Replace between placeholders
        const startMarker = '<!-- LEADERBOARD_START -->';
        const endMarker = '<!-- LEADERBOARD_END -->';
        
        const startIdx = readmeContent.indexOf(startMarker);
        const endIdx = readmeContent.indexOf(endMarker);

        if (startIdx > -1 && endIdx > -1) {
          const before = readmeContent.substring(0, startIdx + startMarker.length);
          const after = readmeContent.substring(endIdx);
          readmeContent = before + '\n' + leaderboardTable + '\n' + after;
          fs.writeFileSync(options.readme, readmeContent, 'utf-8');
          console.log(chalk.green(`✅ Leaderboard table successfully injected into ${options.readme}`));
        } else {
          console.log(chalk.yellow('⚠️ Leaderboard markers not found in README.md. Skipped markdown injection.'));
        }
      }

      process.exit(0);
    } catch (err: any) {
      console.error(chalk.red(`Error updating leaderboard: ${err.message}`));
      process.exit(1);
    }
  });

// 3. optimize command implementation
program
  .command('optimize')
  .description('Optimize skill files to improve their Tier using heuristics or Gemini API')
  .argument('<target>', 'Path or glob pattern of files to optimize')
  .action(async (target) => {
    try {
      const files = await glob(target);
      if (files.length === 0) {
        console.log(chalk.yellow('No files found to optimize.'));
        process.exit(0);
      }

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const optimized = await optimizeSkill(content);
        if (optimized !== content) {
          fs.writeFileSync(file, optimized, 'utf-8');
          console.log(chalk.green(`✅ Optimized and updated file: ${file}`));
        } else {
          console.log(chalk.blue(`ℹ️ File is already optimal: ${file}`));
        }
      }
      process.exit(0);
    } catch (err: any) {
      console.error(chalk.red(`Error optimizing files: ${err.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
