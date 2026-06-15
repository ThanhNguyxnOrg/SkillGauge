export interface SkillMetadata {
  name?: string;
  description?: string;
  version?: string;
  [key: string]: any;
}

export interface ParsedMarkdown {
  metadata: SkillMetadata;
  headings: { level: number; text: string }[];
  listDepths: number[];
  codeBlocks: string[];
  rawText: string;
}
