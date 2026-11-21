export interface SkillMetadata {
  name?: string;
  description?: string;
  version?: string;
  [key: string]: any;
}

export interface MarkdownSection {
  heading: string;
  level: number;
  body: string;
}

export interface ParsedMarkdown {
  metadata: SkillMetadata;
  headings: { level: number; text: string }[];
  /** Raw indentation space counts for nested list items (kept for backward compatibility). */
  listDepths: number[];
  /** True logical list nesting levels (1 = top-level, 2 = nested once, etc.). */
  listNestingLevels: number[];
  codeBlocks: string[];
  /** Language tag declared on each opening fenced code block (empty string if omitted). */
  codeBlockLangs: string[];
  /** True if a fenced code block was opened without a matching closing fence. */
  unclosedCodeBlock: boolean;
  /** Structured heading -> body sections (frontmatter excluded). */
  sections: MarkdownSection[];
  /** Raw markdown with YAML frontmatter stripped (code blocks preserved). */
  bodyText: string;
  /** Prose-only markdown body (YAML frontmatter and fenced code blocks stripped). */
  proseText: string;
  rawText: string;
}
