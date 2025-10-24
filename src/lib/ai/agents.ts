import { aiOrchestrator, taskPlanner, MemorySystem, TaskPlan } from './orchestrator';
import { z } from 'zod';

// ============================================================================
// BASE AGENT CLASS
// ============================================================================

export interface AgentConfig {
  id: string;
  name: string;
  type: AgentType;
  model: string;
  temperature?: number;
  maxIterations?: number;
  tools: string[];
  capabilities: string[];
  constraints?: Record<string, any>;
}

export type AgentType = 
  | 'research'
  | 'analysis'
  | 'writing'
  | 'code'
  | 'decision'
  | 'communication'
  | 'monitoring'
  | 'orchestrator';

export interface AgentExecution {
  id: string;
  agentId: string;
  objective: string;
  plan: TaskPlan;
  status: 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  iterations: number;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected memory: MemorySystem;
  protected currentExecution?: AgentExecution;

  constructor(config: AgentConfig) {
    this.config = config;
    this.memory = new MemorySystem();
  }

  abstract execute(objective: string, context?: Record<string, any>): Promise<any>;

  protected async createPlan(objective: string, context?: Record<string, any>): Promise<TaskPlan> {
    return await taskPlanner.createPlan(objective, context);
  }

  protected async think(prompt: string): Promise<string> {
    const relevantMemories = this.memory.getRelevantMemories(prompt, 3);
    const memoryContext = relevantMemories
      .map((m) => `[${m.type}] ${m.content}`)
      .join('\n');

    const fullPrompt = `
You are ${this.config.name}, a ${this.config.type} agent.

Your capabilities: ${this.config.capabilities.join(', ')}

Relevant memories:
${memoryContext}

Current task: ${prompt}

Think through this step by step and provide your reasoning.
`;

    const response = await aiOrchestrator.generateCompletion(
      this.config.model,
      [{ role: 'user', content: fullPrompt }],
      { temperature: this.config.temperature || 0.7 }
    );

    // Store thought in memory
    this.memory.addMemory({
      type: 'short_term',
      content: `Thought: ${response}`,
      metadata: { prompt },
      importance: 0.5,
    });

    return response as string;
  }

  protected async act(action: string, input: Record<string, any>): Promise<any> {
    // This would integrate with actual tools
    // For now, simulate tool execution
    this.memory.addMemory({
      type: 'episodic',
      content: `Executed action: ${action} with input: ${JSON.stringify(input)}`,
      metadata: { action, input },
      importance: 0.7,
    });

    return { success: true, result: `Simulated ${action}` };
  }

  protected async reflect(result: any): Promise<void> {
    const reflection = await this.think(
      `Reflect on the result of your last action: ${JSON.stringify(result)}. What did you learn?`
    );

    this.memory.addMemory({
      type: 'semantic',
      content: reflection,
      metadata: { type: 'reflection', result },
      importance: 0.8,
    });
  }

  getMemories(): any[] {
    return this.memory.getAllMemories();
  }

  clearMemory(): void {
    this.memory.clearShortTermMemory();
  }
}

// ============================================================================
// RESEARCH AGENT
// ============================================================================

export class ResearchAgent extends BaseAgent {
  async execute(objective: string, context?: Record<string, any>): Promise<any> {
    const plan = await this.createPlan(objective, context);

    const research = {
      objective,
      findings: [] as any[],
      sources: [] as string[],
      summary: '',
      confidence: 0,
    };

    // Execute research steps
    for (const step of plan.steps) {
      const thought = await this.think(`How should I approach: ${step.description}`);
      const result = await this.act(step.action, step.input);
      
      research.findings.push({
        step: step.description,
        result,
        thought,
      });

      await this.reflect(result);
    }

    // Generate summary
    const summaryPrompt = `
Based on the following research findings, provide a comprehensive summary:

${research.findings.map((f, i) => `${i + 1}. ${f.step}: ${JSON.stringify(f.result)}`).join('\n')}

Provide:
1. Key insights
2. Important facts
3. Confidence level (0-1)
4. Recommendations for further research
`;

    const summary = await aiOrchestrator.generateStructuredOutput(
      this.config.model,
      summaryPrompt,
      z.object({
        keyInsights: z.array(z.string()),
        importantFacts: z.array(z.string()),
        confidence: z.number().min(0).max(1),
        recommendations: z.array(z.string()),
      })
    );

    research.summary = JSON.stringify(summary);
    research.confidence = summary.confidence;

    return research;
  }
}

