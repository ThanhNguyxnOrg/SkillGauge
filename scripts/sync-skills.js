const fs = require('fs');
const path = require('path');

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
} else {
  // Write a fallback if it doesn't exist yet
  fs.writeFileSync(path.join(outputDir, 'leaderboard.json'), JSON.stringify({ skills: [] }, null, 2));
  console.log('Created fallback leaderboard.json');
}

// 2. Bundle skills
if (fs.existsSync(skillsLockPath)) {
  const lock = JSON.parse(fs.readFileSync(skillsLockPath, 'utf8'));
  const bundle = {};

  for (const [key, meta] of Object.entries(lock.skills)) {
    // Check local path (copied to .agents/skills/ in workspace)
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
} else {
  console.warn('skills-lock.json not found, skipping skill bundling.');
  fs.writeFileSync(
    path.join(outputDir, 'skills-bundle.json'),
    JSON.stringify({}, null, 2),
    'utf8'
  );
}
