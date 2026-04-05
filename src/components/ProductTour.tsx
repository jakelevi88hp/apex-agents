'use client';
import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Bot, Workflow, BookOpen, BarChart3, Zap } from 'lucide-react';

const TOUR_KEY = 'apex_tour_complete';
const ONBOARDING_KEY = 'apex_onboarding_complete';

const STEPS = [
  {
    icon: Sparkles,
    gradient: 'from-purple-500 to-blue-500',
    title: 'Welcome to Apex Agents! 👋',
    body: 'This quick 5-step tour shows you where everything lives. It takes about 30 seconds. You can skip it at any time.',
    highlight: null,
    position: 'center' as const,
  },
  {
    icon: Bot,
    gradient: 'from-blue-500 to-cyan-500',
    title: 'Your Agents',
    body: 'The Agents page is your home base. Create an AI agent here, pick a use-case template, give it a name, and you\'re done. Each agent can be run at any time with a single click.',
    highlight: 'agents',
    position: 'right' as const,
  },
  {
    icon: Zap,
    gradient: 'from-purple-500 to-pink-500',
    title: 'Running an Agent',
    body: 'Click "Execute" on any agent card to give it a task. Type what you want it to do in plain English — like "Write a summary of our Q1 sales" — and it gets to work.',
    highlight: 'execute',
    position: 'center' as const,
  },
  {
    icon: Workflow,
    gradient: 'from-cyan-500 to-teal-500',
    title: 'Workflows',
    body: 'Workflows let you chain agents together automatically. Step 1 gathers data, Step 2 analyzes it, Step 3 sends a report — all without you doing anything.',
    highlight: 'workflows',
    position: 'right' as const,
  },
  {
    icon: BookOpen,
    gradient: 'from-green-500 to-emerald-500',
    title: 'Knowledge Base',
    body: 'Upload your documents here — PDFs, notes, manuals, anything. Your agents can then search and reference this content automatically when answering questions.',
    highlight: 'knowledge',
    position: 'right' as const,
  },
  {
    icon: BarChart3,
    gradient: 'from-yellow-500 to-orange-500',
    title: "You're all set! 🎉",
    body: 'That\'s everything you need to know. Start by creating your first agent — we recommend the Customer Support Bot or Content Writer template to get going fast.',
    highlight: null,
    position: 'center' as const,
  },
];

export default function ProductTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(TOUR_KEY);
      const onboarded = localStorage.getItem(ONBOARDING_KEY);
      // Show tour a bit after onboarding wizard would have shown
      if (!done && onboarded) {
        const t = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(t);
      }
    } catch { /* ignore */ }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(TOUR_KEY, 'true'); } catch { /* ignore */ }
    setVisible(false);
  };

  const go = (next: number) => {
    setLeaving(true);
    setTimeout(() => { setStep(next); setLeaving(false); }, 160);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]" onClick={dismiss} />

      {/* Tour card */}
      <div className="fixed z-[160] inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto transition-all duration-160 ${
            leaving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-800">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-purple-500' : i < step ? 'w-3 bg-purple-700' : 'w-3 bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <button onClick={dismiss} className="text-gray-600 hover:text-gray-300 p-1 rounded-lg hover:bg-gray-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${current.gradient} mb-4`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{current.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{current.body}</p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 flex items-center justify-between">
            {!isFirst ? (
              <button onClick={() => go(step - 1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button onClick={dismiss} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Skip tour
              </button>
            )}
            <button
              onClick={() => isLast ? dismiss() : go(step + 1)}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl text-sm font-medium transition-all hover:scale-105"
            >
              {isLast ? 'Get started' : 'Next'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
