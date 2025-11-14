/**
 * Idea generation scheduler.
 *
 * Provides interval-based automation so the system can generate ideas
 * without manual intervention. Safe defaults ensure it can run in
 * environments that support background timers (e.g. long-lived servers).
 */

import { generateAndStoreIdeas } from './service';
import type { IdeaTriggerType } from './types';

type SchedulerState = {
  initialized: boolean;
  intervalId?: ReturnType<typeof setInterval>;
  lastRun?: Date;
  topicIndex: number;
};

const SCHEDULER_SYMBOL = Symbol.for('apexAgents.ideaGeneratorScheduler');
const DEFAULT_TOPICS = [
  'Product experience improvements',
  'Automation ideas for customer success',
  'AI-powered onboarding enhancements',
  'Growth experiments and marketing tests',
  'Developer productivity accelerators',
  'User retention and engagement strategies',
];

const MIN_INTERVAL_MINUTES = 5;

/**
 * Ensures we have a shared mutable scheduler state across hot reloads.
 */
function getSchedulerState(): SchedulerState {
  const globalScope = globalThis as Record<symbol, SchedulerState>;
  if (!globalScope[SCHEDULER_SYMBOL]) {
    globalScope[SCHEDULER_SYMBOL] = {
      initialized: false,
      topicIndex: 0,
    };
  }
  return globalScope[SCHEDULER_SYMBOL];
}

/**
 * Parses comma-separated topics from an environment variable.
 */
function parseCustomTopics(): string[] {
  const raw = process.env.IDEA_GENERATOR_TOPICS;
  if (!raw) {
    return DEFAULT_TOPICS;
  }

  const parsed = raw
    .split(',')
    .map((topic) => topic.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : DEFAULT_TOPICS;
}

/**
 * Starts the autonomous idea generator interval if enabled via environment.
 *
 * @returns Scheduler metadata that can be inspected for debugging.
 */
export function initIdeaGenerationScheduler(): SchedulerState {
  // Avoid scheduling on the client or within serverless functions that
  // do not support long-lived timers.
  if (typeof window !== 'undefined') {
    return {
      initialized: false,
      topicIndex: 0,
    };
  }

  const state = getSchedulerState();
  if (state.initialized) {
    return state;
  }

  state.initialized = true;

  // Environment toggle keeps the scheduler opt-in.
  const autoEnabled =
    (process.env.IDEA_GENERATOR_AUTO ?? 'false').toLowerCase() === 'true';

  if (!autoEnabled) {
    return state;
  }

  const intervalMinutes = Number(
    process.env.IDEA_GENERATOR_INTERVAL_MINUTES ?? '60',
  );
  const safeIntervalMinutes = Number.isFinite(intervalMinutes)
    ? Math.max(MIN_INTERVAL_MINUTES, intervalMinutes)
    : 60;
  const intervalMs = safeIntervalMinutes * 60 * 1000;

  const topics = parseCustomTopics();
  const triggerType: IdeaTriggerType = 'scheduled';
  const defaultCount = Math.max(
    1,
    Math.min(
      10,
      Number(process.env.IDEA_GENERATOR_DEFAULT_COUNT ?? '3') || 3,
    ),
  );

  // Helper to run the scheduled generation with error isolation.
  const runScheduledGeneration = async () => {
    try {
      const topic = topics[state.topicIndex % topics.length];
      await generateAndStoreIdeas({
        topic,
        count: defaultCount,
        triggerType,
      });
      state.lastRun = new Date();
      state.topicIndex = (state.topicIndex + 1) % topics.length;
    } catch (error) {
      console.error('[Idea Scheduler] Generation failed:', error);
    }
  };

  // Schedule the interval and allow Node to exit naturally if needed.
  state.intervalId = setInterval(runScheduledGeneration, intervalMs);
  state.intervalId.unref?.();

  // Optionally run immediately on start for faster feedback loops.
  const runImmediately =
    (process.env.IDEA_GENERATOR_RUN_ON_START ?? 'false').toLowerCase() ===
    'true';
  if (runImmediately) {
    void runScheduledGeneration();
  }

  return state;
}
