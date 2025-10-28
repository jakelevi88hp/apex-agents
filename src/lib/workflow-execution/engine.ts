'use server';

import { db } from '@/lib/db';
import { workflows, executions, executionSteps } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { executeAgent } from '../agent-execution/executor';

interface WorkflowExecutionConfig {
  workflowId: string;
  userId: string;
  inputData?: any;
}

export async function executeWorkflow(config: WorkflowExecutionConfig) {
  const startTime = Date.now();
  
  try {
    // Fetch workflow configuration
    const workflow = await db.query.workflows.findFirst({
      where: eq(workflows.id, config.workflowId),
    });

    if (!workflow) {
      throw new Error(`Workflow not found: ${config.workflowId}`);
    }

    // Create execution record
    const [execution] = await db.insert(executions).values({
      workflowId: config.workflowId,
      userId: config.userId,
      inputData: config.inputData,
      status: 'running',
      startedAt: new Date(),
    }).returning();

    // Parse workflow steps
    const steps = workflow.steps as any[];
    const results: any[] = [];
    let currentInput = config.inputData;

    // Execute each step sequentially
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepStartTime = Date.now();

      try {
        // Create step execution record
        const [stepExecution] = await db.insert(executionSteps).values({
          executionId: execution.id,
          stepIndex: i,
          agentId: step.agentId,
          inputData: currentInput,
          status: 'running',
          startedAt: new Date(),
        }).returning();

        // Execute the step based on type
        let stepResult;
        if (step.type === 'agent') {
          stepResult = await executeAgent({
            agentId: step.agentId,
            input: JSON.stringify(currentInput),
            userId: config.userId,
          });
        } else if (step.type === 'condition') {
          // Evaluate condition
          stepResult = evaluateCondition(step.condition, currentInput);
        }

        const stepDuration = Date.now() - stepStartTime;

        // Update step execution with results
        await db.update(executionSteps)
          .set({
            outputData: stepResult,
            durationMs: stepDuration,
            status: 'completed',
            completedAt: new Date(),
          })
          .where(eq(executionSteps.id, stepExecution.id));

        results.push(stepResult);
        currentInput = stepResult; // Pass output to next step

      } catch (stepError) {
        const stepDuration = Date.now() - stepStartTime;
        const errorMessage = stepError instanceof Error ? stepError.message : 'Unknown error';

        // Update step with error
        await db.update(executionSteps)
          .set({
            errorMessage,
            durationMs: stepDuration,
            status: 'failed',
            completedAt: new Date(),
          })
          .where(eq(executionSteps.executionId, execution.id));

        throw stepError;
      }
    }

    const totalDuration = Date.now() - startTime;

    // Update execution with success
    await db.update(executions)
      .set({
        outputData: { results },
        durationMs: totalDuration,
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(executions.id, execution.id));

    return {
      id: execution.id,
      status: 'success',
      results,
      duration: totalDuration,
    };

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update execution with error
    await db.update(executions)
      .set({
        errorMessage,
        durationMs: totalDuration,
        status: 'failed',
        completedAt: new Date(),
      })
      .where(eq(executions.workflowId, config.workflowId));

    return {
      id: '',
      status: 'error',
      error: errorMessage,
      duration: totalDuration,
    };
  }
}

function evaluateCondition(condition: string, data: any): boolean {
  // Simple condition evaluation
  // In production, use a proper expression evaluator
  try {
    const func = new Function('data', `return ${condition}`);
    return func(data);
  } catch {
    return false;
  }
}

export async function getWorkflowExecutions(workflowId: string, limit: number = 10) {
  return await db.query.executions.findMany({
    where: eq(executions.workflowId, workflowId),
    orderBy: (executions, { desc }) => [desc(executions.startedAt)],
    limit,
  });
}

