const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const workflow = read('.github/workflows/submit-repo-bot.yml');
const submitSkill = read('packages/web/src/components/SubmitSkill.tsx');
const docs = {
  'README.md': read('README.md'),
  'CONTRIBUTING.md': read('CONTRIBUTING.md'),
  'packages/web/src/components/SubmitSkill.tsx': submitSkill,
};

test('web submission opens a GitHub issue that waits for the maintainer label', () => {
  assert.match(submitSkill, /https:\/\/github\.com\/\$\{targetOwner\}\/\$\{targetRepo\}\/issues\/new\?/);
  assert.match(submitSkill, /\[Submission\]/);
  assert.match(workflow, /github\.event\.label\.name == 'submission-request'/);
  assert.match(workflow, /startsWith\(github\.event\.issue\.title, '\[Submission\]'\)/);
});

test('submission docs describe the issue, sign-in and approval steps', () => {
  for (const [file, text] of Object.entries(docs)) {
    assert.doesNotMatch(text, /no login|requires no login|without (a )?login|no sign-?in/i, file);
    assert.doesNotMatch(text, /dispatch token|trigger a background Action/i, file);
    assert.match(text, /submission-request/, file);
    assert.match(text, /GitHub issue|\[Submission\]/, file);
    assert.match(text, /signed in|sign(ed)?-in|GitHub account/i, file);
  }
});