// ============================================================================
// ANALYSIS AGENT
// ============================================================================

export class AnalysisAgent extends BaseAgent {
  async execute(objective: string, context?: Record<string, any>): Promise<any> {
    const data = context?.data || [];

    const analysisPrompt = `
Analyze the following data and provide insights:

Data: ${JSON.stringify(data)}

Objective: ${objective}

Provide:
1. Statistical summary
2. Patterns and trends
3. Anomalies
4. Predictions
5. Recommendations
`;

    const analysis = await aiOrchestrator.generateStructuredOutput(
      this.config.model,
      analysisPrompt,
      z.object({
        summary: z.object({
          count: z.number(),
          mean: z.number().optional(),
          median: z.number().optional(),
          stdDev: z.number().optional(),
        }),
        patterns: z.array(z.string()),
        anomalies: z.array(z.string()),
        predictions: z.array(z.string()),
        recommendations: z.array(z.string()),
        confidence: z.number().min(0).max(1),
      })
    );

    this.memory.addMemory({
      type: 'semantic',
      content: `Analysis completed: ${JSON.stringify(analysis)}`,
      metadata: { objective, dataSize: data.length },
      importance: 0.9,
    });

    return analysis;
  }
}

// ============================================================================
// WRITING AGENT
// ============================================================================

export class WritingAgent extends BaseAgent {
  async execute(objective: string, context?: Record<string, any>): Promise<any> {
    const { topic, tone = 'professional', length = 'medium', format = 'article' } = context || {};

    const writingPrompt = `
Write ${format} about: ${topic || objective}

Requirements:
- Tone: ${tone}
- Length: ${length}
- Format: ${format}

Additional context: ${JSON.stringify(context)}

Provide well-structured, engaging content with:
1. Clear introduction
2. Well-organized body
3. Strong conclusion
4. Proper formatting
`;

    const content = await aiOrchestrator.generateCompletion(
      this.config.model,
      [{ role: 'user', content: writingPrompt }],
      { temperature: 0.8, maxTokens: 4000 }
    );

    // Analyze the generated content
    const analysis = await this.analyzeContent(content as string);

    this.memory.addMemory({
      type: 'episodic',
      content: `Created ${format} about ${topic}`,
      metadata: { topic, tone, length, wordCount: analysis.wordCount },
      importance: 0.7,
    });

    return {
      content,
      analysis,
      metadata: {
        topic,
        tone,
        length,
        format,
        generatedAt: new Date(),
      },
    };
  }

  private async analyzeContent(content: string): Promise<any> {
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const paragraphs = content.split(/\n\n+/).length;

    return {
      wordCount: words,
      sentenceCount: sentences,
      paragraphCount: paragraphs,
      avgWordsPerSentence: Math.round(words / sentences),
      readingTime: Math.ceil(words / 200), // minutes
    };
  }
}

// ============================================================================
// CODE AGENT
// ============================================================================

export class CodeAgent extends BaseAgent {
  async execute(objective: string, context?: Record<string, any>): Promise<any> {
    const { language = 'typescript', task = 'generate' } = context || {};

    const codePrompt = `
You are an expert ${language} developer.

Task: ${task}
Objective: ${objective}

Context: ${JSON.stringify(context)}

${task === 'generate' ? 'Generate' : task === 'fix' ? 'Fix' : 'Refactor'} the code with:
1. Clean, readable code
2. Proper error handling
3. Comments explaining key logic
4. Type safety (if applicable)
5. Best practices

Provide the code and explanation.
`;

    const response = await aiOrchestrator.generateStructuredOutput(
      this.config.model,
      codePrompt,
      z.object({
        code: z.string(),
        explanation: z.string(),
        language: z.string(),
        dependencies: z.array(z.string()),
        testCases: z.array(z.string()).optional(),
      })
    );

    this.memory.addMemory({
      type: 'semantic',
      content: `Generated ${language} code for: ${objective}`,
      metadata: { language, task, linesOfCode: response.code.split('\n').length },
      importance: 0.8,
    });

    return response;
  }
}

