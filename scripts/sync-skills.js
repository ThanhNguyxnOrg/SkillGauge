const fs = require('fs');
const path = require('path');

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

// 2. Bundle skills straight from skills/ (source of truth; no skills-lock.json indirection)
const skillsRoot = path.resolve('skills');
const bundle = {};
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith('.md')) continue;
    const content = fs.readFileSync(p, 'utf8');
    // Valid skill files only (same rule as CLI audit)
    if (!content.trim().startsWith('---') || !content.includes('name:') || !content.includes('description:')) continue;
    const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const nameMatch = fm && fm[1].match(/^name:\s*(.+)$/m);
    const key = (nameMatch ? nameMatch[1] : path.basename(e.name, '.md')).trim().replace(/^["']|["']$/g, '');
    if (!bundle[key]) {
      bundle[key] = { name: key, path: path.relative(path.resolve('.'), p).replace(/\\/g, '/'), content };
    }
  }
}
if (fs.existsSync(skillsRoot)) {
  walk(skillsRoot);
  console.log(`Bundled ${Object.keys(bundle).length} skills from skills/`);
} else {
  console.warn('skills/ not found, writing empty bundle.');
}

fs.writeFileSync(
  path.join(outputDir, 'skills-bundle.json'),
  JSON.stringify(bundle, null, 2),
  'utf8'
);
console.log('Saved skills-bundle.json');
