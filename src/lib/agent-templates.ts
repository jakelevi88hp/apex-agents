/**
 * Agent Templates
 * 
 * Pre-configured agent templates for quick setup
 */

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  config: {
    model: string;
    temperature: number;
    maxTokens: number;
    tools: string[];
  };
  capabilities: Record<string, boolean>;
  constraints: Record<string, any>;
  promptTemplate: string;
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'research-agent',
    name: 'Research Agent',
    description: 'Conducts comprehensive research on any topic with verified sources and fact-checking',
    type: 'research',
    icon: 'Search',
    config: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 4000,
      tools: ['web_search', 'fact_check', 'source_verification', 'summarization'],
    },
    capabilities: {
      research: true,
      factChecking: true,
      sourceVerification: true,
      summarization: true,
      webSearch: true,
    },
    constraints: {
      maxSources: 10,
      requireVerification: true,
      minConfidenceScore: 0.8,
      allowedDomains: [],
    },
    promptTemplate: `You are a research agent specialized in conducting thorough, accurate research.

Your capabilities:
- Comprehensive web search and information gathering
- Fact-checking and source verification
- Summarization and synthesis of information
- Citation management

Your constraints:
- Always verify facts from multiple sources
- Provide citations for all claims
- Maintain a minimum confidence score of 0.8
- Flag uncertain or contradictory information

Task: {task}

Please conduct research and provide a comprehensive, well-sourced response.`,
  },
  {
    id: 'data-analysis-agent',
    name: 'Data Analysis Agent',
    description: 'Analyzes data, generates insights, and creates visualizations',
    type: 'analysis',
    icon: 'BarChart3',
    config: {
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 3000,
      tools: ['data_analysis', 'visualization', 'statistical_testing', 'pattern_recognition'],
    },
    capabilities: {
      dataAnalysis: true,
      visualization: true,
      statisticalAnalysis: true,
      patternRecognition: true,
      predictiveModeling: true,
    },
    constraints: {
      maxDataPoints: 100000,
      supportedFormats: ['csv', 'json', 'excel', 'parquet'],
      requireDataValidation: true,
    },
    promptTemplate: `You are a data analysis agent specialized in extracting insights from data.

Your capabilities:
- Statistical analysis and hypothesis testing
- Data visualization and charting
- Pattern recognition and anomaly detection
- Predictive modeling

Your constraints:
- Validate data quality before analysis
- Handle up to 100,000 data points
- Support CSV, JSON, Excel, and Parquet formats
- Provide confidence intervals for predictions

Task: {task}

Please analyze the data and provide actionable insights.`,
  },
  {
    id: 'content-writer-agent',
    name: 'Content Writer Agent',
    description: 'Creates high-quality content with proper citations and style adaptation',
    type: 'writing',
    icon: 'FileText',
    config: {
      model: 'gpt-4',
      temperature: 0.8,
      maxTokens: 5000,
      tools: ['grammar_check', 'plagiarism_check', 'citation_generator', 'style_adaptation'],
    },
    capabilities: {
      contentGeneration: true,
      editing: true,
      citationManagement: true,
      styleAdaptation: true,
      seoOptimization: true,
    },
    constraints: {
      maxLength: 10000,
      requireCitations: true,
      minReadabilityScore: 60,
      allowedStyles: ['academic', 'professional', 'casual', 'technical'],
    },
    promptTemplate: `You are a content writing agent specialized in creating high-quality, engaging content.

Your capabilities:
- Content generation in various styles
- Grammar and spelling correction
- Citation management
- SEO optimization
- Readability optimization

Your constraints:
- Maximum content length: 10,000 words
- Minimum readability score: 60
- Always provide citations for facts
- Adapt to requested writing style

Task: {task}

Please create content that meets the requirements.`,
  },
  {
    id: 'code-agent',
    name: 'Code Agent',
    description: 'Writes, reviews, and debugs code with best practices and testing',
    type: 'code',
    icon: 'Code2',
    config: {
      model: 'gpt-4',
      temperature: 0.2,
      maxTokens: 4000,
      tools: ['code_generation', 'code_review', 'debugging', 'testing', 'documentation'],
    },
    capabilities: {
      codeGeneration: true,
      codeReview: true,
      debugging: true,
      testing: true,
      documentation: true,
      refactoring: true,
    },
    constraints: {
      supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'go', 'rust'],
      requireTests: true,
      requireDocumentation: true,
      maxFileSize: 5000,
    },
    promptTemplate: `You are a code agent specialized in software development.

Your capabilities:
- Code generation in multiple languages
- Code review and best practices
- Debugging and error resolution
- Test generation
- Documentation writing

Your constraints:
- Always include tests for new code
- Follow language-specific best practices
- Provide clear documentation
- Maximum file size: 5000 lines

Task: {task}

Please provide clean, well-tested, documented code.`,
  },
  {
    id: 'decision-agent',
    name: 'Decision Agent',
    description: 'Analyzes options and provides data-driven recommendations',
    type: 'decision',
    icon: 'GitBranch',
    config: {
      model: 'gpt-4',
      temperature: 0.5,
      maxTokens: 3000,
      tools: ['decision_analysis', 'risk_assessment', 'scenario_planning', 'cost_benefit'],
    },
    capabilities: {
      decisionAnalysis: true,
      riskAssessment: true,
      scenarioPlanning: true,
      costBenefitAnalysis: true,
      multiCriteriaDecision: true,
    },
    constraints: {
      maxOptions: 10,
      requireRiskAnalysis: true,
      requireCostBenefit: true,
    },
    promptTemplate: `You are a decision agent specialized in analyzing options and providing recommendations.

Your capabilities:
- Multi-criteria decision analysis
- Risk assessment and mitigation
- Scenario planning
- Cost-benefit analysis
- Trade-off analysis

Your constraints:
- Analyze up to 10 options
- Always include risk assessment
- Provide cost-benefit analysis
- Consider multiple criteria

Task: {task}

Please analyze the options and provide a data-driven recommendation.`,
  },
  {
    id: 'communication-agent',
    name: 'Communication Agent',
    description: 'Drafts emails, messages, and communications with tone adaptation',
    type: 'communication',
    icon: 'MessageSquare',
    config: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      tools: ['email_drafting', 'tone_analysis', 'translation', 'summarization'],
    },
    capabilities: {
      emailDrafting: true,
      toneAdaptation: true,
      translation: true,
      summarization: true,
      responseGeneration: true,
    },
    constraints: {
      maxLength: 2000,
      supportedTones: ['professional', 'friendly', 'formal', 'casual', 'persuasive'],
      supportedLanguages: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
    },
    promptTemplate: `You are a communication agent specialized in drafting effective communications.

Your capabilities:
- Email and message drafting
- Tone adaptation
- Translation
- Summarization
- Response generation

Your constraints:
- Maximum length: 2000 words
- Adapt to requested tone
- Support multiple languages
- Maintain clarity and professionalism

Task: {task}

Please draft a communication that meets the requirements.`,
  },
  {
    id: 'monitoring-agent',
    name: 'Monitoring Agent',
    description: 'Monitors systems, detects anomalies, and sends alerts',
    type: 'monitoring',
    icon: 'Activity',
    config: {
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 2000,
      tools: ['anomaly_detection', 'alerting', 'log_analysis', 'metric_tracking'],
    },
    capabilities: {
      anomalyDetection: true,
      alerting: true,
      logAnalysis: true,
      metricTracking: true,
      trendAnalysis: true,
    },
    constraints: {
      maxMetrics: 100,
      alertThresholds: {},
      monitoringInterval: 60,
    },
    promptTemplate: `You are a monitoring agent specialized in system observation and alerting.

Your capabilities:
- Anomaly detection
- Alert generation
- Log analysis
- Metric tracking
- Trend analysis

Your constraints:
- Monitor up to 100 metrics
- Configurable alert thresholds
- Default monitoring interval: 60 seconds

Task: {task}

Please monitor the system and report any issues.`,
  },
  {
    id: 'orchestrator-agent',
    name: 'Orchestrator Agent',
    description: 'Coordinates multiple agents and manages complex workflows',
    type: 'orchestrator',
    icon: 'Network',
    config: {
      model: 'gpt-4',
      temperature: 0.5,
      maxTokens: 3000,
      tools: ['task_decomposition', 'agent_coordination', 'workflow_management', 'result_aggregation'],
    },
    capabilities: {
      taskDecomposition: true,
      agentCoordination: true,
      workflowManagement: true,
      resultAggregation: true,
      errorHandling: true,
    },
    constraints: {
      maxAgents: 10,
      maxSteps: 20,
      requireErrorHandling: true,
    },
    promptTemplate: `You are an orchestrator agent specialized in coordinating multiple agents.

Your capabilities:
- Task decomposition
- Agent coordination
- Workflow management
- Result aggregation
- Error handling

Your constraints:
- Coordinate up to 10 agents
- Manage up to 20 workflow steps
- Always include error handling

Task: {task}

Please orchestrate the agents to complete the task.`,
  },
];

