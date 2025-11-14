/**
 * Agent Collaboration System
 * 
 * Allows multiple agents to work together on complex tasks
 */

import { db } from '@/lib/db';
import { agents, executions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export interface CollaborationTask {
  id: string;
  name: string;
  description: string;
  agents: string[]; // Agent IDs
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: unknown;
}

export interface AgentMessage {
  agentId: string;
  agentName: string;
  message: string;
  timestamp: Date;
  metadata?: unknown;
}

/**
 * Execute a collaborative task with multiple agents
 */
export async function executeCollaborativeTask(
  task: CollaborationTask,
  userId: string
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  try {
    const agentRecords = await db
      .select()
      .from(agents)
      .where(eq(agents.userId, userId));

    const taskAgents = agentRecords.filter(a => task.agents.includes(a.id));

    if (taskAgents.length === 0) {
      return { success: false, error: 'No agents found for collaboration' };
    }

    // Create a conversation thread for collaboration
    const messages: AgentMessage[] = [];

    // Coordinator agent (first agent in the list)
    const coordinator = taskAgents[0];
    
    // Step 1: Coordinator analyzes the task and delegates
    const coordinatorPrompt = `You are the coordinator agent for a collaborative task.

Task: ${task.name}
Description: ${task.description}

Available agents:
${taskAgents.map(a => `- ${a.name} (${a.type}): ${a.description}`).join('\n')}

Analyze the task and create a plan that delegates subtasks to the appropriate agents. Return your plan as JSON:
{
  "plan": [
    {
      "agentId": "agent_id",
      "subtask": "description of subtask",
      "dependencies": ["other_agent_ids"]
    }
  ]
}`;

    const coordinatorOpenAI = getOpenAI();
    const coordinatorResponse = await coordinatorOpenAI.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: coordinatorPrompt }],
      response_format: { type: 'json_object' },
    });

    const plan = JSON.parse(coordinatorResponse.choices[0].message.content || '{}');

    messages.push({
      agentId: coordinator.id,
      agentName: coordinator.name,
      message: `Created collaboration plan with ${plan.plan?.length || 0} subtasks`,
      timestamp: new Date(),
      metadata: plan,
    });

    // Step 2: Execute subtasks in order
    const results: any[] = [];

    for (const subtask of plan.plan || []) {
      const agent = taskAgents.find(a => a.id === subtask.agentId);
      if (!agent) continue;

      // Build context from previous results
      const context = results
        .map(r => `${r.agentName}: ${r.result}`)
        .join('\n\n');

      const agentPrompt = `You are ${agent.name}, a ${agent.type} agent.

Your subtask: ${subtask.subtask}

${context ? `Context from other agents:\n${context}` : ''}

Complete your subtask and return the result.`;

      const openai = getOpenAI();
      const agentResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: agentPrompt }],
      });

      const result = agentResponse.choices[0].message.content;

      messages.push({
        agentId: agent.id,
        agentName: agent.name,
        message: result || '',
        timestamp: new Date(),
        metadata: { subtask: subtask.subtask },
      });

      results.push({
        agentId: agent.id,
        agentName: agent.name,
        subtask: subtask.subtask,
        result,
      });
    }

    // Step 3: Coordinator synthesizes final result
    const synthesisPrompt = `You are the coordinator agent. Synthesize the results from all agents into a final comprehensive result.

Task: ${task.name}

Agent Results:
${results.map(r => `${r.agentName} (${r.subtask}):\n${r.result}`).join('\n\n---\n\n')}

Provide a comprehensive final result that combines all agent outputs.`;

    const synthesisOpenAI = getOpenAI();
    const finalResponse = await synthesisOpenAI.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: synthesisPrompt }],
    });

    const finalResult = finalResponse.choices[0].message.content;

    messages.push({
      agentId: coordinator.id,
      agentName: coordinator.name,
      message: finalResult || '',
      timestamp: new Date(),
      metadata: { type: 'synthesis' },
    });

    return {
      success: true,
      result: {
        finalResult,
        messages,
        agentResults: results,
      },
    };
  } catch (error: any) {
    console.error('Collaboration error:', error);
    return {
      success: false,
      error: error.message || 'Collaboration failed',
    };
  }
}

/**
 * Create a collaboration session
 */
export async function createCollaborationSession(
  name: string,
  description: string,
  agentIds: string[],
  userId: string
): Promise<CollaborationTask> {
  return {
    id: `collab-${Date.now()}`,
    name,
    description,
    agents: agentIds,
    status: 'pending',
  };
}

