import { buildStructuredPrompt } from '../orchestrator';

describe('buildStructuredPrompt', () => {
  it('replaces template variables and appends format instructions when missing', () => {
    const prompt = 'Objective: {objective}\nContext: {context}';
    const variables = { objective: 'Analyze churn', context: 'SaaS metrics' };
    const formatInstructions = 'Return JSON with keys: summary';

    const result = buildStructuredPrompt(prompt, variables, formatInstructions);

    expect(result).toContain('Objective: Analyze churn');
    expect(result).toContain('Context: SaaS metrics');
    expect(result).toContain(formatInstructions);
  });

  it('inlines format instructions when placeholder is present', () => {
    const prompt = 'Do the task.\n{format_instructions}';
    const formatInstructions = 'Return JSON only.';

    const result = buildStructuredPrompt(prompt, {}, formatInstructions);

    expect(result).toBe(`Do the task.\n${formatInstructions}`);
  });

  it('does not treat JSON braces as placeholders', () => {
    const prompt = 'Payload example: {"status": "ok"}\nTask: {task}';
    const formatInstructions = 'Return JSON.';

    const result = buildStructuredPrompt(prompt, { task: 'Review payload' }, formatInstructions);

    expect(result).toContain('Payload example: {"status": "ok"}');
    expect(result).toContain('Task: Review payload');
  });
});
