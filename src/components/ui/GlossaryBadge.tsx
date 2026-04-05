'use client';
import HelpTooltip from './HelpTooltip';

const GLOSSARY: Record<string, string> = {
  'agent type': 'The category of work this AI specializes in. Pick the type that matches your use case — you can always create more agents of different types.',
  'capabilities': 'The built-in tools and skills this agent can use automatically. These are set based on the agent type you choose.',
  'execute': 'Run this agent on a specific task right now. You\'ll give it an objective and it will work to complete it.',
  'objective': 'The specific task or question you want the agent to work on. Be as specific as possible for best results.',
  'workflow': 'A multi-step automation that chains agents and actions together. Think of it as a recipe — each step feeds into the next.',
  'knowledge base': 'Documents, PDFs, or text you upload so agents can search and reference them when answering questions.',
  'semantic search': 'A smarter search that finds documents by meaning, not just exact keywords. Useful for finding relevant info in large documents.',
  'model': 'The AI model powering this agent (e.g., GPT-4). Different models have different strengths and costs.',
  'system prompt': 'Instructions that tell the AI how to behave, what role to play, and what rules to follow. Think of it as a job description for the agent.',
  'orchestrator': 'A special agent type that manages and coordinates other agents to complete complex multi-step tasks.',
  'embedding': 'A way of converting text into numbers so the AI can compare and search documents by meaning.',
  'execution': 'One run of an agent or workflow. Each time you give an agent a task, that creates one execution.',
};

interface GlossaryBadgeProps {
  term: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function GlossaryBadge({ term, className, position = 'top' }: GlossaryBadgeProps) {
  const definition = GLOSSARY[term.toLowerCase()];
  if (!definition) return null;
  return <HelpTooltip text={definition} position={position} className={className} />;
}
