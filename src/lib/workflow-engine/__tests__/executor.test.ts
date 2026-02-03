import { getWorkflowExecutor } from '../executor';
import { db } from '@/lib/db';

jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

const mockOpenAiCreate = jest.fn();

jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockOpenAiCreate,
      },
    },
  })),
}));

/**
 * Queue up db.select results for chained calls.
 * @param results - Results returned in order for select calls.
 */
const buildSelectQueue = (results: any[]) => {
  (db.select as jest.Mock).mockImplementation(() => ({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockImplementation(() => {
        const value = results.shift();
        return {
          limit: jest.fn().mockResolvedValue(value),
          then: (resolve: (value: any) => void) => Promise.resolve(value).then(resolve),
        };
      }),
    }),
  }));
};

/**
 * Mock db.insert behavior for execution records.
 * @param executionId - Execution id to return from insert.
 */
const buildInsertMocks = (executionId: string) => {
  (db.insert as jest.Mock).mockImplementation(() => ({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([{ id: executionId, startedAt: new Date() }]),
    }),
  }));
};

/**
 * Mock db.update behavior for chained updates.
 */
const buildUpdateMocks = () => {
  (db.update as jest.Mock).mockImplementation(() => ({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  }));
};

describe('WorkflowExecutor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    buildInsertMocks('exec-123');
    buildUpdateMocks();
  });

  it('fails validation when agent steps are missing selections', async () => {
    const workflow = {
      id: 'workflow-1',
      status: 'active',
      steps: [{ id: 'step-1', type: 'agent' }],
      executionCount: 0,
    };

    buildSelectQueue([[workflow]]);

    const executor = getWorkflowExecutor('test-key');

    const result = await executor.executeWorkflow({ workflowId: workflow.id, userId: 'user-1', variables: {} });

    expect(result.status).toBe('failed');
    expect(result.errorMessage).toContain('Workflow validation failed');
  });

  it('blocks execution for draft workflows', async () => {
    const workflow = {
      id: 'workflow-2',
      status: 'draft',
      steps: [{ id: 'step-1', type: 'agent', agentId: 'agent-1' }],
      executionCount: 0,
    };

    buildSelectQueue([[workflow]]);

    const executor = getWorkflowExecutor('test-key');

    const result = await executor.executeWorkflow({ workflowId: workflow.id, userId: 'user-1', variables: {} });

    expect(result.status).toBe('failed');
    expect(result.errorMessage).toContain('Workflow is in draft status');
  });

  it('blocks execution when workflow references missing agents', async () => {
    const workflow = {
      id: 'workflow-3',
      status: 'active',
      steps: [{ id: 'step-1', type: 'agent', agentId: 'agent-missing' }],
      executionCount: 0,
    };

    buildSelectQueue([[workflow], []]);

    const executor = getWorkflowExecutor('test-key');

    const result = await executor.executeWorkflow({ workflowId: workflow.id, userId: 'user-1', variables: {} });

    expect(result.status).toBe('failed');
    expect(result.errorMessage).toContain('Workflow references missing agents');
  });

  it('executes a multi-step agent workflow successfully', async () => {
    const workflow = {
      id: 'workflow-4',
      status: 'active',
      steps: [
        { id: 'step-1', type: 'agent', agentId: 'agent-1', action: 'Collect data' },
        { id: 'step-2', type: 'agent', agentId: 'agent-2', action: 'Summarize results' },
      ],
      executionCount: 1,
    };

    const agentOne = { id: 'agent-1', name: 'Collector', type: 'research', description: 'Collects data' };
    const agentTwo = { id: 'agent-2', name: 'Summarizer', type: 'analysis', description: 'Summarizes data' };

    buildSelectQueue([
      [workflow],
      [{ id: 'agent-1' }, { id: 'agent-2' }],
      [agentOne],
      [agentTwo],
    ]);

    mockOpenAiCreate
      .mockResolvedValueOnce({ choices: [{ message: { content: 'data collected' } }], usage: { total_tokens: 50 } })
      .mockResolvedValueOnce({ choices: [{ message: { content: 'summary' } }], usage: { total_tokens: 75 } });

    const executor = getWorkflowExecutor('test-key');

    const result = await executor.executeWorkflow({
      workflowId: workflow.id,
      userId: 'user-1',
      variables: {},
      inputData: { topic: 'Retention' },
    });

    expect(result.status).toBe('completed');
    expect(result.outputData).toHaveLength(2);
    expect(mockOpenAiCreate).toHaveBeenCalledTimes(2);
    expect(mockOpenAiCreate.mock.calls[1][0].messages[1].content).toContain('Step 1');
  });
});
