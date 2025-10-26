/**
 * Workflow Execution Engine
 * 
 * Executes workflows by running steps sequentially or in parallel,
 * evaluating conditions, and tracking execution status.
 */

import { db } from '@/lib/db';
import { executions, executionSteps, workflows, agents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { OpenAI } from 'openai';

interface WorkflowStep {
  id: string;
  type: 'agent' | 'condition' | 'loop' | 'parallel';
  agentId?: string;
  config: any;
}

interface ExecutionContext {
  workflowId: string;
  userId: string;
  inputData?: any;
  variables: Record<string, any>;
}

interface ExecutionResult {
  executionId: string;
  status: 'completed' | 'failed' | 'running';
  outputData?: any;
  errorMessage?: string;
  durationMs: number;
}

export class WorkflowExecutor {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key is required for workflow execution');
    }
    this.openai = new OpenAI({ apiKey: key });
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Get workflow details
      const workflow = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, context.workflowId))
        .limit(1);

      if (!workflow[0]) {
        throw new Error('Workflow not found');
      }

      const workflowData = workflow[0];

      // Create execution record
      const execution = await db
        .insert(executions)
        .values({
          workflowId: context.workflowId,
          userId: context.userId,
          status: 'running',
          inputData: context.inputData || {},
          startedAt: new Date(),
        })
        .returning();

      const executionId = execution[0].id;

      // Execute steps
      const steps = workflowData.steps as WorkflowStep[];
      const results: any[] = [];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        try {
          const stepResult = await this.executeStep(step, {
            ...context,
            executionId,
            stepIndex: i,
            previousResults: results,
          });

          results.push(stepResult);

          // Record step execution
          await db.insert(executionSteps).values({
            executionId,
            stepIndex: i,
            agentId: step.agentId,
            status: 'completed',
            inputData: step.config,
            outputData: stepResult,
            startedAt: new Date(),
            completedAt: new Date(),
            durationMs: 0, // Will be calculated
          });
        } catch (error: any) {
          // Record failed step
          await db.insert(executionSteps).values({
            executionId,
            stepIndex: i,
            agentId: step.agentId,
            status: 'failed',
            inputData: step.config,
            errorMessage: error.message,
            startedAt: new Date(),
            completedAt: new Date(),
          });

          throw error;
        }
      }

      const durationMs = Date.now() - startTime;

      // Update execution as completed
      await db
        .update(executions)
        .set({
          status: 'completed',
          outputData: results,
          completedAt: new Date(),
          durationMs,
        })
        .where(eq(executions.id, executionId));

      // Update workflow statistics
      await db
        .update(workflows)
        .set({
          executionCount: workflowData.executionCount + 1,
          lastExecution: new Date(),
        })
        .where(eq(workflows.id, context.workflowId));

      return {
        executionId,
        status: 'completed',
        outputData: results,
        durationMs,
      };
    } catch (error: any) {
      const durationMs = Date.now() - startTime;

      return {
        executionId: '', // May not have been created
        status: 'failed',
        errorMessage: error.message,
        durationMs,
      };
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    context: ExecutionContext & { executionId: string; stepIndex: number; previousResults: any[] }
  ): Promise<any> {
    switch (step.type) {
      case 'agent':
        return await this.executeAgentStep(step, context);

      case 'condition':
        return await this.evaluateCondition(step, context);

      case 'loop':
        return await this.executeLoop(step, context);

      case 'parallel':
        return await this.executeParallel(step, context);

      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute an agent step
   */
  private async executeAgentStep(
    step: WorkflowStep,
    context: ExecutionContext & { previousResults: any[] }
  ): Promise<any> {
    if (!step.agentId) {
      throw new Error('Agent ID is required for agent step');
    }

    // Get agent details
    const agent = await db
      .select()
      .from(agents)
      .where(eq(agents.id, step.agentId))
      .limit(1);

    if (!agent[0]) {
      throw new Error('Agent not found');
    }

    const agentData = agent[0];

    // Build prompt from step config and previous results
    const prompt = this.buildAgentPrompt(step.config, context.previousResults);

    // Execute agent using OpenAI
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a ${agentData.type} agent named "${agentData.name}". ${agentData.description || ''}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const result = response.choices[0].message.content;

    // Record execution in database
    await db.insert(executions).values({
      workflowId: context.workflowId,
      agentId: step.agentId,
      userId: context.userId,
      status: 'completed',
      inputData: { prompt },
      outputData: { result },
      startedAt: new Date(),
      completedAt: new Date(),
      tokensUsed: response.usage?.total_tokens || 0,
    });

    return {
      agentId: step.agentId,
      agentName: agentData.name,
      result,
      tokensUsed: response.usage?.total_tokens || 0,
    };
  }

  /**
   * Build agent prompt from config and previous results
   */
  private buildAgentPrompt(config: any, previousResults: any[]): string {
    let prompt = config.prompt || config.instruction || '';

    // Replace variables with previous results
    if (previousResults.length > 0) {
      prompt += '\n\nContext from previous steps:\n';
      previousResults.forEach((result, index) => {
        prompt += `\nStep ${index + 1}: ${JSON.stringify(result, null, 2)}`;
      });
    }

    return prompt;
  }

  /**
   * Evaluate a condition step
   */
  private async evaluateCondition(
    step: WorkflowStep,
    context: ExecutionContext & { previousResults: any[] }
  ): Promise<any> {
    const condition = step.config.condition;
    const previousResult = context.previousResults[context.previousResults.length - 1];

    // Simple condition evaluation
    // In production, use a proper expression evaluator
    let result = false;

    if (condition.type === 'contains') {
      const value = JSON.stringify(previousResult).toLowerCase();
      result = value.includes(condition.value.toLowerCase());
    } else if (condition.type === 'equals') {
      result = previousResult === condition.value;
    } else if (condition.type === 'greater_than') {
      result = Number(previousResult) > Number(condition.value);
    }

    return {
      condition: condition.type,
      value: condition.value,
      result,
    };
  }

  /**
   * Execute a loop step
   */
  private async executeLoop(
    step: WorkflowStep,
    context: ExecutionContext & { executionId: string; stepIndex: number; previousResults: any[] }
  ): Promise<any> {
    const iterations = step.config.iterations || 1;
    const results: any[] = [];

    for (let i = 0; i < iterations; i++) {
      const loopContext = {
        ...context,
        variables: {
          ...context.variables,
          loopIndex: i,
        },
      };

      // Execute nested steps
      if (step.config.steps) {
        for (const nestedStep of step.config.steps) {
          const result = await this.executeStep(nestedStep, {
            ...loopContext,
            previousResults: results,
          });
          results.push(result);
        }
      }
    }

    return {
      iterations,
      results,
    };
  }

  /**
   * Execute parallel steps
   */
  private async executeParallel(
    step: WorkflowStep,
    context: ExecutionContext & { executionId: string; stepIndex: number; previousResults: any[] }
  ): Promise<any> {
    const parallelSteps = step.config.steps || [];

    // Execute all steps in parallel
    const promises = parallelSteps.map((parallelStep: WorkflowStep) =>
      this.executeStep(parallelStep, context)
    );

    const results = await Promise.all(promises);

    return {
      parallelCount: parallelSteps.length,
      results,
    };
  }
}

// Export singleton instance
let executorInstance: WorkflowExecutor | null = null;

export function getWorkflowExecutor(apiKey?: string): WorkflowExecutor {
  if (!executorInstance) {
    executorInstance = new WorkflowExecutor(apiKey);
  }
  return executorInstance;
}

