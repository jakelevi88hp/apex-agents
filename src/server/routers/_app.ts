import { router } from '../trpc';
import { agentsRouter } from './agents';
import { workflowsRouter } from './workflows';
import { authRouter } from './auth';
import { aiAdminRouter } from './ai-admin';

export const appRouter = router({
  auth: authRouter,
  agents: agentsRouter,
  workflows: workflowsRouter,
  aiAdmin: aiAdminRouter,
});

export type AppRouter = typeof appRouter;

