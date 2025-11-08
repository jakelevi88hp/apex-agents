'use client';

import React from 'react';
import { Lightbulb, Sparkles, ChevronRight } from 'lucide-react';

interface ExampleRequest {
  simple: string;
  expanded: string;
}

interface ExampleRequestsPanelProps {
  examples: ExampleRequest[];
  onSelectExample: (example: string) => void;
  isLoading?: boolean;
}

export default function ExampleRequestsPanel({
  examples,
  onSelectExample,
  isLoading = false,
}: ExampleRequestsPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-blue-600 animate-pulse" />
          <h3 className="font-semibold text-gray-900">Loading examples...</h3>
        </div>
      </div>
    );
  }

  if (examples.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Example Requests</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Click any example to try it, or type your own request in plain language:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onSelectExample(example.simple)}
            className="group text-left bg-white border border-blue-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">
                    "{example.simple}"
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {example.expanded}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>
            <strong>Tip:</strong> You can use simple, natural language like "add dark mode" or "fix the login bug"
          </span>
        </p>
      </div>
    </div>
  );
}
