import { router } from '../trpc';
import { agentsRouter } from './agents';
import { workflowsRouter } from './workflows';
import { authRouter } from './auth';
import { aiAdminRouter } from './ai-admin';
import { analyticsRouter } from './analytics';

export const appRouter = router({
  auth: authRouter,
  agents: agentsRouter,
  workflows: workflowsRouter,
  aiAdmin: aiAdminRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;

