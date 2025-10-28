'use client';

import { AGENT_TEMPLATES, AgentTemplate } from '@/lib/agent-templates';
import * as Icons from 'lucide-react';

interface TemplateSelectionProps {
  onSelect: (template: AgentTemplate) => void;
}

export default function TemplateSelection({ onSelect }: TemplateSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Choose an Agent Template</h3>
        <p className="text-gray-400">
          Select a pre-configured template or start from scratch
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENT_TEMPLATES.map((template) => {
          const IconComponent = (Icons as any)[template.icon] || Icons.Bot;
          
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="group relative p-6 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all text-left"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <IconComponent className="w-6 h-6 text-purple-400" />
              </div>

              {/* Content */}
              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                {template.name}
              </h4>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                  {template.config.model}
                </span>
                <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                  {template.config.tools.length} tools
                </span>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all pointer-events-none" />
            </button>
          );
        })}

        {/* Custom Agent Option */}
        <button
          onClick={() => onSelect({
            id: 'custom',
            name: 'Custom Agent',
            description: 'Build your own agent from scratch',
            type: 'custom',
            icon: 'Settings',
            config: {
              model: 'gpt-4',
              temperature: 0.7,
              maxTokens: 2000,
              tools: [],
            },
            capabilities: {},
            constraints: {},
            promptTemplate: '',
          })}
          className="group relative p-6 bg-gray-800/50 hover:bg-gray-800 rounded-xl border-2 border-dashed border-gray-700 hover:border-purple-500/50 transition-all text-left"
        >
          {/* Icon */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icons.Settings className="w-6 h-6 text-purple-400" />
          </div>

          {/* Content */}
          <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
            Custom Agent
          </h4>
          <p className="text-sm text-gray-400 mb-4">
            Build your own agent from scratch with full customization
          </p>

          {/* Badge */}
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">
            Advanced
          </span>
        </button>
      </div>
    </div>
  );
}

