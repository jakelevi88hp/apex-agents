import { TRPCError } from '@trpc/server';
import { and, count, eq } from 'drizzle-orm';
import { db } from '../db';
import { agents, users, workflows } from '../db/schema';
import { PLAN_LIMITS, type SubscriptionPlan } from './config';

/**
 * Concurrent agent/workflow caps (count of the user's existing rows, so deleting
 * frees a slot). OFF by default until agent delete is verified live; turn on with
 * ENFORCE_CONCURRENT_LIMITS=true.
 */
export function concurrentLimitsEnabled(): boolean {
  return process.env.ENFORCE_CONCURRENT_LIMITS === 'true';
}

export const TRIAL_EXPIRED_MESSAGE =
  'Your free trial has ended. Upgrade at /pricing to create and run agents. Your existing agents, workflows and history are still available.';

export type Entitlement = {
  plan: SubscriptionPlan; // plan whose limits apply right now
  paidActive: boolean;
  trialExpired: boolean; // true => creation and new runs are blocked
  isAdmin: boolean; // role=admin is exempt from trial expiry only (caps unchanged)
};

/** Read straight from users (uncached) so a webhook upgrade takes effect immediately. */
export async function getEntitlement(userId: string): Promise<Entitlement> {
  const [u] = await db
    .select({
      tier: users.subscriptionTier,
      status: users.subscriptionStatus,
      trialEndDate: users.trialEndDate,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!u) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
  }

  const paidActive =
    (u.tier === 'premium' || u.tier === 'pro') && (u.status === 'active' || u.status === 'past_due');
  const isAdmin = u.role === 'admin';
  // Admins are exempt from trial expiry only. Their plan (and therefore the concurrent
  // caps when enabled, and the monthly AI-message cap) is unchanged.
  const trialExpired =
    !isAdmin && !paidActive && !!u.trialEndDate && u.trialEndDate.getTime() < Date.now();

  return {
    plan: paidActive ? (u.tier as SubscriptionPlan) : 'trial',
    paidActive,
    trialExpired,
    isAdmin,
  };
}

/** Block new runs (agents.execute, execution.execute, workflows.execute, AI messages) after trial end. */
export async function assertCanRun(userId: string): Promise<Entitlement> {
  const ent = await getEntitlement(userId);
  if (ent.trialExpired) {
    throw new TRPCError({ code: 'FORBIDDEN', message: TRIAL_EXPIRED_MESSAGE });
  }
  return ent;
}

/** Block creation after trial end, and (when enabled) at the plan's concurrent cap. */
export async function assertCanCreate(userId: string, resource: 'agents' | 'workflows'): Promise<void> {
  const ent = await getEntitlement(userId);
  if (ent.trialExpired) {
    throw new TRPCError({ code: 'FORBIDDEN', message: TRIAL_EXPIRED_MESSAGE });
  }
  if (!concurrentLimitsEnabled()) return;

  const limit = PLAN_LIMITS[ent.plan][resource];
  const table = resource === 'agents' ? agents : workflows;
  const [{ n }] = await db
    .select({ n: count() })
    .from(table)
    .where(and(eq(table.userId, userId)));

  if (n >= limit) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You've reached your plan's limit of ${limit} ${resource} (${n}/${limit}). Delete one or upgrade at /pricing.`,
    });
  }
}
