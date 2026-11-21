const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { getNormalizedHash } = require('../packages/cli/src/content-hash.cjs');

test('skill hashes retain the leaderboard normalization', () => {
  for (const [source, canonical] of [
    [' A<!-- first\ncomment -->B <!---->\tc\r\n', 'abc'],
    ['A<!-- unclosed', 'a<!--unclosed'],
    ['<X<!-- comment -->Y>', '<xy>'],
    ['Ο Σ<!-- separator -->Α', 'οσα'],
  ]) {
    assert.equal(getNormalizedHash(source), createHash('sha256').update(canonical).digest('hex'));
  }
});

test('leaderboard hashes select the right file for overlapping and repeated skill names', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skillgauge-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const files = [
    ['ecc', 'e2e'],
    ['ecc', 'windows-desktop-e2e'],
    ['another-repo', 'windows-desktop-e2e'],
  ].map(([repo, name]) => {
    const content = `---\nname: ${name}\ndescription: ${repo} instructions\n---\n`;
    const dir = path.join(root, 'skills', repo);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${name}.md`), content);
    return { name, path: `skills/${repo}/${name}.md`, content };
  });

  execFileSync(process.execPath, [require.resolve('./sync-skills.js')], { cwd: root });
  const bundle = JSON.parse(fs.readFileSync(path.join(root, 'packages/web/src/data/skills-bundle.json'), 'utf8'));
  for (const file of files) {
    assert.deepEqual(bundle[getNormalizedHash(file.content)], file);
  }
});
