import { isDuplicateEntry, nearDupeWarnings, getRepositoryName } from '../duplicate.js';

const db = [
  { hash: 'aaa', name: 'brainstorming', repository: 'SkillGauge' },
  { hash: 'bbb', name: 'other', repository: 'SkillGauge' }
];

describe('Duplicate seam (pure decision logic)', () => {
  it('unchanged file (same hash, name, repo) passes', () => {
    expect(isDuplicateEntry(db, 'aaa', 'brainstorming', 'SkillGauge')).toBe(false);
  });
  it('same content under new identity is duplicate', () => {
    expect(isDuplicateEntry(db, 'aaa', 'brainstorming', 'evil-repo')).toBe(true);
    expect(isDuplicateEntry(db, 'aaa', 'renamed-skill', 'SkillGauge')).toBe(true);
  });
  it('unknown hash passes', () => {
    expect(isDuplicateEntry(db, 'zzz', 'new-skill', 'SkillGauge')).toBe(false);
  });
  it('warns on near-identical pair, silent otherwise', () => {
    const body = 'line one\nline two\nline three\nline four\nline five\nline six\n';
    const warns = nearDupeWarnings([
      { file: 'a.md', content: body },
      { file: 'b.md', content: body },
      { file: 'c.md', content: 'totally different words here\nnothing shared\n' }
    ]);
    expect(warns.some(w => w.includes('a.md') && w.includes('b.md'))).toBe(true);
    expect(warns.some(w => w.includes('c.md'))).toBe(false);
  });
});

describe('Repository attribution (origin repo, not workspace)', () => {
  it('resolves subdir from relative CLI globs', () => {
    expect(getRepositoryName('skills/superpowers/brainstorming.md')).toBe('superpowers');
    expect(getRepositoryName('skills/ecc/agent-evaluator.md')).toBe('ecc');
  });
  it('resolves subdir from absolute paths and backslashes', () => {
    expect(getRepositoryName('/home/r/work/SkillGauge/skills/superpowers/x.md')).toBe('superpowers');
    expect(getRepositoryName('skills\\ecc\\x.md')).toBe('ecc');
  });
  it('resolves clone temp dirs to the cloned repo', () => {
    expect(getRepositoryName('/tmp/skillgauge-clones/123_ai/skills/a.md')).toBe('ai');
  });
  it('falls back to caller lookup otherwise', () => {
    expect(getRepositoryName('other/dir/x.md', () => 'Fallback')).toBe('Fallback');
    expect(getRepositoryName('other/dir/x.md')).toBe('SkillGauge');
  });
});
