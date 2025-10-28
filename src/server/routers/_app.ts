import { router } from '../trpc';
import { agentsRouter } from './agents';
import { workflowsRouter } from './workflows';
import { authRouter } from './auth';
import { aiAdminRouter } from './ai-admin';
import { analyticsRouter } from './analytics';
import { executionRouter } from './execution';
// import { searchRouter } from './search'; // TODO: Disabled until documents/embeddings tables are created

export const appRouter = router({
  auth: authRouter,
  agents: agentsRouter,
  workflows: workflowsRouter,
  aiAdmin: aiAdminRouter,
  analytics: analyticsRouter,
  execution: executionRouter,
  // search: searchRouter, // TODO: Disabled until documents/embeddings tables are created
});

export type AppRouter = typeof appRouter;

