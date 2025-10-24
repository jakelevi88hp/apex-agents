import { Agent } from './agents';
import { aiOrchestrator } from './orchestrator';
import { z } from 'zod';

export interface SwarmConfig {
  id: string;
  name: string;
  agents: Agent[];
  topology: 'hierarchical' | 'collaborative' | 'competitive' | 'mesh';
  coordinationStrategy: 'democratic' | 'leader-based' | 'consensus' | 'auction';
  communicationProtocol: 'broadcast' | 'direct' | 'gossip';
}

export interface SwarmTask {
  objective: string;
  context?: Record<string, any>;
  constraints?: Record<string, any>;
  deadline?: Date;
}

export interface SwarmResult {
  objective: string;
  result: any;
  contributions: AgentContribution[];
  consensusLevel: number;
  executionTime: number;
  cost: number;
}

export interface AgentContribution {
  agentId: string;
  agentType: string;
  contribution: any;
  confidence: number;
  reasoning: string;
}

export class AgentSwarm {
  private config: SwarmConfig;
  private communicationLog: SwarmMessage[] = [];

  constructor(config: SwarmConfig) {
    this.config = config;
  }

  async execute(task: SwarmTask): Promise<SwarmResult> {
    const startTime = Date.now();
    
    // Decompose task based on topology
    const subtasks = await this.decomposeTask(task);
    
    // Assign subtasks to agents
    const assignments = await this.assignTasks(subtasks);
    
    // Execute in parallel
    const contributions = await this.executeParallel(assignments);
    
    // Coordinate and synthesize results
    const result = await this.synthesizeResults(contributions, task);
    
    // Calculate consensus
    const consensusLevel = this.calculateConsensus(contributions);
    
    return {
      objective: task.objective,
      result,
      contributions,
      consensusLevel,
      executionTime: Date.now() - startTime,
      cost: this.calculateCost(contributions),
    };
  }

  private async decomposeTask(task: SwarmTask): Promise<Subtask[]> {
    const prompt = `
Decompose this task into subtasks suitable for a swarm of ${this.config.agents.length} agents:

Task: ${task.objective}
Context: ${JSON.stringify(task.context)}

Available agents:
${this.config.agents.map(a => `- ${a.type}: ${a.capabilities.join(', ')}`).join('\n')}

Topology: ${this.config.topology}

Create a plan that leverages each agent's strengths.
`;

    const plan = await aiOrchestrator.generateStructuredOutput(
      'gpt-4-turbo',
      prompt,
      z.object({
        subtasks: z.array(z.object({
          id: z.string(),
          description: z.string(),
          requiredCapabilities: z.array(z.string()),
          dependencies: z.array(z.string()),
          priority: z.number(),
        })),
      })
    );

    return plan.subtasks;
  }

  private async assignTasks(subtasks: Subtask[]): Promise<TaskAssignment[]> {
    const assignments: TaskAssignment[] = [];

    if (this.config.coordinationStrategy === 'auction') {
      // Auction-based assignment
      for (const subtask of subtasks) {
        const bids = await this.collectBids(subtask);
        const winner = this.selectWinner(bids);
        assignments.push({ subtask, agent: winner.agent, bid: winner.bid });
      }
    } else if (this.config.coordinationStrategy === 'leader-based') {
      // Leader assigns tasks
      const leader = this.config.agents.find(a => a.type === 'orchestrator') || this.config.agents[0];
      const plan = await leader.execute(`Assign these subtasks to agents: ${JSON.stringify(subtasks)}`);
      // Parse plan and create assignments
    } else {
      // Democratic/consensus-based assignment
      for (const subtask of subtasks) {
        const bestAgent = this.findBestAgent(subtask);
        assignments.push({ subtask, agent: bestAgent });
      }
    }

    return assignments;
  }

