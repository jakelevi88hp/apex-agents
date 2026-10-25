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
  // Admins are exempt from trial expiry and from the always-on trial agent cap. Their plan
  // (and therefore the flag-gated concurrent
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

/** Count of the user's existing agents or workflows (deleting one frees a slot). */
async function countOwned(userId: string, resource: 'agents' | 'workflows'): Promise<number> {
  const table = resource === 'agents' ? agents : workflows;
  const [{ n }] = await db
    .select({ n: count() })
    .from(table)
    .where(and(eq(table.userId, userId)));
  return Number(n);
}

export const TRIAL_AGENT_LIMIT = PLAN_LIMITS.trial.agents;

export function trialAgentLimitMessage(n: number): string {
  return `Trial accounts can have up to ${TRIAL_AGENT_LIMIT} agents (${n}/${TRIAL_AGENT_LIMIT}). Delete an agent or upgrade at /pricing to add more.`;
}

/**
 * Block creation after trial end; always cap trial (non-admin) accounts at the trial
 * agent limit; and (when ENFORCE_CONCURRENT_LIMITS=true) apply every plan's concurrent cap.
 * Existing agents are never touched -- only new ones are refused.
 */
export async function assertCanCreate(userId: string, resource: 'agents' | 'workflows'): Promise<void> {
  const ent = await getEntitlement(userId);
  if (ent.trialExpired) {
    throw new TRPCError({ code: 'FORBIDDEN', message: TRIAL_EXPIRED_MESSAGE });
  }

  if (concurrentLimitsEnabled()) {
    const limit = PLAN_LIMITS[ent.plan][resource];
    const n = await countOwned(userId, resource);
    if (n >= limit) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You've reached your plan's limit of ${limit} ${resource} (${n}/${limit}). Delete one or upgrade at /pricing.`,
      });
    }
    return;
  }

  // Always on (no flag): trial accounts may not exceed the trial agent limit.
  // Premium/Pro are not capped here; admins are exempt (as with trial expiry).
  if (resource === 'agents' && ent.plan === 'trial' && !ent.isAdmin) {
    const n = await countOwned(userId, 'agents');
    if (n >= TRIAL_AGENT_LIMIT) {
      throw new TRPCError({ code: 'FORBIDDEN', message: trialAgentLimitMessage(n) });
    }
  }
}
