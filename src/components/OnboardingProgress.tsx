'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Circle, X, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

const STORAGE_KEY = 'apex_progress_dismissed';
const ONBOARDING_DONE_KEY = 'apex_onboarding_complete';

type Step = {
  id: string;
  label: string;
  description: string;
  cta: string;
  href: string;
  done: boolean;
};

export default function OnboardingProgress() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { data: agentsData } = trpc.agents.list.useQuery({ page: 1, limit: 1 });
  const { data: workflowsData } = trpc.workflows.list.useQuery(undefined);

  const hasAgent = (agentsData?.agents?.length ?? 0) > 0;
  const hasWorkflow = ((workflowsData as any)?.workflows?.length ?? (Array.isArray(workflowsData) ? workflowsData.length : 0)) > 0;

  const steps: Step[] = [
    {
      id: 'onboarding',
      label: 'Complete setup',
      description: 'Finish the quick-start wizard',
      cta: 'Done',
      href: '/dashboard',
      done: true,
    },
    {
      id: 'agent',
      label: 'Create your first agent',
      description: 'Build an AI agent to start automating',
      cta: 'Create Agent →',
      href: '/dashboard/agents?action=new',
      done: hasAgent,
    },
    {
      id: 'workflow',
      label: 'Build a workflow',
      description: 'Chain agents into a multi-step pipeline',
      cta: 'Build Workflow →',
      href: '/dashboard/workflows?action=new',
      done: hasWorkflow,
    },
    {
      id: 'knowledge',
      label: 'Upload a document',
      description: 'Give your agents context to work with',
      cta: 'Upload Doc →',
      href: '/dashboard/knowledge?tab=upload',
      done: false,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);
  const allDone = completedCount === steps.length;

  useEffect(() => {
    try {
      const onboardingDone = localStorage.getItem(ONBOARDING_DONE_KEY);
      const wasDismissed = localStorage.getItem(STORAGE_KEY);
      if (onboardingDone && !wasDismissed) {
        setVisible(true);
      }
      if (wasDismissed) setDismissed(true);
    } catch { /* ignore */ }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* ignore */ }
    setDismissed(true);
    setVisible(false);
  };

  if (!visible || dismissed) return null;

  return (
    <div className="mb-6 bg-gray-800 border border-purple-500/30 rounded-xl p-5 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {allDone ? (
              <Trophy className="w-5 h-5 text-yellow-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-purple-400" />
            )}
            <div>
              <h3 className="font-semibold text-white text-sm">
                {allDone ? 'Setup complete! 🎉' : 'Getting started'}
              </h3>
              <p className="text-xs text-gray-400">
                {allDone
                  ? "You're all set. Your workspace is ready."
                  : `${completedCount} of ${steps.length} steps complete`}
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-500 hover:text-gray-300 p-1 rounded-lg hover:bg-gray-700 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-700 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                step.done
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-gray-700/50 border border-gray-700 hover:border-purple-500/40 cursor-pointer'
              }`}
              onClick={() => !step.done && router.push(step.href)}
            >
              <div className="flex items-center gap-3">
                {step.done ? (
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
                <div>
                  <div className={`text-sm font-medium ${step.done ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {step.label}
                  </div>
                  {!step.done && (
                    <div className="text-xs text-gray-500">{step.description}</div>
                  )}
                </div>
              </div>
              {!step.done && (
                <div className="flex items-center gap-1 text-xs text-purple-400 font-medium flex-shrink-0">
                  {step.cta}
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>

        {allDone && (
          <button
            onClick={dismiss}
            className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Dismiss checklist
          </button>
        )}
      </div>
    </div>
  );
}
