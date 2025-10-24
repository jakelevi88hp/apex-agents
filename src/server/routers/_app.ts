import { router } from '../trpc';
import { agentsRouter } from './agents';
import { workflowsRouter } from './workflows';

export const appRouter = router({
  agents: agentsRouter,
  workflows: workflowsRouter,
});

export type AppRouter = typeof appRouter;

