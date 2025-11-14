'use client';

import { useState } from 'react';
import { AgentTemplate, AVAILABLE_MODELS, AVAILABLE_TOOLS } from '@/lib/agent-templates';
import { ChevronLeft, Save } from 'lucide-react';

export interface AgentConfiguration {
  name: string;
  description: string;
  type: string;
  model: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  capabilities: Record<string, boolean>;
  constraints: Record<string, unknown>;
  promptTemplate: string;
}

interface ConfigurationFormProps {
  template: AgentTemplate;
  onComplete: (config: AgentConfiguration) => void;
  onBack: () => void;
}

export default function ConfigurationForm({ template, onComplete, onBack }: ConfigurationFormProps) {
  const [config, setConfig] = useState<AgentConfiguration>({
    name: template.name === 'Custom Agent' ? '' : template.name,
    description: template.description,
    type: template.type,
    model: template.config.model,
    temperature: template.config.temperature,
    maxTokens: template.config.maxTokens,
    tools: [...template.config.tools],
    capabilities: { ...template.capabilities },
    constraints: { ...template.constraints },
    promptTemplate: template.promptTemplate,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(config);
  };

  const toggleTool = (toolId: string) => {
    setConfig(prev => ({
      ...prev,
      tools: prev.tools.includes(toolId)
        ? prev.tools.filter(t => t !== toolId)
        : [...prev.tools, toolId],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Agent Name *
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., My Research Agent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
              placeholder="Describe what this agent does..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Agent Type
            </label>
            <select
              value={config.type}
              onChange={(e) => setConfig({ ...config, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="research">Research</option>
              <option value="analysis">Analysis</option>
              <option value="writing">Writing</option>
              <option value="code">Code</option>
              <option value="decision">Decision</option>
              <option value="communication">Communication</option>
              <option value="monitoring">Monitoring</option>
              <option value="orchestrator">Orchestrator</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </section>

      {/* Model Configuration */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Model Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language Model
            </label>
            <select
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Temperature: {config.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Precise</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Tokens
            </label>
              <input
                type="number"
                value={config.maxTokens}
                onChange={(e) => {
                  const parsed = Number.parseInt(e.target.value, 10);
                  setConfig({ ...config, maxTokens: Number.isNaN(parsed) ? config.maxTokens : parsed });
                }}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="100"
                max="8000"
                step="100"
              />
              <p className="text-xs text-gray-400 mt-1">
                Maximum length of the agent&rsquo;s response (100-8000)
              </p>
          </div>
        </div>
      </section>

      {/* Tools & Capabilities */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Tools & Capabilities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AVAILABLE_TOOLS.map(tool => (
            <button
              key={tool.id}
              type="button"
              onClick={() => toggleTool(tool.id)}
              className={`p-3 rounded-lg border transition-all text-left ${
                config.tools.includes(tool.id)
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="font-medium text-sm">{tool.name}</div>
              <div className="text-xs mt-1 opacity-75">{tool.description}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Prompt Template */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">System Prompt</h3>
        <textarea
          value={config.promptTemplate}
          onChange={(e) => setConfig({ ...config, promptTemplate: e.target.value })}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm h-48 resize-none"
          placeholder="Enter the system prompt for your agent..."
        />
          <p className="text-xs text-gray-400 mt-2">
            Use {'{task}'} as a placeholder for the user&rsquo;s input
          </p>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-800">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          Continue to Preview
        </button>
      </div>
    </form>
  );
}

