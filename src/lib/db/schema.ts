import { pgTable, text, timestamp, uuid, varchar, integer, decimal, jsonb, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Export subscription tables
export * from './schema/subscriptions';

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 320 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: text('name'),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  organizationId: uuid('organization_id'),
  subscriptionTier: varchar('subscription_tier', { length: 20 }).default('trial').notNull(),
  trialStartDate: timestamp('trial_start_date').defaultNow(),
  trialEndDate: timestamp('trial_end_date'),
  subscriptionStatus: varchar('subscription_status', { length: 20 }).default('trial').notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  apiKey: varchar('api_key', { length: 255 }),
  preferences: jsonb('preferences'),
  resetToken: varchar('reset_token', { length: 255 }),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  orgIdx: index('users_org_idx').on(table.organizationId),
}));

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  plan: varchar('plan', { length: 20 }).default('starter').notNull(),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// AGENTS
// ============================================================================

export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // research, analysis, writing, code, decision, communication, monitoring, orchestrator
  config: jsonb('config').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  version: integer('version').default(1).notNull(),
  performanceMetrics: jsonb('performance_metrics'),
  learningData: jsonb('learning_data'),
  capabilities: jsonb('capabilities'),
  constraints: jsonb('constraints'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('agents_user_idx').on(table.userId),
  typeIdx: index('agents_type_idx').on(table.type),
  statusIdx: index('agents_status_idx').on(table.status),
}));

export const agentTools = pgTable('agent_tools', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  toolName: varchar('tool_name', { length: 100 }).notNull(),
  toolType: varchar('tool_type', { length: 50 }).notNull(), // api, function, integration
  config: jsonb('config').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// WORKFLOWS
// ============================================================================

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  trigger: jsonb('trigger').notNull(), // schedule, event, manual, webhook
  steps: jsonb('steps').notNull(),
  agents: jsonb('agents').notNull(),
  conditions: jsonb('conditions'),
  errorHandling: jsonb('error_handling'),
  status: varchar('status', { length: 20 }).default('draft').notNull(),
  executionCount: integer('execution_count').default(0).notNull(),
  lastExecution: timestamp('last_execution'),
  averageDuration: integer('average_duration_ms'),
  successRate: decimal('success_rate', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('workflows_user_idx').on(table.userId),
  statusIdx: index('workflows_status_idx').on(table.status),
}));

export const executions = pgTable('executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').references(() => workflows.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').references(() => agents.id),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // running, completed, failed, cancelled
  inputData: jsonb('input_data'),
  outputData: jsonb('output_data'),
  errorMessage: text('error_message'),
  errorStack: text('error_stack'),
  durationMs: integer('duration_ms'),
  costUsd: decimal('cost_usd', { precision: 10, scale: 4 }),
  tokensUsed: integer('tokens_used'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  workflowIdx: index('executions_workflow_idx').on(table.workflowId),
  userIdx: index('executions_user_idx').on(table.userId),
  statusIdx: index('executions_status_idx').on(table.status),
  startedIdx: index('executions_started_idx').on(table.startedAt),
}));

export const executionSteps = pgTable('execution_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  executionId: uuid('execution_id').references(() => executions.id, { onDelete: 'cascade' }).notNull(),
  stepIndex: integer('step_index').notNull(),
  agentId: uuid('agent_id').references(() => agents.id),
  status: varchar('status', { length: 20 }).notNull(),
  inputData: jsonb('input_data'),
  outputData: jsonb('output_data'),
  errorMessage: text('error_message'),
  durationMs: integer('duration_ms'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// ============================================================================
// KNOWLEDGE BASE & DATA
// ============================================================================

export const knowledgeBase = pgTable('knowledge_base', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  sourceType: varchar('source_type', { length: 50 }).notNull(), // file, api, database, web, email
  sourceId: varchar('source_id', { length: 255 }),
  sourceName: text('source_name'),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  embeddingId: varchar('embedding_id', { length: 255 }),
  vectorNamespace: varchar('vector_namespace', { length: 100 }),
  tags: jsonb('tags'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('knowledge_user_idx').on(table.userId),
  sourceIdx: index('knowledge_source_idx').on(table.sourceType, table.sourceId),
  embeddingIdx: index('knowledge_embedding_idx').on(table.embeddingId),
}));

export const dataConnectors = pgTable('data_connectors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // google_drive, salesforce, github, etc.
  credentials: jsonb('credentials').notNull(), // encrypted
  config: jsonb('config'),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  lastSync: timestamp('last_sync'),
  syncFrequency: varchar('sync_frequency', { length: 20 }), // hourly, daily, weekly
  itemsCount: integer('items_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// VERIFICATION & TRUST
// ============================================================================

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  executionId: uuid('execution_id').references(() => executions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  claim: text('claim').notNull(),
  sources: jsonb('sources').notNull(),
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }),
  verificationStatus: varchar('verification_status', { length: 20 }).notNull(), // verified, unverified, disputed, pending
  evidence: jsonb('evidence'),
  factCheckResults: jsonb('fact_check_results'),
  nliResults: jsonb('nli_results'),
  sourceReliability: jsonb('source_reliability'),
  humanReviewed: boolean('human_reviewed').default(false).notNull(),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  executionIdx: index('verifications_execution_idx').on(table.executionId),
  userIdx: index('verifications_user_idx').on(table.userId),
  statusIdx: index('verifications_status_idx').on(table.verificationStatus),
}));

