import { optimizeTextHeuristics, optimizeSkill } from '../optimizer.js';

describe('Optimizer Module', () => {
  it('should clean up weak words and filler phrases', () => {
    const rawText = `
    Please note that you should try to do best effort to make sure to complete the task.
    Maybe it could be ideally done if possible.
    `;
    const optimized = optimizeTextHeuristics(rawText);

    // Assert weak words are replaced with strong ones (spec: no semantic rewrites like ideally->strictly)
    expect(optimized).toContain('must');
    expect(optimized).toContain('shall');
    expect(optimized).toContain('always');
    
    // Assert filler phrases are removed
    expect(optimized).not.toContain('Please note that');
    expect(optimized).not.toContain('make sure to');
  });

  it('should fall back to heuristics when API key is missing', async () => {
    const rawText = 'Please note that you should try to do best effort.';
    const optimized = await optimizeSkill(rawText);
    expect(optimized).toContain('must');
  });
});
