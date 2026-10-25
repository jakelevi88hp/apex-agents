import { PLAN_LIMITS, TRIAL_DURATION_DAYS, type SubscriptionPlan } from './config';

// User-facing plan limits. Only limits the app actually enforces are listed:
// - AI messages: usage_tracking 'agi_messages' row (SubscriptionService.usageFeatures),
//   checked in /api/agi/process and reset on the 1st of each month (UTC).
// - Trial end: entitlements.ts blocks creating and running after TRIAL_DURATION_DAYS.
// Agent/workflow/storage/seat numbers are omitted on purpose: they are not enforced
// in production (concurrent caps only apply when ENFORCE_CONCURRENT_LIMITS=true).
// /pricing is the source of truth for this copy; keep every surface on these strings.
const fmt = (n: number) => n.toLocaleString('en-US');

export const PLAN_USAGE_LIMITS: Record<SubscriptionPlan, readonly string[]> = {
  trial: [
    `${fmt(PLAN_LIMITS.trial.agiMessages)} AI messages during the ${TRIAL_DURATION_DAYS}-day trial`,
    `After ${TRIAL_DURATION_DAYS} days, creating and running agents pauses until you upgrade. Your agents and history stay saved.`,
  ],
  premium: [`${fmt(PLAN_LIMITS.premium.agiMessages)} AI messages per month`],
  pro: [`${fmt(PLAN_LIMITS.pro.agiMessages)} AI messages per month`],
};

export const AI_MESSAGE_RESET_NOTE =
  'AI message allowances reset on the 1st of each month (UTC). Unused messages do not roll over.';
