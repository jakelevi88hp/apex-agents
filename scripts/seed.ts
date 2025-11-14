/**
 * Database Seed Script
 * 
 * Seeds the database with realistic test data for development and staging environments.
 * 
 * Usage:
 *   npx tsx scripts/seed.ts
 * 
 * Environment Variables:
 *   DATABASE_URL - PostgreSQL connection string
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';
import * as schema from '../src/lib/db/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Seed data
const SEED_DATA = {
  users: [
    {
      email: 'admin@apexagents.test',
      password: 'Admin123!',
      name: 'Admin User',
      role: 'admin',
      subscriptionTier: 'enterprise',
      subscriptionStatus: 'active',
    },
    {
      email: 'test@apexagents.test',
      password: 'Test123!',
      name: 'Test User',
      role: 'user',
      subscriptionTier: 'pro',
      subscriptionStatus: 'active',
    },
    {
      email: 'demo@apexagents.test',
      password: 'Demo123!',
      name: 'Demo User',
      role: 'user',
      subscriptionTier: 'trial',
      subscriptionStatus: 'trial',
    },
  ],
  organizations: [
    {
      name: 'Apex Advantage Trust',
      slug: 'apex-advantage-trust',
      plan: 'enterprise',
      settings: {
        allowedDomains: ['apexagents.test'],
        features: ['agents', 'workflows', 'knowledge', 'analytics', 'ai-admin'],
      },
    },
    {
      name: 'Demo Organization',
      slug: 'demo-org',
      plan: 'pro',
      settings: {
        features: ['agents', 'workflows', 'knowledge'],
      },
    },
  ],
  agentTemplates: [
    {
      name: 'Research Agent',
      description: 'Conducts comprehensive research on any topic with verified sources',
      type: 'research',
      config: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 4000,
        tools: ['web_search', 'fact_check', 'source_verification'],
      },
      capabilities: {
        research: true,
        factChecking: true,
        sourceVerification: true,
        summarization: true,
      },
      constraints: {
        maxSources: 10,
        requireVerification: true,
        minConfidenceScore: 0.8,
      },
    },
    {
      name: 'Data Analysis Agent',
      description: 'Analyzes data and generates insights with visualizations',
      type: 'analysis',
      config: {
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 3000,
        tools: ['data_analysis', 'visualization', 'statistical_testing'],
      },
      capabilities: {
        dataAnalysis: true,
        visualization: true,
        statisticalAnalysis: true,
        patternRecognition: true,
      },
      constraints: {
        maxDataPoints: 100000,
        supportedFormats: ['csv', 'json', 'excel'],
      },
    },
    {
      name: 'Content Writer Agent',
      description: 'Creates high-quality content with proper citations',
      type: 'writing',
      config: {
        model: 'gpt-4',
        temperature: 0.8,
        maxTokens: 5000,
        tools: ['grammar_check', 'plagiarism_check', 'citation_generator'],
      },
      capabilities: {
        contentGeneration: true,
        editing: true,
        citationManagement: true,
        styleAdaptation: true,
      },
      constraints: {
        maxLength: 10000,
        requireCitations: true,
        minReadabilityScore: 60,
      },
    },
  ],
  workflowTemplates: [
    {
      name: 'Research & Report Workflow',
      description: 'Automated research and report generation pipeline',
      trigger: {
        type: 'manual',
        schedule: null,
      },
      steps: [
        {
          id: 'research',
          name: 'Conduct Research',
          agentType: 'research',
          action: 'research_topic',
        },
        {
          id: 'verify',
          name: 'Verify Facts',
          agentType: 'research',
          action: 'verify_claims',
        },
        {
          id: 'write',
          name: 'Write Report',
          agentType: 'writing',
          action: 'generate_report',
        },
      ],
      agents: ['research', 'writing'],
      conditions: {
        minConfidence: 0.8,
        requireVerification: true,
      },
      errorHandling: {
        retryAttempts: 3,
        fallbackStrategy: 'notify_user',
      },
    },
  ],
  knowledgeBaseSamples: [
    {
      sourceType: 'web',
      sourceName: 'AI Safety Research',
      content: 'Artificial intelligence safety research focuses on ensuring AI systems remain beneficial and aligned with human values as they become more capable.',
      metadata: {
        url: 'https://example.com/ai-safety',
        author: 'AI Safety Institute',
        publishedDate: '2024-01-15',
      },
      tags: ['ai', 'safety', 'research'],
    },
    {
      sourceType: 'file',
      sourceName: 'Company Handbook',
      content: 'Our company values transparency, innovation, and ethical AI development. We believe in building AI systems that augment human capabilities rather than replace them.',
      metadata: {
        fileName: 'handbook.pdf',
        uploadedDate: '2024-02-01',
      },
      tags: ['company', 'values', 'handbook'],
    },
  ],
};

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Check if database is empty
    const existingUsers = await db.select().from(schema.users).limit(1);
    if (existingUsers.length > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.');
      console.log('   To re-seed, first clear the database.\n');
      return;
    }

    // Seed Organizations
    console.log('📦 Seeding organizations...');
    const orgs = await db.insert(schema.organizations)
      .values(SEED_DATA.organizations)
      .returning();
    console.log(`   ✓ Created ${orgs.length} organizations\n`);

    // Seed Users
    console.log('👤 Seeding users...');
    const users = [];
    for (const userData of SEED_DATA.users) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const user = await db.insert(schema.users)
        .values({
          email: userData.email,
          passwordHash,
          name: userData.name,
          role: userData.role,
          organizationId: orgs[0].id,
          subscriptionTier: userData.subscriptionTier,
          subscriptionStatus: userData.subscriptionStatus,
        })
        .returning();
      users.push(user[0]);
      console.log(`   ✓ Created user: ${userData.email}`);
    }
    console.log();

    // Seed Agents
    console.log('🤖 Seeding agents...');
    const agents = [];
    for (const template of SEED_DATA.agentTemplates) {
      const agent = await db.insert(schema.agents)
        .values({
          userId: users[0].id,
          organizationId: orgs[0].id,
          name: template.name,
          description: template.description,
          type: template.type,
          config: template.config,
          status: 'active',
          capabilities: template.capabilities,
          constraints: template.constraints,
        })
        .returning();
      agents.push(agent[0]);
      console.log(`   ✓ Created agent: ${template.name}`);
    }
    console.log();

    // Seed Workflows
    console.log('🔄 Seeding workflows...');
    for (const workflowTemplate of SEED_DATA.workflowTemplates) {
      await db.insert(schema.workflows)
        .values({
          userId: users[0].id,
          organizationId: orgs[0].id,
          name: workflowTemplate.name,
          description: workflowTemplate.description,
          trigger: workflowTemplate.trigger,
          steps: workflowTemplate.steps,
          agents: workflowTemplate.agents,
          conditions: workflowTemplate.conditions,
          errorHandling: workflowTemplate.errorHandling,
          status: 'active',
        });
      console.log(`   ✓ Created workflow: ${workflowTemplate.name}`);
    }
    console.log();

    // Seed Knowledge Base
    console.log('📚 Seeding knowledge base...');
    for (const kb of SEED_DATA.knowledgeBaseSamples) {
      await db.insert(schema.knowledgeBase)
        .values({
          userId: users[0].id,
          organizationId: orgs[0].id,
          sourceType: kb.sourceType,
          sourceName: kb.sourceName,
          content: kb.content,
          metadata: kb.metadata,
          tags: kb.tags,
        });
      console.log(`   ✓ Created knowledge entry: ${kb.sourceName}`);
    }
    console.log();

    // Create sample execution
    console.log('⚡ Creating sample execution...');
    await db.insert(schema.executions)
      .values({
        workflowId: null,
        agentId: agents[0].id,
        userId: users[0].id,
        status: 'completed',
        inputData: { query: 'What is AI safety?' },
        outputData: { 
          result: 'AI safety is a field of research focused on ensuring AI systems remain beneficial...',
          sources: ['https://example.com/ai-safety'],
        },
        durationMs: 5432,
        tokensUsed: 1250,
        costUsd: '0.0125',
      });
    console.log('   ✓ Created sample execution\n');

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('   Admin: admin@apexagents.test / Admin123!');
    console.log('   User:  test@apexagents.test / Test123!');
    console.log('   Demo:  demo@apexagents.test / Demo123!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