// ============================================================================
// DECISION AGENT
// ============================================================================

export class DecisionAgent extends BaseAgent {
  async execute(objective: string, context?: Record<string, any>): Promise<any> {
    const { options = [], criteria = [] } = context || {};

    const decisionPrompt = `
You are a strategic decision-making agent.

Decision needed: ${objective}

Options:
${options.map((opt: any, i: number) => `${i + 1}. ${JSON.stringify(opt)}`).join('\n')}

Criteria:
${criteria.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

Analyze each option against the criteria and provide:
1. Evaluation of each option
2. Pros and cons
3. Risk assessment
4. Recommended decision
5. Confidence level
6. Rationale
`;

    const decision = await aiOrchestrator.generateStructuredOutput(
      this.config.model,
      decisionPrompt,
      z.object({
        evaluations: z.array(
          z.object({
            option: z.string(),
            score: z.number().min(0).max(10),
            pros: z.array(z.string()),
            cons: z.array(z.string()),
            risks: z.array(z.string()),
          })
        ),
        recommendation: z.string(),
        confidence: z.number().min(0).max(1),
        rationale: z.string(),
        alternativeApproaches: z.array(z.string()),
      })
    );

    this.memory.addMemory({
      type: 'semantic',
      content: `Made decision: ${decision.recommendation}`,
      metadata: { objective, confidence: decision.confidence },
      importance: 0.9,
    });

    return decision;
  }
}

// ============================================================================
// COMMUNICATION AGENT
// ============================================================================

export class CommunicationAgent extends BaseAgent {
  async execute(objective: string, context?: Record<string, any>): Promise<any> {
    const { channel = 'email', recipient, message, tone = 'professional' } = context || {};

    const commPrompt = `
You are a communication specialist.

Task: ${objective}
Channel: ${channel}
Recipient: ${recipient}
Tone: ${tone}

Draft a ${tone} ${channel} message that:
1. Is clear and concise
2. Achieves the objective
3. Is appropriate for the recipient
4. Follows best practices for ${channel}

Message context: ${message}
`;

    const communication = await aiOrchestrator.generateStructuredOutput(
      this.config.model,
      commPrompt,
      z.object({
        subject: z.string().optional(),
        body: z.string(),
        callToAction: z.string().optional(),
        tone: z.string(),
        estimatedResponseTime: z.string().optional(),
      })
    );

    this.memory.addMemory({
      type: 'episodic',
      content: `Sent ${channel} to ${recipient}`,
      metadata: { channel, recipient, objective },
      importance: 0.6,
    });

    return communication;
  }
}

// ============================================================================
// MONITORING AGENT
// ============================================================================

export class MonitoringAgent extends BaseAgent {
  async execute(objective: string, context?: Record<string, any>): Promise<any> {
    const { metrics = [], thresholds = {}, duration = '1h' } = context || {};

    const monitoringPrompt = `
You are a monitoring and alerting agent.

Objective: ${objective}

Metrics to monitor:
${metrics.map((m: any, i: number) => `${i + 1}. ${JSON.stringify(m)}`).join('\n')}

Thresholds:
${JSON.stringify(thresholds)}

Duration: ${duration}

Analyze the metrics and provide:
1. Current status
2. Anomalies detected
3. Trends
4. Alerts (if any)
5. Recommendations
`;

    const monitoring = await aiOrchestrator.generateStructuredOutput(
      this.config.model,
      monitoringPrompt,
      z.object({
        status: z.enum(['healthy', 'warning', 'critical']),
        anomalies: z.array(
          z.object({
            metric: z.string(),
            value: z.number(),
            threshold: z.number(),
            severity: z.enum(['low', 'medium', 'high', 'critical']),
          })
        ),
        trends: z.array(z.string()),
        alerts: z.array(
          z.object({
            title: z.string(),
            message: z.string(),
            severity: z.string(),
            actionRequired: z.boolean(),
          })
        ),
        recommendations: z.array(z.string()),
      })
    );

    this.memory.addMemory({
      type: 'episodic',
      content: `Monitoring check: ${monitoring.status}`,
      metadata: { objective, status: monitoring.status, alertCount: monitoring.alerts.length },
      importance: monitoring.status === 'critical' ? 1.0 : 0.5,
    });

    return monitoring;
  }
}

