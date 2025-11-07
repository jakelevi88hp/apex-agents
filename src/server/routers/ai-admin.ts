import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const aiAdminRouter = router({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await ctx.db.select().from('conversations').where('userId', ctx.userId);
    return conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      timestamp: conv.createdAt,
    }));
  }),
  // other procedures...
});
