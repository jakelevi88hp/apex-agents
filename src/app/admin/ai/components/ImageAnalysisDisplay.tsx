'use client';

import { Eye, Code, AlertCircle, Layers } from 'lucide-react';

interface VisionAnalysisResult {
  description: string;
  detectedElements: string[];
  suggestedContext: string;
  codeSnippets?: string[];
  uiComponents?: string[];
  errorMessages?: string[];
}

interface ImageAnalysisDisplayProps {
  analysis: VisionAnalysisResult;
  imageUrl: string;
}

export default function ImageAnalysisDisplay({
  analysis,
  imageUrl,
}: ImageAnalysisDisplayProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Image Preview */}
      <div className="relative aspect-video bg-gray-900">
        <img
          src={imageUrl}
          alt="Analyzed image"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Analysis Results */}
      <div className="p-4 space-y-4">
        {/* Description */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Eye className="w-4 h-4" />
            Analysis
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            {analysis.description}
          </p>
        </div>

        {/* Suggested Context */}
        {analysis.suggestedContext && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Layers className="w-4 h-4" />
              Context
            </div>
            <p className="text-sm text-purple-400">
              {analysis.suggestedContext}
            </p>
          </div>
        )}

        {/* UI Components */}
        {analysis.uiComponents && analysis.uiComponents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Layers className="w-4 h-4" />
              UI Components Detected
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.uiComponents.map((component, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded border border-purple-500/30"
                >
                  {component}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Code Snippets */}
        {analysis.codeSnippets && analysis.codeSnippets.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Code className="w-4 h-4" />
              Code Detected
            </div>
            <div className="space-y-2">
              {analysis.codeSnippets.map((snippet, idx) => (
                <pre
                  key={idx}
                  className="text-xs bg-gray-900 text-gray-300 p-2 rounded border border-gray-700 overflow-x-auto"
                >
                  {snippet}
                </pre>
              ))}
            </div>
          </div>
        )}

        {/* Error Messages */}
        {analysis.errorMessages && analysis.errorMessages.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-red-400 mb-2">
              <AlertCircle className="w-4 h-4" />
              Errors Detected
            </div>
            <div className="space-y-2">
              {analysis.errorMessages.map((error, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-red-500/10 text-red-300 p-2 rounded border border-red-500/30"
                >
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Detected Elements */}
        {analysis.detectedElements.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-1">All Detected Elements</div>
            <div className="flex flex-wrap gap-1">
              {analysis.detectedElements.map((element, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs bg-gray-700 text-gray-400 rounded"
                >
                  {element}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
