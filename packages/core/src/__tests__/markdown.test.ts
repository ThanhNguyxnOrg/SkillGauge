import { parseMarkdown } from '../parsers/markdown.js';

describe('Markdown Parser', () => {
  it('should parse metadata, headings, list depths, and code blocks', () => {
    const raw = `---
name: test-skill
description: simple test
---
# Header 1
## Header 2
  * Item 1
    * Item 2
\`\`\`javascript
const x = 1;
\`\`\`
`;
    const parsed = parseMarkdown(raw);
    expect(parsed.metadata.name).toBe('test-skill');
    expect(parsed.headings).toHaveLength(2);
    expect(parsed.headings[0]).toEqual({ level: 1, text: 'Header 1' });
    expect(parsed.listDepths).toContain(2); // Indented by 2 spaces
    expect(parsed.codeBlocks).toHaveLength(1);
    expect(parsed.codeBlocks[0]).toContain('const x = 1;');
  });
});
