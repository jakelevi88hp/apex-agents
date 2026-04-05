/**
 * tRPC Client Configuration
 *
 * Re-exports the canonical tRPC instance so that every component in the app
 * shares the same React context, regardless of whether they import from
 * '@/lib/trpc' or '@/lib/trpc/client'.  Previously this file created a
 * *second* independent createTRPCReact instance which broke context for any
 * component that imported from this path (settings, workflows, pricing,
 * SubscriptionBanner, UsageDisplay, WorkflowBuilder).
 */
export { trpc, TRPCProvider } from '@/lib/trpc/client';
