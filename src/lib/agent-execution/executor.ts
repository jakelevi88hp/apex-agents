'use server';

import OpenAI from 'openai';
import { db } from '@/lib/db';
import { agents, executions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface ExecutionConfig {
  agentId: string;
  input: string;
  userId: string;
  stream?: boolean;
}

export interface ExecutionResult {
  id: string;
  output: string;
  tokensUsed: number;
  duration: number;
  status: 'success' | 'error';
  error?: string;
}

/**
 * Execute an agent with the given input
 */
export async function executeAgent(config: ExecutionConfig): Promise<ExecutionResult> {
  const startTime = Date.now();
  
  try {
    // Fetch agent configuration from database
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, config.agentId),
    });

    if (!agent) {
      throw new Error(`Agent not found: ${config.agentId}`);
    }

    // Parse agent configuration
    const agentConfig = agent.config as any;
    const model = agentConfig.model || 'gpt-4';
    const temperature = agentConfig.temperature || 0.7;
    const maxTokens = agentConfig.maxTokens || 2000;
    const systemPrompt = agentConfig.systemPrompt || agent.description;

    // Create execution record
    const [execution] = await db.insert(executions).values({
      agentId: config.agentId,
      userId: config.userId,
      inputData: { input: config.input },
      status: 'running',
      startedAt: new Date(),
    }).returning();

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: config.input },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const output = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const duration = Date.now() - startTime;

    // Update execution record with results
    await db.update(executions)
      .set({
        outputData: { output },
        tokensUsed,
        durationMs: duration,
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(executions.id, execution.id));

    return {
      id: execution.id,
      output,
      tokensUsed,
      duration,
      status: 'success',
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Try to update execution record with error
    try {
      await db.update(executions)
        .set({
          status: 'failed',
          errorMessage,
          durationMs: duration,
          completedAt: new Date(),
        })
        .where(eq(executions.agentId, config.agentId));
    } catch (dbError) {
      console.error('Failed to update execution record:', dbError);
    }

    return {
      id: '',
      output: '',
      tokensUsed: 0,
      duration,
      status: 'error',
      error: errorMessage,
    };
  }
}

/**
 * Execute agent with streaming response
 */
export async function* executeAgentStream(config: ExecutionConfig): AsyncGenerator<string> {
  const startTime = Date.now();
  
  try {
    // Fetch agent configuration
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, config.agentId),
    });

    if (!agent) {
      throw new Error(`Agent not found: ${config.agentId}`);
    }

    const agentConfig = agent.config as any;
    const model = agentConfig.model || 'gpt-4';
    const temperature = agentConfig.temperature || 0.7;
    const maxTokens = agentConfig.maxTokens || 2000;
    const systemPrompt = agentConfig.systemPrompt || agent.description;

    // Create execution record
    const [execution] = await db.insert(executions).values({
      agentId: config.agentId,
      userId: config.userId,
      inputData: { input: config.input },
      status: 'running',
      startedAt: new Date(),
    }).returning();

    // Stream from OpenAI
    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: config.input },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    let fullOutput = '';
    let tokensUsed = 0;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullOutput += content;
        yield content;
      }
    }

    const duration = Date.now() - startTime;

    // Update execution with final results
    await db.update(executions)
      .set({
        outputData: { output: fullOutput },
        tokensUsed,
        durationMs: duration,
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(executions.id, execution.id));

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    yield `\n\nError: ${errorMessage}`;
  }
}

/**
 * Get execution history for an agent
 */
export async function getExecutionHistory(agentId: string, limit: number = 10) {
  return await db.query.executions.findMany({
    where: eq(executions.agentId, agentId),
    orderBy: (executions, { desc }) => [desc(executions.startedAt)],
    limit,
  });
}

/**
 * Get execution by ID
 */
export async function getExecution(executionId: string) {
  return await db.query.executions.findFirst({
    where: eq(executions.id, executionId),
  });
}