export const provenanceTrail = pgTable('provenance_trail', {
  id: uuid('id').primaryKey().defaultRandom(),
  verificationId: uuid('verification_id').references(() => verifications.id, { onDelete: 'cascade' }).notNull(),
  sourceUrl: text('source_url'),
  sourceType: varchar('source_type', { length: 50 }).notNull(),
  sourceTimestamp: timestamp('source_timestamp'),
  contentHash: varchar('content_hash', { length: 64 }).notNull(),
  blockchainTxId: varchar('blockchain_tx_id', { length: 255 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// AGENT SWARMS & COLLABORATION
// ============================================================================

export const swarms = pgTable('swarms', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  topology: varchar('topology', { length: 50 }).notNull(), // hierarchical, democratic, competitive, collaborative
  agents: jsonb('agents').notNull(),
  coordinationStrategy: jsonb('coordination_strategy'),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  performanceMetrics: jsonb('performance_metrics'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const agentCommunications = pgTable('agent_communications', {
  id: uuid('id').primaryKey().defaultRandom(),
  swarmId: uuid('swarm_id').references(() => swarms.id, { onDelete: 'cascade' }),
  fromAgentId: uuid('from_agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  toAgentId: uuid('to_agent_id').references(() => agents.id, { onDelete: 'cascade' }),
  messageType: varchar('message_type', { length: 50 }).notNull(), // task, result, question, coordination
  content: jsonb('content').notNull(),
  priority: integer('priority').default(5).notNull(),
  status: varchar('status', { length: 20 }).default('sent').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
});

// ============================================================================
// LEARNING & IMPROVEMENT
// ============================================================================

export const learningEvents = pgTable('learning_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  executionId: uuid('execution_id').references(() => executions.id),
  eventType: varchar('event_type', { length: 50 }).notNull(), // success, failure, feedback, optimization
  context: jsonb('context').notNull(),
  outcome: jsonb('outcome'),
  feedback: jsonb('feedback'),
  improvementApplied: boolean('improvement_applied').default(false).notNull(),
  improvementDetails: jsonb('improvement_details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const modelFineTuning = pgTable('model_fine_tuning', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  baseModel: varchar('base_model', { length: 100 }).notNull(),
  fineTunedModelId: varchar('fine_tuned_model_id', { length: 255 }),
  trainingDatasetId: uuid('training_dataset_id'),
  status: varchar('status', { length: 20 }).notNull(), // pending, training, completed, failed
  hyperparameters: jsonb('hyperparameters'),
  metrics: jsonb('metrics'),
  costUsd: decimal('cost_usd', { precision: 10, scale: 2 }),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// ANALYTICS & MONITORING
// ============================================================================

export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  resourceType: varchar('resource_type', { length: 50 }).notNull(), // agent, workflow, api
  resourceId: uuid('resource_id'),
  action: varchar('action', { length: 100 }).notNull(),
  metadata: jsonb('metadata'),
  tokensUsed: integer('tokens_used'),
  costUsd: decimal('cost_usd', { precision: 10, scale: 4 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('usage_user_idx').on(table.userId),
  timestampIdx: index('usage_timestamp_idx').on(table.timestamp),
  resourceIdx: index('usage_resource_idx').on(table.resourceType, table.resourceId),
}));

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // error, warning, info, success
  title: text('title').notNull(),
  message: text('message').notNull(),
  severity: varchar('severity', { length: 20 }).default('medium').notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: uuid('resource_id'),
  actionRequired: boolean('action_required').default(false).notNull(),
  resolved: boolean('resolved').default(false).notNull(),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// USER SETTINGS & API KEYS
// ============================================================================

export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  organizationName: text('organization_name'),
  email: varchar('email', { length: 320 }),
  timezone: varchar('timezone', { length: 50 }).default('UTC-5'),
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  realtimeMonitoring: boolean('realtime_monitoring').default(true).notNull(),
  autoRetry: boolean('auto_retry').default(false).notNull(),
  openaiApiKey: text('openai_api_key'),
  anthropicApiKey: text('anthropic_api_key'),
  defaultModel: varchar('default_model', { length: 100 }).default('gpt-4-turbo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  keyValue: text('key_value').notNull(),
  keyPrefix: varchar('key_prefix', { length: 20 }).notNull(),
  environment: varchar('environment', { length: 20 }).notNull(), // production, development, test
  revoked: boolean('revoked').default(false).notNull(),
  revokedAt: timestamp('revoked_at'),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('api_keys_user_idx').on(table.userId),
  keyPrefixIdx: index('api_keys_prefix_idx').on(table.keyPrefix),
}));

export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  memberId: uuid('member_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // admin, member
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index('team_members_owner_idx').on(table.ownerId),
  memberIdx: index('team_members_member_idx').on(table.memberId),
}));

// ============================================================================
// SUBSCRIPTIONS & BILLING
// ============================================================================

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  status: varchar('status', { length: 20 }).notNull(),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  agents: many(agents),
  workflows: many(workflows),
  executions: many(executions),
  knowledgeBase: many(knowledgeBase),
  subscriptions: many(subscriptions),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
  tools: many(agentTools),
  executions: many(executions),
  learningEvents: many(learningEvents),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  user: one(users, {
    fields: [workflows.userId],
    references: [users.id],
  }),
  executions: many(executions),
}));

export const executionsRelations = relations(executions, ({ one, many }) => ({
  workflow: one(workflows, {
    fields: [executions.workflowId],
    references: [workflows.id],
  }),
  agent: one(agents, {
    fields: [executions.agentId],
    references: [agents.id],
  }),
  user: one(users, {
    fields: [executions.userId],
    references: [users.id],
  }),
  steps: many(executionSteps),
  verifications: many(verifications),
}));

