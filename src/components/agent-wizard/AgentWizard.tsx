'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { AgentTemplate } from '@/lib/agent-templates';
import TemplateSelection from './TemplateSelection';
import ConfigurationForm, { type AgentConfiguration } from './ConfigurationForm';
import PreviewTest from './PreviewTest';

interface AgentWizardProps {
  onClose: () => void;
  onComplete: (agentData: AgentConfiguration) => void;
}

type WizardStep = 'template' | 'configure' | 'preview';

export default function AgentWizard({ onClose, onComplete }: AgentWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [agentConfig, setAgentConfig] = useState<AgentConfiguration | null>(null);

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('configure');
  };

  const handleConfigureComplete = (config: AgentConfiguration) => {
    setAgentConfig(config);
    setCurrentStep('preview');
  };

  const handlePreviewComplete = () => {
    if (agentConfig) {
      onComplete(agentConfig);
    }
  };

  const handleBack = () => {
    if (currentStep === 'configure') {
      setCurrentStep('template');
    } else if (currentStep === 'preview') {
      setCurrentStep('configure');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Agent</h2>
            <p className="text-gray-400 mt-1">
              {currentStep === 'template' && 'Choose a template to get started'}
              {currentStep === 'configure' && 'Configure your agent'}
              {currentStep === 'preview' && 'Preview and test your agent'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 p-6 border-b border-gray-800">
          <Step
            number={1}
            label="Template"
            active={currentStep === 'template'}
            completed={currentStep !== 'template'}
          />
          <div className="w-16 h-0.5 bg-gray-800">
            <div
              className={`h-full bg-purple-500 transition-all duration-300 ${
                currentStep !== 'template' ? 'w-full' : 'w-0'
              }`}
            />
          </div>
          <Step
            number={2}
            label="Configure"
            active={currentStep === 'configure'}
            completed={currentStep === 'preview'}
          />
          <div className="w-16 h-0.5 bg-gray-800">
            <div
              className={`h-full bg-purple-500 transition-all duration-300 ${
                currentStep === 'preview' ? 'w-full' : 'w-0'
              }`}
            />
          </div>
          <Step
            number={3}
            label="Preview"
            active={currentStep === 'preview'}
            completed={false}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {currentStep === 'template' && (
            <TemplateSelection onSelect={handleTemplateSelect} />
          )}
          {currentStep === 'configure' && selectedTemplate && (
            <ConfigurationForm
              template={selectedTemplate}
              onComplete={handleConfigureComplete}
              onBack={handleBack}
            />
          )}
          {currentStep === 'preview' && agentConfig && (
            <PreviewTest
              config={agentConfig}
              onComplete={handlePreviewComplete}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface StepProps {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}

function Step({ number, label, active, completed }: StepProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
          completed
            ? 'bg-purple-500 text-white'
            : active
            ? 'bg-purple-500 text-white ring-4 ring-purple-500/20'
            : 'bg-gray-800 text-gray-400'
        }`}
      >
        {number}
      </div>
      <span
        className={`text-sm font-medium ${
          active ? 'text-white' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

