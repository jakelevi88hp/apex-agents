import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth/jwt';

export const authRouter = router({
  signup: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
    }))
    .mutation(async ({ input }) => {
      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Check if this is the first user (make them admin)
        // Owner email or first user becomes admin
      const ownerEmail = 'jakelevi88hp@gmail.com';
      const userCount = await db.select({ count: sql`count(*)` }).from(users);
      const isFirstUser = Number(userCount[0]?.count || 0) === 0;
      const isOwner = input.email.toLowerCase() === ownerEmail.toLowerCase();

      const [newUser] = await db.insert(users).values({
        email: input.email,
        passwordHash: passwordHash,
        name: input.name,
        role: (isOwner || isFirstUser) ? 'admin' : 'user',
        subscriptionTier: 'trial',
        subscriptionStatus: 'trial',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      }).returning();

      // Generate JWT token
      const token = signToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token,
      };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user || !user.passwordHash) {
        throw new Error('Invalid credentials');
      }

      const validPassword = await bcrypt.compare(input.password, user.passwordHash);

      if (!validPassword) {
        throw new Error('Invalid credentials');
      }

      // Check if this is the owner email and upgrade to admin if needed
      const ownerEmail = 'jakelevi88hp@gmail.com';
      const isOwner = input.email.toLowerCase() === ownerEmail.toLowerCase();
      
      if (isOwner && user.role !== 'admin') {
        // Upgrade owner to admin
        await db.update(users)
          .set({ 
            role: 'admin',
            lastLogin: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
        
        // Update user object for token generation
        user.role = 'admin';
      } else {
        // Update last login
        await db.update(users)
          .set({ lastLogin: new Date() })
          .where(eq(users.id, user.id));
      }

      // Generate JWT token
      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        token,
      };
    }),

  me: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, ctx.userId!),
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
      };
    }),
});

