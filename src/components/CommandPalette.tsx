'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Bot, Workflow, BookOpen, BarChart3, Settings, FileText,
  Plus, Play, Zap, ArrowRight, Command, X, Layers, Link2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

type ResultItem = {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  gradient?: string;
  action: () => void;
  category: string;
};

const NAV_ITEMS: ResultItem[] = [
  { id: 'nav-agents', label: 'Go to Agents', sublabel: 'Manage your AI agents', icon: Bot, category: 'Navigation', action: () => {} },
  { id: 'nav-workflows', label: 'Go to Workflows', sublabel: 'Build automation pipelines', icon: Workflow, category: 'Navigation', action: () => {} },
  { id: 'nav-knowledge', label: 'Go to Knowledge', sublabel: 'Manage documents & search', icon: BookOpen, category: 'Navigation', action: () => {} },
  { id: 'nav-analytics', label: 'Go to Analytics', sublabel: 'View performance metrics', icon: BarChart3, category: 'Navigation', action: () => {} },
  { id: 'nav-integrations', label: 'Go to Integrations', sublabel: 'Connect external services', icon: Link2, category: 'Navigation', action: () => {} },
  { id: 'nav-docs', label: 'Go to Docs', sublabel: 'Reference & how-to guides', icon: FileText, category: 'Navigation', action: () => {} },
  { id: 'nav-settings', label: 'Go to Settings', sublabel: 'Account & configuration', icon: Settings, category: 'Navigation', action: () => {} },
];

const ACTION_ITEMS: ResultItem[] = [
  {
    id: 'action-new-agent', label: 'New Agent', sublabel: 'Create a new AI agent',
    icon: Plus, gradient: 'from-purple-500 to-blue-500', category: 'Quick Actions', action: () => {},
  },
  {
    id: 'action-new-workflow', label: 'New Workflow', sublabel: 'Build an automation pipeline',
    icon: Zap, gradient: 'from-cyan-500 to-teal-500', category: 'Quick Actions', action: () => {},
  },
  {
    id: 'action-upload', label: 'Upload Document', sublabel: 'Add to knowledge base',
    icon: BookOpen, gradient: 'from-green-500 to-emerald-500', category: 'Quick Actions', action: () => {},
  },
];

function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: agentsData } = trpc.agents.list.useQuery(
    { page: 1, limit: 50 },
    { enabled: open, staleTime: 30_000 }
  );
  const { data: workflowsData } = trpc.workflows.list.useQuery(
    undefined,
    { enabled: open, staleTime: 30_000 }
  );

  const buildNavItems = useCallback((): ResultItem[] =>
    NAV_ITEMS.map((item) => ({
      ...item,
      action: () => {
        const routes: Record<string, string> = {
          'nav-agents': '/dashboard/agents',
          'nav-workflows': '/dashboard/workflows',
          'nav-knowledge': '/dashboard/knowledge',
          'nav-analytics': '/dashboard/analytics',
          'nav-integrations': '/dashboard/integrations',
          'nav-docs': '/dashboard/docs',
          'nav-settings': '/dashboard/settings',
        };
        router.push(routes[item.id] ?? '/dashboard');
        setOpen(false);
      },
    })),
  [router]);

  const buildActionItems = useCallback((): ResultItem[] =>
    ACTION_ITEMS.map((item) => ({
      ...item,
      action: () => {
        const routes: Record<string, string> = {
          'action-new-agent': '/dashboard/agents?action=new',
          'action-new-workflow': '/dashboard/workflows?action=new',
          'action-upload': '/dashboard/knowledge?tab=upload',
        };
        router.push(routes[item.id] ?? '/dashboard');
        setOpen(false);
      },
    })),
  [router]);

  const agentItems: ResultItem[] = (agentsData?.agents ?? []).map((a: any) => ({
    id: `agent-${a.id}`,
    label: a.name,
    sublabel: `${a.type} agent · ${a.status ?? 'idle'}`,
    icon: Bot,
    category: 'Agents',
    action: () => { router.push(`/dashboard/agents`); setOpen(false); },
  }));

  const workflowItems: ResultItem[] = (workflowsData?.workflows ?? workflowsData ?? []).map((w: any) => ({
    id: `workflow-${w.id}`,
    label: w.name,
    sublabel: `Workflow · ${w.status ?? 'draft'}`,
    icon: Workflow,
    category: 'Workflows',
    action: () => { router.push(`/dashboard/workflows`); setOpen(false); },
  }));

  const allItems: ResultItem[] = [
    ...buildActionItems(),
    ...buildNavItems(),
    ...agentItems,
    ...workflowItems,
  ];

  const filtered = query
    ? allItems.filter((item) =>
        fuzzyMatch(item.label, query) || fuzzyMatch(item.sublabel ?? '', query) || fuzzyMatch(item.category, query)
      )
    : allItems;

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ResultItem[]>);

  const flatFiltered = Object.values(grouped).flat();

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery('');
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, flatFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flatFiltered[highlighted]?.action();
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelectorAll('[data-result]')[highlighted] as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  if (!open) return null;

  let globalIndex = 0;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-start justify-center pt-[12vh] px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-800">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents, workflows, actions..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden md:flex items-center gap-1 px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-500">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {flatFiltered.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">No results for &ldquo;{query}&rdquo;</div>
          )}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {category}
              </div>
              {items.map((item) => {
                const idx = globalIndex++;
                const isHighlighted = idx === highlighted;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    data-result
                    onClick={item.action}
                    onMouseEnter={() => setHighlighted(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                      isHighlighted ? 'bg-purple-600/30 text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className={`flex-shrink-0 p-1.5 rounded-lg ${
                      item.gradient
                        ? `bg-gradient-to-br ${item.gradient}`
                        : isHighlighted ? 'bg-purple-500/30' : 'bg-gray-800'
                    }`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.label}</div>
                      {item.sublabel && (
                        <div className="text-xs text-gray-500 truncate">{item.sublabel}</div>
                      )}
                    </div>
                    {isHighlighted && <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 px-4 py-2 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1 rounded">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1 rounded">↵</kbd> open</span>
            <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1 rounded">esc</kbd> close</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
