import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { db } from '@/lib/db';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth/jwt';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => {
      const token = extractTokenFromRequest(req);
      const payload = token ? verifyToken(token) : null;
      return {
        db,
        userId: payload?.userId,
      };
    },
  });

export { handler as GET, handler as POST };