// ============================================================================
// ORCHESTRATOR AGENT (Meta-Agent)
// ============================================================================

export class OrchestratorAgent extends BaseAgent {
  private agents: Map<AgentType, BaseAgent> = new Map();

  registerAgent(type: AgentType, agent: BaseAgent): void {
    this.agents.set(type, agent);
  }

  async execute(objective: string, context?: Record<string, any>): Promise<any> {
    // Create high-level plan
    const plan = await this.createPlan(objective, context);

    // Determine which agents are needed
    const agentAssignments = await this.assignAgents(plan);

    // Execute plan with appropriate agents
    const results: any[] = [];

    for (const assignment of agentAssignments) {
      const agent = this.agents.get(assignment.agentType);
      if (!agent) {
        throw new Error(`Agent type ${assignment.agentType} not registered`);
      }

      const result = await agent.execute(assignment.task, assignment.context);
      results.push({
        agentType: assignment.agentType,
        task: assignment.task,
        result,
      });
    }

    // Synthesize final result
    const synthesis = await this.synthesizeResults(objective, results);

    return {
      objective,
      plan,
      agentResults: results,
      synthesis,
      completedAt: new Date(),
    };
  }

  private async assignAgents(plan: TaskPlan): Promise<Array<{
    agentType: AgentType;
    task: string;
    context: Record<string, any>;
  }>> {
    const assignmentPrompt = `
Given this task plan, assign the appropriate agent type to each step:

Plan: ${JSON.stringify(plan)}

Available agent types:
- research: Information gathering and web research
- analysis: Data analysis and pattern recognition
- writing: Content creation and documentation
- code: Software development and debugging
- decision: Strategic planning and decision-making
- communication: External communications and notifications
- monitoring: System monitoring and alerting

For each step, determine which agent type is best suited.
`;

    const assignments = await aiOrchestrator.generateStructuredOutput(
      this.config.model,
      assignmentPrompt,
      z.object({
        assignments: z.array(
          z.object({
            stepId: z.string(),
            agentType: z.enum(['research', 'analysis', 'writing', 'code', 'decision', 'communication', 'monitoring']),
            task: z.string(),
            context: z.record(z.any()),
          })
        ),
      })
    );

    return assignments.assignments;
  }

  private async synthesizeResults(objective: string, results: any[]): Promise<string> {
    const synthesisPrompt = `
Original objective: ${objective}

Agent results:
${results.map((r, i) => `${i + 1}. [${r.agentType}] ${r.task}\nResult: ${JSON.stringify(r.result)}`).join('\n\n')}

Synthesize these results into a coherent final answer that addresses the original objective.
`;

    const synthesis = await aiOrchestrator.generateCompletion(
      this.config.model,
      [{ role: 'user', content: synthesisPrompt }],
      { temperature: 0.7 }
    );

    return synthesis as string;
  }
}

// ============================================================================
// AGENT FACTORY
// ============================================================================

export class AgentFactory {
  static createAgent(config: AgentConfig): BaseAgent {
    switch (config.type) {
      case 'research':
        return new ResearchAgent(config);
      case 'analysis':
        return new AnalysisAgent(config);
      case 'writing':
        return new WritingAgent(config);
      case 'code':
        return new CodeAgent(config);
      case 'decision':
        return new DecisionAgent(config);
      case 'communication':
        return new CommunicationAgent(config);
      case 'monitoring':
        return new MonitoringAgent(config);
      case 'orchestrator':
        return new OrchestratorAgent(config);
      default:
        throw new Error(`Unknown agent type: ${config.type}`);
    }
  }
}

