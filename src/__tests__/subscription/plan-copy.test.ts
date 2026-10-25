import { PLAN_USAGE_LIMITS, AI_MESSAGE_RESET_NOTE } from '@/lib/subscription/plan-copy';

describe('plan limit copy (matches /pricing)', () => {
  it('states the enforced AI-message allowances', () => {
    expect(PLAN_USAGE_LIMITS.trial[0]).toBe('100 AI messages during the 3-day trial');
    expect(PLAN_USAGE_LIMITS.trial[1]).toBe('Up to 10 agents');
    expect(PLAN_USAGE_LIMITS.premium).toEqual(['2,000 AI messages per month']);
    expect(PLAN_USAGE_LIMITS.pro).toEqual(['10,000 AI messages per month']);
    expect(AI_MESSAGE_RESET_NOTE).toContain('1st of each month (UTC)');
  });

  it('makes no unenforced agent/workflow/storage/seat promises', () => {
    const all = Object.values(PLAN_USAGE_LIMITS).flat().join(' ');
    expect(all).not.toMatch(/unlimited|workflows?\b|GB|storage|seat|team member/i);
    // The only agent limit is the trial's enforced 10-agent cap; Premium and Pro have none.
    expect(all.match(/\d+\s+(AI\s+)?agents/gi)).toEqual(['10 agents']);
    expect([...PLAN_USAGE_LIMITS.premium, ...PLAN_USAGE_LIMITS.pro].join(' ')).not.toMatch(/agents/i);
  });
});
