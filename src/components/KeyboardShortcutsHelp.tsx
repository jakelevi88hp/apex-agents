'use client';

import { useState, useEffect } from 'react';
import { X, Command, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  {
    section: 'Global',
    items: [
      { keys: ['⌘', 'K'], label: 'Open command palette' },
      { keys: ['?'], label: 'Show keyboard shortcuts' },
      { keys: ['Esc'], label: 'Close modal / cancel' },
    ],
  },
  {
    section: 'Agents',
    items: [
      { keys: ['⌘', 'N'], label: 'Create new agent' },
      { keys: ['⌘', 'F'], label: 'Search agents' },
      { keys: ['⌘', 'B'], label: 'Toggle bulk select mode' },
    ],
  },
  {
    section: 'Navigation',
    items: [
      { keys: ['G', 'A'], label: 'Go to Agents' },
      { keys: ['G', 'W'], label: 'Go to Workflows' },
      { keys: ['G', 'K'], label: 'Go to Knowledge' },
      { keys: ['G', 'D'], label: 'Go to Analytics' },
    ],
  },
];

export default function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === '?') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">Keyboard Shortcuts</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-300 p-1 rounded-lg hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {SHORTCUTS.map((section) => (
            <div key={section.section}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.section}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-gray-600 text-xs">+</span>}
                          <kbd className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 font-mono">
                            {key === '⌘' ? (
                              <span className="flex items-center gap-0.5">
                                <Command className="w-3 h-3" />
                              </span>
                            ) : key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-gray-800 text-xs text-gray-600 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-400">?</kbd> anywhere to toggle this panel
        </div>
      </div>
    </div>
  );
}
