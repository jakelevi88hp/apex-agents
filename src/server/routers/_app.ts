import { router } from '../trpc';
import { agentsRouter } from './agents';
import { workflowsRouter } from './workflows';
import { authRouter } from './auth';
import { aiAdminRouter } from './ai-admin';
import { analyticsRouter } from './analytics';
import { searchRouter } from './search';

export const appRouter = router({
  auth: authRouter,
  agents: agentsRouter,
  workflows: workflowsRouter,
  aiAdmin: aiAdminRouter,
  analytics: analyticsRouter,
  search: searchRouter,
});

export type AppRouter = typeof appRouter;

