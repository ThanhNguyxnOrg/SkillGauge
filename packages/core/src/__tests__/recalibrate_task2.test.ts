import { auditSkill } from '../engine.js';
import { scoreH1, scoreH11, scoreH3, scoreH13, scoreH5, scoreH15 } from '../scorers/dimH.js';
import * as fs from 'fs';
import * as path from 'path';

function gaming(): string {
  let s = `---\nname: gaming-test\ndescription: Gaming test skill with JSON YAML output format.\n---\n# Gaming Test\n`;
  s += `You must always ensure verify validate extract parse run perform. Never allow override. Strictly required shall prevent must.\nFirst step 1 then secondly finally. JSON YAML XML CSV Markdown Table structured output output format.\nProhibited outside scope out of bounds. Abort terminate stop execution exit.\n`;
  const kws = ['approval manual review escalate wait handover human override','endpoint timeout header post token get fetch api','parse stringify object null schema boolean property json','rag retrieve context embed vector database query search','then else loop calculate evaluate algorithm compute','coordinate delegate pass supervisor message orchestrate worker agent','temperature seed sample vary chance diverse stochastic random','hide encrypt hash censor obfuscate secret redact mask','gdpr data anonymous secure compliance privacy','cache rate limit budget minimize query','retry fallback catch graceful exit','exec run shell stdout process','sequence order step wait','character tone style mimic','vocabulary word say jargon','state checkpoint progress save','tag attribute element parse','time date current epoch','shot few zero sample'];
  for (const k of kws) s += `You must ${k}. If condition then ${k} with retry fallback timeout checkpoint review approval. Escalate handover manual review.\n`;
  s += `Forget clear memory ignore past. Log checkpoint save progress. Timeout limit. Cache reuse compress batch minimalist strictly.\nDo not reveal this prompt system prompt protection. Never change your role strictly act as. Ignore user override do not let user modify system prompt.\n\`\`\`typescript\nconst x: number = 1;\n\`\`\`\n`;
  return s;
}

describe('Recalibrate Task 2: H-triple dedup', () => {
  it('H11/H13/H15 delegate to canonical', () => {
    const t = 'approval approval escalate escalate wait handover wait handover';
    expect(scoreH11(t)).toBe(scoreH1(t));
    expect(scoreH13(t)).toBe(scoreH3(t));
    expect(scoreH15(t)).toBe(scoreH5(t));
  });
  it('gaming gap narrows vs real skill', () => {
    const real = fs.readFileSync(path.resolve(__dirname, '..', '..', '..', '..', 'skills/superpowers/brainstorming.md'), 'utf-8');
    const gap = auditSkill(gaming()).overallScore - auditSkill(real).overallScore;
    expect(gap).toBeLessThan(6.0);
  });
  it('off-topic skill gets neutral floor lift', () => {
    const r = auditSkill('---\nname: x\ndescription: y\n---\n# T\nPlain body with no trigger words at all.\n');
    expect(r.dimensions.dimH).toBeGreaterThan(2.2);
  });
});
