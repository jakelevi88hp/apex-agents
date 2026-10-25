import { PLAN_USAGE_LIMITS, AI_MESSAGE_RESET_NOTE } from '@/lib/subscription/plan-copy';

describe('plan limit copy (matches /pricing)', () => {
  it('states the enforced AI-message allowances', () => {
    expect(PLAN_USAGE_LIMITS.trial[0]).toBe('100 AI messages during the 3-day trial');
    expect(PLAN_USAGE_LIMITS.premium).toEqual(['2,000 AI messages per month']);
    expect(PLAN_USAGE_LIMITS.pro).toEqual(['10,000 AI messages per month']);
    expect(AI_MESSAGE_RESET_NOTE).toContain('1st of each month (UTC)');
  });

  it('makes no unenforced agent/workflow/storage/seat promises', () => {
    const all = Object.values(PLAN_USAGE_LIMITS).flat().join(' ');
    expect(all).not.toMatch(/unlimited|workflows?\b|GB|storage|seat|team member/i);
    expect(all).not.toMatch(/\d+\s+(AI\s+)?agents/i);
  });
});
