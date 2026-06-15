import { auditPackage } from '../packageEngine.js';

describe('Package Engine', () => {
  it('should audit multiple files in a virtual package and calculate aggregate scores', () => {
    const virtualFiles = [
      {
        path: 'SKILL.md',
        content: '---\nname: my-skill\ndescription: Use when testing package engine\n---\n# Main Skill\nUse `my-tool` defined in tools/my-tool.json.'
      },
      {
        path: 'tools/my-tool.json',
        content: '{"name": "my-tool"}'
      }
    ];

    const report = auditPackage(virtualFiles);
    expect(report.packageScore).toBeDefined();
    expect(report.integrityScore).toBe(1.0); // links resolves correctly
  });
});
