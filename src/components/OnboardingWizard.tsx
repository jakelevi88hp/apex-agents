'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Headphones, Users, PenTool, BarChart3, CalendarCheck, Mail,
  ChevronRight, X, Sparkles, CheckCircle, ArrowRight,
} from 'lucide-react';

const USE_CASES = [
  {
    id: 'customer_support',
    label: 'Customer Support Bot',
    agentType: 'communication',
    description: 'Handle customer queries, FAQs, and support tickets automatically',
    icon: Headphones,
    color: 'from-blue-500 to-cyan-500',
    blurb: 'Answer FAQs and handle customer queries 24/7',
  },
  {
    id: 'lead_qualifier',
    label: 'Lead Qualifier',
    agentType: 'decision',
    description: 'Score and qualify inbound leads based on your criteria',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    blurb: 'Score and qualify inbound leads automatically',
  },
  {
    id: 'content_writer',
    label: 'Content Writer',
    agentType: 'writing',
    description: 'Generate blog posts, emails, social media, and marketing copy',
    icon: PenTool,
    color: 'from-purple-500 to-pink-500',
    blurb: 'Generate blog posts, emails, and marketing copy',
  },
  {
    id: 'data_analyst',
    label: 'Data Analyst',
    agentType: 'analysis',
    description: 'Analyze data, identify trends, and surface actionable insights',
    icon: BarChart3,
    color: 'from-orange-500 to-red-500',
    blurb: 'Analyze data and surface key insights',
  },
  {
    id: 'meeting_summarizer',
    label: 'Meeting Summarizer',
    agentType: 'analysis',
    description: 'Turn meeting notes into summaries, action items, and follow-ups',
    icon: CalendarCheck,
    color: 'from-yellow-500 to-orange-500',
    blurb: 'Turn meeting notes into action items and summaries',
  },
  {
    id: 'email_responder',
    label: 'Email Responder',
    agentType: 'communication',
    description: 'Draft and send contextual, professional email replies',
    icon: Mail,
    color: 'from-indigo-500 to-purple-500',
    blurb: 'Draft and send contextual email replies',
  },
] as const;

type UseCase = (typeof USE_CASES)[number];

const STORAGE_KEY = 'apex_onboarding_complete';

export default function OnboardingWizard() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [agentName, setAgentName] = useState('');
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        const t = setTimeout(() => setVisible(true), 700);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch { /* ignore */ }
    setVisible(false);
  };

  const animateTo = (nextStep: number) => {
    setLeaving(true);
    setTimeout(() => {
      setStep(nextStep);
      setLeaving(false);
    }, 180);
  };

  const handleSelectUseCase = (uc: UseCase) => {
    setSelectedUseCase(uc);
    setAgentName(uc.label);
    animateTo(2);
  };

  const handleLaunch = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      // Store pending onboarding data so agents page can pre-fill
      if (selectedUseCase) {
        localStorage.setItem(
          'apex_onboarding_pending',
          JSON.stringify({ name: agentName, type: selectedUseCase.agentType, description: selectedUseCase.description })
        );
      }
    } catch { /* ignore */ }
    setVisible(false);
    router.push('/dashboard/agents');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">Quick Start</span>
          </div>
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-purple-500'
                    : s < step
                    ? 'w-4 bg-purple-700'
                    : 'w-4 bg-gray-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={dismiss}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step content with fade transition */}
        <div
          className={`transition-all duration-180 ${
            leaving ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* ── Step 1: Choose use case ── */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-1">What do you want to automate?</h2>
              <p className="text-gray-400 text-sm mb-5">
                Pick a use case — we&apos;ll set up your first agent for you.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {USE_CASES.map((uc) => {
                  const Icon = uc.icon;
                  return (
                    <button
                      key={uc.id}
                      onClick={() => handleSelectUseCase(uc)}
                      className="group text-left p-4 bg-gray-800 border border-gray-700 hover:border-purple-500/60 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${uc.color} mb-3`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="font-semibold text-white text-sm leading-tight mb-1">{uc.label}</div>
                      <div className="text-gray-400 text-xs leading-snug">{uc.blurb}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={dismiss}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Name the agent ── */}
          {step === 2 && selectedUseCase && (
            <div className="p-6">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${selectedUseCase.color} mb-4`}>
                <selectedUseCase.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Name your first agent</h2>
              <p className="text-gray-400 text-sm mb-5">
                Give it a name — you can always change this later.
              </p>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agentName.trim() && animateTo(3)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="e.g., My Support Bot"
                autoFocus
              />
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={dismiss}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={() => animateTo(3)}
                  disabled={!agentName.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Ready! ── */}
          {step === 3 && selectedUseCase && (
            <div className="p-6 text-center">
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedUseCase.color}`}>
                    <selectedUseCase.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-gray-900">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">You&apos;re ready!</h2>
              <p className="text-gray-400 text-sm mb-5">Here&apos;s what we&apos;ll create for you:</p>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider w-20 flex-shrink-0">Name</span>
                  <span className="text-white font-medium">{agentName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider w-20 flex-shrink-0">Use case</span>
                  <span className="text-white font-medium">{selectedUseCase.label}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider w-20 flex-shrink-0 pt-0.5">Purpose</span>
                  <span className="text-gray-300 text-sm">{selectedUseCase.description}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={dismiss}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleLaunch}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                >
                  <ArrowRight className="w-4 h-4" />
                  Launch Agent
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
