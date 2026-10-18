/**
 * Unit tests for trial-expiry gating and concurrent agent/workflow caps.
 */
import { assertCanCreate, assertCanRun, getEntitlement, concurrentLimitsEnabled } from '@/lib/subscription/entitlements';
import { db } from '@/lib/db';

jest.mock('@/lib/db', () => ({ db: { select: jest.fn() } }));

const DAY = 24 * 60 * 60 * 1000;
type U = { tier: string | null; status: string | null; trialEndDate: Date | null };

function mockUser(u: U | undefined, rowCount?: number) {
  (db.select as jest.Mock).mockReturnValueOnce({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(u ? [u] : []) }),
    }),
  });
  if (rowCount !== undefined) {
    (db.select as jest.Mock).mockReturnValueOnce({
      from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([{ n: rowCount }]) }),
    });
  }
}

const activeTrial: U = { tier: 'trial', status: 'active', trialEndDate: new Date(Date.now() + DAY) };
const expiredTrial: U = { tier: 'trial', status: 'active', trialEndDate: new Date(Date.now() - DAY) };
const paidPremium: U = { tier: 'premium', status: 'active', trialEndDate: new Date(Date.now() - DAY) };

describe('entitlements', () => {
  const env = process.env.ENFORCE_CONCURRENT_LIMITS;
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ENFORCE_CONCURRENT_LIMITS;
  });
  afterAll(() => {
    if (env === undefined) delete process.env.ENFORCE_CONCURRENT_LIMITS;
    else process.env.ENFORCE_CONCURRENT_LIMITS = env;
  });

  it('concurrent caps are OFF by default', () => {
    expect(concurrentLimitsEnabled()).toBe(false);
    process.env.ENFORCE_CONCURRENT_LIMITS = 'true';
    expect(concurrentLimitsEnabled()).toBe(true);
  });

  it('classifies trial / expired / paid users', async () => {
    mockUser(activeTrial);
    expect(await getEntitlement('u')).toEqual({ plan: 'trial', paidActive: false, trialExpired: false });
    mockUser(expiredTrial);
    expect(await getEntitlement('u')).toEqual({ plan: 'trial', paidActive: false, trialExpired: true });
    mockUser(paidPremium);
    expect(await getEntitlement('u')).toEqual({ plan: 'premium', paidActive: true, trialExpired: false });
    mockUser({ tier: 'pro', status: 'canceled', trialEndDate: new Date(Date.now() - DAY) });
    expect(await getEntitlement('u')).toMatchObject({ plan: 'trial', trialExpired: true });
  });

  it('blocks runs and creation for an expired trial with an upgrade message', async () => {
    mockUser(expiredTrial);
    await expect(assertCanRun('u')).rejects.toMatchObject({ code: 'FORBIDDEN', message: expect.stringContaining('/pricing') });
    mockUser(expiredTrial);
    await expect(assertCanCreate('u', 'agents')).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('flag OFF: no row count, creation allowed', async () => {
    mockUser(activeTrial);
    await expect(assertCanCreate('u', 'agents')).resolves.toBeUndefined();
    expect(db.select).toHaveBeenCalledTimes(1);
  });

  it('flag ON: trial capped at 10 agents / 5 workflows; premium at 50 agents', async () => {
    process.env.ENFORCE_CONCURRENT_LIMITS = 'true';
    mockUser(activeTrial, 9);
    await expect(assertCanCreate('u', 'agents')).resolves.toBeUndefined();
    mockUser(activeTrial, 10);
    await expect(assertCanCreate('u', 'agents')).rejects.toMatchObject({ code: 'FORBIDDEN', message: expect.stringContaining('10/10') });
    mockUser(activeTrial, 5);
    await expect(assertCanCreate('u', 'workflows')).rejects.toMatchObject({ code: 'FORBIDDEN' });
    mockUser(paidPremium, 10);
    await expect(assertCanCreate('u', 'agents')).resolves.toBeUndefined();
  });
});
