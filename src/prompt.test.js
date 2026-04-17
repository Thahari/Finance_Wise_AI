import { describe, it, expect } from 'vitest';
import { systemPrompt } from './prompt';

describe('System Prompt', () => {
  it('should be defined and not empty', () => {
    expect(systemPrompt).toBeDefined();
    expect(typeof systemPrompt).toBe('string');
    expect(systemPrompt.length).toBeGreaterThan(0);
  });

  it('should contain key financial philosophy instructions', () => {
    expect(systemPrompt).toContain('Survival First');
    expect(systemPrompt).toContain('Beginner Tip');
  });
});
