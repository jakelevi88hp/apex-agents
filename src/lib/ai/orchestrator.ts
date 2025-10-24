import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

export interface ModelConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export class AIOrchestrator {
  private models: Map<string, ChatOpenAI | ChatAnthropic> = new Map();

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    // Initialize OpenAI models
    if (process.env.OPENAI_API_KEY) {
      this.models.set('gpt-4-turbo', new ChatOpenAI({
        modelName: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 4096,
      }));

      this.models.set('gpt-4', new ChatOpenAI({
        modelName: 'gpt-4',
        temperature: 0.7,
        maxTokens: 8192,
      }));

      this.models.set('gpt-3.5-turbo', new ChatOpenAI({
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 4096,
      }));
    }

    // Initialize Anthropic models
    if (process.env.ANTHROPIC_API_KEY) {
      this.models.set('claude-3-opus', new ChatAnthropic({
        modelName: 'claude-3-opus-20240229',
        temperature: 0.7,
        maxTokens: 4096,
      }));

      this.models.set('claude-3-sonnet', new ChatAnthropic({
        modelName: 'claude-3-5-sonnet-20241022',
        temperature: 0.7,
        maxTokens: 8192,
      }));
    }
  }

  getModel(modelName: string): ChatOpenAI | ChatAnthropic {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found or not configured`);
    }
    return model;
  }

  async generateCompletion(
    modelName: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      structuredOutput?: z.ZodSchema;
    }
  ): Promise<string | any> {
    const model = this.getModel(modelName);

    // Convert messages to LangChain format
    const langchainMessages = messages.map((msg) => {
      switch (msg.role) {
        case 'system':
          return new SystemMessage(msg.content);
        case 'user':
          return new HumanMessage(msg.content);
        case 'assistant':
          return new AIMessage(msg.content);
        default:
          throw new Error(`Unknown message role: ${msg.role}`);
      }
    });

    // Apply options
    if (options?.temperature !== undefined) {
      model.temperature = options.temperature;
    }
    if (options?.maxTokens !== undefined) {
      model.maxTokens = options.maxTokens;
    }

    // Generate completion
    const response = await model.invoke(langchainMessages);

    // Parse structured output if schema provided
    if (options?.structuredOutput) {
      const parser = StructuredOutputParser.fromZodSchema(options.structuredOutput);
      return await parser.parse(response.content as string);
    }

    return response.content;
  }

  async generateStructuredOutput<T extends z.ZodSchema>(
    modelName: string,
    prompt: string,
    schema: T,
    variables?: Record<string, any>
  ): Promise<any> {
    const parser = StructuredOutputParser.fromZodSchema(schema);
    const formatInstructions = parser.getFormatInstructions();

    const promptTemplate = new PromptTemplate({
      template: `${prompt}\n\n{format_instructions}`,
      inputVariables: Object.keys(variables || {}),
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await promptTemplate.format(variables || {});
    const model = this.getModel(modelName);
    const response = await model.invoke([new HumanMessage(input)]);

    return await parser.parse(response.content as string);
  }
}

// ============================================================================
// AGENT TASK PLANNING
// ============================================================================

export interface TaskPlan {
  objective: string;
  steps: TaskStep[];
  estimatedDuration: number;
  requiredTools: string[];
  dependencies: string[];
}

export interface TaskStep {
  id: string;
  description: string;
  action: string;
  tool: string;
  input: Record<string, any>;
  expectedOutput: string;
  dependencies: string[];
}

export class TaskPlanner {
  private orchestrator: AIOrchestrator;

  constructor(orchestrator: AIOrchestrator) {
    this.orchestrator = orchestrator;
  }

  async createPlan(objective: string, context?: Record<string, any>): Promise<TaskPlan> {
    const schema = z.object({
      objective: z.string(),
      steps: z.array(
        z.object({
          id: z.string(),
          description: z.string(),
          action: z.string(),
          tool: z.string(),
          input: z.record(z.string(), z.any()),
          expectedOutput: z.string(),
          dependencies: z.array(z.string()),
        })
      ),
      estimatedDuration: z.number(),
      requiredTools: z.array(z.string()),
      dependencies: z.array(z.string()),
    });

    const prompt = `
You are an AI task planner. Given an objective, break it down into a detailed step-by-step plan.

Objective: {objective}

Context: {context}

Create a comprehensive plan that:
1. Breaks the objective into clear, actionable steps
2. Identifies required tools for each step
3. Specifies dependencies between steps
4. Estimates duration in minutes
5. Defines expected outputs

Available tools:
- web_search: Search the internet for information
- web_scrape: Extract content from websites
- code_execute: Run code in a sandboxed environment
- api_call: Make HTTP requests to APIs
- database_query: Query databases
- file_read: Read file contents
- file_write: Write to files
- email_send: Send emails
- slack_post: Post to Slack
- data_analyze: Analyze data and generate insights
`;

    return await this.orchestrator.generateStructuredOutput(
      'gpt-4-turbo',
      prompt,
      schema,
      {
        objective,
        context: JSON.stringify(context || {}),
      }
    );
  }
}

// ============================================================================
// AGENT MEMORY SYSTEM
// ============================================================================

export interface Memory {
  id: string;
  type: 'short_term' | 'long_term' | 'episodic' | 'semantic';
  content: string;
  metadata: Record<string, any>;
  importance: number;
  timestamp: Date;
  embedding?: number[];
}

export class MemorySystem {
  private shortTermMemory: Memory[] = [];
  private longTermMemory: Memory[] = [];
  private maxShortTermSize = 10;

  addMemory(memory: Omit<Memory, 'id' | 'timestamp'>): void {
    const newMemory: Memory = {
      ...memory,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    if (memory.type === 'short_term') {
      this.shortTermMemory.push(newMemory);
      
      // Consolidate to long-term if short-term is full
      if (this.shortTermMemory.length > this.maxShortTermSize) {
        this.consolidateMemories();
      }
    } else {
      this.longTermMemory.push(newMemory);
    }
  }

  private consolidateMemories(): void {
    // Move important short-term memories to long-term
    const importantMemories = this.shortTermMemory
      .filter((m) => m.importance > 0.7)
      .map((m) => ({ ...m, type: 'long_term' as const }));

    this.longTermMemory.push(...importantMemories);
    
    // Keep only recent short-term memories
    this.shortTermMemory = this.shortTermMemory.slice(-this.maxShortTermSize);
  }

  getRelevantMemories(query: string, limit: number = 5): Memory[] {
    // Simple relevance scoring (in production, use vector similarity)
    const allMemories = [...this.shortTermMemory, ...this.longTermMemory];
    
    return allMemories
      .map((memory) => ({
        memory,
        score: this.calculateRelevance(query, memory.content),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.memory);
  }

  private calculateRelevance(query: string, content: string): number {
    // Simple keyword matching (replace with embeddings in production)
    const queryWords = query.toLowerCase().split(' ');
    const contentWords = content.toLowerCase().split(' ');
    
    const matches = queryWords.filter((word) => contentWords.includes(word)).length;
    return matches / queryWords.length;
  }

  clearShortTermMemory(): void {
    this.shortTermMemory = [];
  }

  getAllMemories(): Memory[] {
    return [...this.shortTermMemory, ...this.longTermMemory];
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const aiOrchestrator = new AIOrchestrator();
export const taskPlanner = new TaskPlanner(aiOrchestrator);