  private async executeParallel(assignments: TaskAssignment[]): Promise<AgentContribution[]> {
    const contributions: AgentContribution[] = [];

    // Execute all assignments in parallel
    const results = await Promise.all(
      assignments.map(async (assignment) => {
        try {
          const result = await assignment.agent.execute(assignment.subtask.description);
          
          this.broadcastMessage({
            from: assignment.agent.id,
            to: 'all',
            type: 'result',
            content: result,
            timestamp: new Date(),
          });

          return {
            agentId: assignment.agent.id,
            agentType: assignment.agent.type,
            contribution: result,
            confidence: (result as any).confidence || 0.8,
            reasoning: (result as any).reasoning || '',
          };
        } catch (error: any) {
          return {
            agentId: assignment.agent.id,
            agentType: assignment.agent.type,
            contribution: null,
            confidence: 0,
            reasoning: `Error: ${error.message}`,
          };
        }
      })
    );

    return results;
  }

  private async synthesizeResults(contributions: AgentContribution[], task: SwarmTask): Promise<any> {
    // Use orchestrator agent or GPT-4 to synthesize
    const synthesisPrompt = `
Synthesize these agent contributions into a final result:

Original Task: ${task.objective}

Contributions:
${contributions.map((c, i) => `
${i + 1}. ${c.agentType} (confidence: ${c.confidence}):
${JSON.stringify(c.contribution)}
Reasoning: ${c.reasoning}
`).join('\n')}

Provide a comprehensive final result that integrates the best insights from all agents.
`;

    const synthesis = await aiOrchestrator.generateCompletion('gpt-4-turbo', [
      { role: 'user', content: synthesisPrompt }
    ]);

    return synthesis;
  }

  private calculateConsensus(contributions: AgentContribution[]): number {
    // Calculate agreement level between agents
    const validContributions = contributions.filter(c => c.contribution !== null);
    if (validContributions.length === 0) return 0;

    const avgConfidence = validContributions.reduce((sum, c) => sum + c.confidence, 0) / validContributions.length;
    return avgConfidence;
  }

  private calculateCost(contributions: AgentContribution[]): number {
    // Estimate API costs
    return contributions.length * 0.05; // $0.05 per agent execution
  }

  private async collectBids(subtask: Subtask): Promise<AgentBid[]> {
    const bids: AgentBid[] = [];

    for (const agent of this.config.agents) {
      const canHandle = subtask.requiredCapabilities.some(cap => 
        agent.capabilities.includes(cap)
      );

      if (canHandle) {
        const bid = await this.calculateBid(agent, subtask);
        bids.push({ agent, bid, confidence: bid.confidence });
      }
    }

    return bids;
  }

  private async calculateBid(agent: Agent, subtask: Subtask): Promise<any> {
    // Agent evaluates its suitability for the task
    return {
      cost: 0.05,
      time: 30,
      confidence: 0.8,
    };
  }

  private selectWinner(bids: AgentBid[]): AgentBid {
    // Select based on confidence and cost
    return bids.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  private findBestAgent(subtask: Subtask): Agent {
    // Find agent with most matching capabilities
    return this.config.agents.reduce((best, current) => {
      const currentMatch = subtask.requiredCapabilities.filter(cap =>
        current.capabilities.includes(cap)
      ).length;
      
      const bestMatch = subtask.requiredCapabilities.filter(cap =>
        best.capabilities.includes(cap)
      ).length;

      return currentMatch > bestMatch ? current : best;
    });
  }

  private broadcastMessage(message: SwarmMessage): void {
    this.communicationLog.push(message);
    
    if (this.config.communicationProtocol === 'broadcast') {
      // All agents receive the message
    } else if (this.config.communicationProtocol === 'direct') {
      // Only specific recipient
    } else if (this.config.communicationProtocol === 'gossip') {
      // Propagate to neighbors
    }
  }

  getCommunicationLog(): SwarmMessage[] {
    return this.communicationLog;
  }
}

interface Subtask {
  id: string;
  description: string;
  requiredCapabilities: string[];
  dependencies: string[];
  priority: number;
}

interface TaskAssignment {
  subtask: Subtask;
  agent: Agent;
  bid?: any;
}

interface AgentBid {
  agent: Agent;
  bid: any;
  confidence: number;
}

interface SwarmMessage {
  from: string;
  to: string;
  type: 'query' | 'result' | 'request' | 'notification';
  content: any;
  timestamp: Date;
}

export async function createSwarm(config: Omit<SwarmConfig, 'id'>): Promise<AgentSwarm> {
  const swarm = new AgentSwarm({
    ...config,
    id: crypto.randomUUID(),
  });
  
  return swarm;
}

