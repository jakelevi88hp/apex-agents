'use client';
import { useState } from 'react';
import { MessageCircle, X, Mail, FileText, ExternalLink, ChevronRight, Sparkles } from 'lucide-react';

const SUPPORT_OPTIONS = [
  {
    icon: FileText,
    label: 'Browse the Docs',
    description: 'Step-by-step guides and how-tos',
    href: '/dashboard/docs',
    external: false,
  },
  {
    icon: Sparkles,
    label: 'Quick Start Tutorial',
    description: 'Create your first agent in 2 minutes',
    href: '/dashboard/docs',
    external: false,
  },
  {
    icon: Mail,
    label: 'Email Support',
    description: 'Get help from our team',
    href: 'mailto:support@apexagents.ai',
    external: true,
  },
];

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Panel */}
      {open && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-80 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white text-sm">Apex Support</span>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white/80 text-xs">How can we help you today?</p>
          </div>

          {/* Greeting */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800 rounded-xl rounded-tl-none p-3 text-xs text-gray-300 leading-relaxed">
                Hi there! 👋 I&apos;m here to help you get the most out of Apex Agents. What are you trying to do?
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="p-3 space-y-2">
            {SUPPORT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <a
                  key={opt.label}
                  href={opt.href}
                  target={opt.external ? '_blank' : undefined}
                  rel={opt.external ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors group"
                  onClick={() => !opt.external && setOpen(false)}
                >
                  <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                    <Icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.description}</div>
                  </div>
                  {opt.external ? (
                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 text-center">
            <p className="text-xs text-gray-600">
              Typically reply within a few hours
            </p>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95 ${
          open
            ? 'bg-gray-700 hover:bg-gray-600'
            : 'bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-purple-500/30'
        }`}
        aria-label="Support"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
