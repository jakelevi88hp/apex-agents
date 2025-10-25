import { router } from '../trpc';
import { agentsRouter } from './agents';
import { workflowsRouter } from './workflows';
import { authRouter } from './auth';

export const appRouter = router({
  auth: authRouter,
  agents: agentsRouter,
  workflows: workflowsRouter,
});

export type AppRouter = typeof appRouter;

