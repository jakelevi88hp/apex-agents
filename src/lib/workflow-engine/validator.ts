interface WorkflowStepValidationResult {
  valid: boolean;
  errors: string[];
  missingAgentStepIndexes: number[];
}

interface WorkflowStep {
  id?: string;
  type?: 'agent' | 'condition' | 'loop' | 'parallel';
  agentId?: string;
}

/**
 * Validate workflow steps for basic completeness.
 * @param steps - Workflow steps to validate.
 * @returns Validation result with errors and missing agent steps.
 */
export const validateWorkflowSteps = (steps: WorkflowStep[]): WorkflowStepValidationResult => {
  const errors: string[] = [];
  const missingAgentStepIndexes: number[] = [];

  if (!Array.isArray(steps) || steps.length === 0) {
    errors.push('Workflow must include at least one step.');
  }

  steps.forEach((step, index) => {
    if (!step?.type) {
      errors.push(`Step ${index + 1} is missing a type.`);
      return;
    }

    if (step.type === 'agent' && !step.agentId) {
      missingAgentStepIndexes.push(index);
    }
  });

  if (missingAgentStepIndexes.length > 0) {
    errors.push(`Agent steps missing selections: ${missingAgentStepIndexes.map((i) => i + 1).join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    missingAgentStepIndexes,
  };
};
