/**
 * Settings tRPC Router
 * 
 * Manages user settings, API keys, and team management
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '@/lib/db';
import { users, apiKeys, userSettings, teamMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export const settingsRouter = router({
  /**
   * Get user settings
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    if (!settings) {
      // Create default settings if they don't exist
      const [newSettings] = await db
        .insert(userSettings)
        .values({
          userId,
          organizationName: 'My Organization',
          email: ctx.user?.email || '',
          timezone: 'UTC-5',
          emailNotifications: true,
          realtimeMonitoring: true,
          autoRetry: false,
        })
        .returning();

      return newSettings;
    }

    return settings;
  }),

  /**
   * Update user settings
   */
  updateSettings: protectedProcedure
    .input(
      z.object({
        organizationName: z.string().optional(),
        email: z.string().email().optional(),
        timezone: z.string().optional(),
        emailNotifications: z.boolean().optional(),
        realtimeMonitoring: z.boolean().optional(),
        autoRetry: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if settings exist
      const [existing] = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId));

      if (!existing) {
        // Create new settings
        const [settings] = await db
          .insert(userSettings)
          .values({
            userId,
            ...input,
          })
          .returning();

        return settings;
      }

      // Update existing settings
      const [settings] = await db
        .update(userSettings)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, userId))
        .returning();

      return settings;
    }),

  /**
   * List API keys
   */
  listApiKeys: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        environment: apiKeys.environment,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
      })
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.revoked, false)));

    return keys;
  }),

  /**
   * Create new API key
   */
  createApiKey: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        environment: z.enum(['production', 'development', 'test']),
        expiresInDays: z.number().min(1).max(365).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Generate API key
      const keyValue = `sk_${input.environment === 'production' ? 'live' : 'test'}_${randomBytes(32).toString('hex')}`;
      const keyPrefix = keyValue.substring(0, 12);

      const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const [key] = await db
        .insert(apiKeys)
        .values({
          userId,
          name: input.name,
          keyValue,
          keyPrefix,
          environment: input.environment,
          expiresAt,
        })
        .returning();

      return {
        id: key.id,
        name: key.name,
        keyValue, // Only returned on creation
        keyPrefix: key.keyPrefix,
        environment: key.environment,
        createdAt: key.createdAt,
        expiresAt: key.expiresAt,
      };
    }),

  /**
   * Revoke API key
   */
  revokeApiKey: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      await db
        .update(apiKeys)
        .set({
          revoked: true,
          revokedAt: new Date(),
        })
        .where(and(eq(apiKeys.id, input.id), eq(apiKeys.userId, userId)));

      return { success: true };
    }),

  /**
   * Get AI model configuration
   */
  getModelConfig: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    return {
      openaiApiKey: settings?.openaiApiKey || '',
      anthropicApiKey: settings?.anthropicApiKey || '',
      defaultModel: settings?.defaultModel || 'gpt-4-turbo',
    };
  }),

  /**
   * Update AI model configuration
   */
  updateModelConfig: protectedProcedure
    .input(
      z.object({
        openaiApiKey: z.string().optional(),
        anthropicApiKey: z.string().optional(),
        defaultModel: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if settings exist
      const [existing] = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId));

      if (!existing) {
        // Create new settings
        const [settings] = await db
          .insert(userSettings)
          .values({
            userId,
            ...input,
          })
          .returning();

        return settings;
      }

      // Update existing settings
      const [settings] = await db
        .update(userSettings)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, userId))
        .returning();

      return settings;
    }),

  /**
   * Get billing information
   */
  getBillingInfo: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    // Mock billing data for now
    // In production, this would integrate with Stripe or another payment provider
    return {
      plan: 'Pro Plan',
      price: 97,
      currency: 'USD',
      billingCycle: 'monthly',
      usage: {
        executions: 12847,
        apiCalls: 45231,
        storageGB: 8.7,
        aiModelCosts: 247.32,
      },
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
      },
    };
  }),

  /**
   * List team members
   */
  listTeamMembers: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    const members = await db
      .select({
        id: teamMembers.id,
        userId: teamMembers.memberId,
        name: users.name,
        email: users.email,
        role: teamMembers.role,
        joinedAt: teamMembers.createdAt,
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.memberId, users.id))
      .where(eq(teamMembers.ownerId, userId));

    // Add the owner
    const [owner] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (owner) {
      return [
        {
          id: owner.id,
          userId: owner.id,
          name: owner.name,
          email: owner.email,
          role: 'owner' as const,
          joinedAt: new Date(),
        },
        ...members,
      ];
    }

    return members;
  }),

  /**
   * Invite team member
   */
  inviteTeamMember: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(['admin', 'member']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user exists
      const [invitedUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email));

      if (!invitedUser) {
        throw new Error('User not found. They must create an account first.');
      }

      // Check if already a member
      const [existing] = await db
        .select()
        .from(teamMembers)
        .where(
          and(eq(teamMembers.ownerId, userId), eq(teamMembers.memberId, invitedUser.id))
        );

      if (existing) {
        throw new Error('User is already a team member');
      }

      // Add team member
      const [member] = await db
        .insert(teamMembers)
        .values({
          ownerId: userId,
          memberId: invitedUser.id,
          role: input.role,
        })
        .returning();

      return member;
    }),

  /**
   * Update team member role
   */
  updateTeamMemberRole: protectedProcedure
    .input(
      z.object({
        memberId: z.string().uuid(),
        role: z.enum(['admin', 'member']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      await db
        .update(teamMembers)
        .set({
          role: input.role,
          updatedAt: new Date(),
        })
        .where(
          and(eq(teamMembers.ownerId, userId), eq(teamMembers.memberId, input.memberId))
        );

      return { success: true };
    }),

  /**
   * Remove team member
   */
  removeTeamMember: protectedProcedure
    .input(
      z.object({
        memberId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      await db
        .delete(teamMembers)
        .where(
          and(eq(teamMembers.ownerId, userId), eq(teamMembers.memberId, input.memberId))
        );

      return { success: true };
    }),
});

