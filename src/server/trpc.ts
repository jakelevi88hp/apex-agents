import { initTRPC, TRPCError } from '@trpc/server';
import { db } from '@/lib/db';
import superjson from 'superjson';

interface Context {
  db: typeof db;
  userId?: string;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

