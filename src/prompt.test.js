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

  it('should include all required output sections', () => {
    expect(systemPrompt).toContain('The Setup');
    expect(systemPrompt).toContain('Final Recommendation');
    expect(systemPrompt).toContain('Reality Check');
    expect(systemPrompt).toContain('The Exception');
  });

  it('should instruct a beginner-safe, jargon-free tone', () => {
    expect(systemPrompt).toContain('TONE');
    expect(systemPrompt).toContain('Beginner Assumption');
  });

  it('should be under a reasonable character limit for token safety', () => {
    // System prompts over 4000 chars waste tokens and slow response
    expect(systemPrompt.length).toBeLessThan(4000);
  });
});