export const AVAILABLE_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable, best for complex tasks' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Faster, more cost-effective' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Excellent reasoning' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
];

export const AVAILABLE_TOOLS = [
  { id: 'web_search', name: 'Web Search', description: 'Search the web for information' },
  { id: 'fact_check', name: 'Fact Check', description: 'Verify facts and claims' },
  { id: 'source_verification', name: 'Source Verification', description: 'Verify source credibility' },
  { id: 'summarization', name: 'Summarization', description: 'Summarize long content' },
  { id: 'data_analysis', name: 'Data Analysis', description: 'Analyze structured data' },
  { id: 'visualization', name: 'Visualization', description: 'Create charts and graphs' },
  { id: 'statistical_testing', name: 'Statistical Testing', description: 'Perform statistical tests' },
  { id: 'pattern_recognition', name: 'Pattern Recognition', description: 'Identify patterns in data' },
  { id: 'grammar_check', name: 'Grammar Check', description: 'Check grammar and spelling' },
  { id: 'plagiarism_check', name: 'Plagiarism Check', description: 'Detect plagiarism' },
  { id: 'citation_generator', name: 'Citation Generator', description: 'Generate citations' },
  { id: 'style_adaptation', name: 'Style Adaptation', description: 'Adapt writing style' },
  { id: 'code_generation', name: 'Code Generation', description: 'Generate code' },
  { id: 'code_review', name: 'Code Review', description: 'Review code quality' },
  { id: 'debugging', name: 'Debugging', description: 'Debug code issues' },
  { id: 'testing', name: 'Testing', description: 'Generate tests' },
  { id: 'documentation', name: 'Documentation', description: 'Write documentation' },
  { id: 'decision_analysis', name: 'Decision Analysis', description: 'Analyze decisions' },
  { id: 'risk_assessment', name: 'Risk Assessment', description: 'Assess risks' },
  { id: 'scenario_planning', name: 'Scenario Planning', description: 'Plan scenarios' },
  { id: 'cost_benefit', name: 'Cost-Benefit Analysis', description: 'Analyze costs and benefits' },
  { id: 'email_drafting', name: 'Email Drafting', description: 'Draft emails' },
  { id: 'tone_analysis', name: 'Tone Analysis', description: 'Analyze tone' },
  { id: 'translation', name: 'Translation', description: 'Translate text' },
  { id: 'anomaly_detection', name: 'Anomaly Detection', description: 'Detect anomalies' },
  { id: 'alerting', name: 'Alerting', description: 'Send alerts' },
  { id: 'log_analysis', name: 'Log Analysis', description: 'Analyze logs' },
  { id: 'metric_tracking', name: 'Metric Tracking', description: 'Track metrics' },
  { id: 'task_decomposition', name: 'Task Decomposition', description: 'Break down tasks' },
  { id: 'agent_coordination', name: 'Agent Coordination', description: 'Coordinate agents' },
  { id: 'workflow_management', name: 'Workflow Management', description: 'Manage workflows' },
  { id: 'result_aggregation', name: 'Result Aggregation', description: 'Aggregate results' },
];

