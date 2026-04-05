'use client';

import { useState } from 'react';
import { Link2, CheckCircle, ExternalLink, Search, Zap, Mail, MessageSquare, Database, Globe, Code2, BarChart3, Bell, Calendar, FileText, Lock, CreditCard } from 'lucide-react';

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  category: string;
  status: 'available' | 'coming_soon' | 'connected';
  docsUrl?: string;
};

const INTEGRATIONS: Integration[] = [
  // Communication
  { id: 'slack', name: 'Slack', description: 'Send messages, post to channels, and trigger agents from Slack commands', icon: MessageSquare, iconColor: 'from-purple-500 to-pink-500', category: 'Communication', status: 'available' },
  { id: 'gmail', name: 'Gmail', description: 'Read, send, and draft emails automatically with your agents', icon: Mail, iconColor: 'from-red-500 to-orange-500', category: 'Communication', status: 'available' },
  { id: 'outlook', name: 'Outlook', description: 'Integrate with Microsoft Outlook for email and calendar access', icon: Mail, iconColor: 'from-blue-500 to-cyan-500', category: 'Communication', status: 'coming_soon' },

  // Productivity
  { id: 'google-calendar', name: 'Google Calendar', description: 'Schedule events and check availability with AI agents', icon: Calendar, iconColor: 'from-blue-400 to-blue-600', category: 'Productivity', status: 'available' },
  { id: 'notion', name: 'Notion', description: 'Read and write Notion pages, databases, and blocks', icon: FileText, iconColor: 'from-gray-400 to-gray-600', category: 'Productivity', status: 'coming_soon' },
  { id: 'google-docs', name: 'Google Docs', description: 'Create and edit Google Docs directly from your agents', icon: FileText, iconColor: 'from-green-400 to-teal-500', category: 'Productivity', status: 'coming_soon' },

  // Data & Analytics
  { id: 'postgres', name: 'PostgreSQL', description: 'Query and write to your PostgreSQL databases', icon: Database, iconColor: 'from-blue-600 to-indigo-600', category: 'Data', status: 'available' },
  { id: 'airtable', name: 'Airtable', description: 'Read, write, and automate Airtable bases with your agents', icon: Database, iconColor: 'from-yellow-500 to-orange-500', category: 'Data', status: 'available' },
  { id: 'bigquery', name: 'BigQuery', description: 'Run analytics queries on Google BigQuery at scale', icon: BarChart3, iconColor: 'from-blue-500 to-blue-700', category: 'Data', status: 'coming_soon' },

  // Developer & APIs
  { id: 'github', name: 'GitHub', description: 'Create issues, PRs, and review code with your Code Agent', icon: Code2, iconColor: 'from-gray-500 to-gray-700', category: 'Developer', status: 'available' },
  { id: 'webhook', name: 'Webhooks', description: 'Trigger agents from any webhook event or HTTP endpoint', icon: Zap, iconColor: 'from-yellow-400 to-orange-500', category: 'Developer', status: 'available' },
  { id: 'rest-api', name: 'REST API', description: 'Connect to any REST API with built-in authentication support', icon: Globe, iconColor: 'from-green-500 to-teal-500', category: 'Developer', status: 'available' },

  // CRM & Sales
  { id: 'hubspot', name: 'HubSpot', description: 'Sync contacts, deals, and automate CRM updates with agents', icon: BarChart3, iconColor: 'from-orange-400 to-red-500', category: 'CRM & Sales', status: 'coming_soon' },
  { id: 'salesforce', name: 'Salesforce', description: 'Read and update Salesforce records, leads, and opportunities', icon: BarChart3, iconColor: 'from-blue-400 to-blue-600', category: 'CRM & Sales', status: 'coming_soon' },

  // Notifications
  { id: 'twilio', name: 'Twilio (SMS)', description: 'Send SMS and WhatsApp messages from your agents', icon: Bell, iconColor: 'from-red-500 to-pink-500', category: 'Notifications', status: 'available' },
  { id: 'sendgrid', name: 'SendGrid', description: 'Send transactional emails via SendGrid at scale', icon: Mail, iconColor: 'from-blue-400 to-cyan-500', category: 'Notifications', status: 'available' },

  // Security & Auth
  { id: 'auth0', name: 'Auth0', description: 'Identity and access management for your agent workflows', icon: Lock, iconColor: 'from-orange-500 to-red-500', category: 'Security', status: 'coming_soon' },
  { id: 'stripe', name: 'Stripe', description: 'Process payments and manage subscriptions with AI automation', icon: CreditCard, iconColor: 'from-purple-500 to-indigo-500', category: 'Payments', status: 'coming_soon' },
];

const CATEGORIES = ['All', ...Array.from(new Set(INTEGRATIONS.map((i) => i.category)))];

const statusConfig = {
  connected: { label: 'Connected', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  available: { label: 'Connect', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20 hover:bg-purple-400/20 cursor-pointer' },
  coming_soon: { label: 'Coming Soon', color: 'text-gray-500 bg-gray-700/50 border-gray-600' },
};

export default function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [connected, setConnected] = useState<Set<string>>(new Set());

  const filtered = INTEGRATIONS.filter((i) => {
    const matchSearch =
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || i.category === category;
    return matchSearch && matchCat;
  });

  const grouped = filtered.reduce((acc, i) => {
    if (!acc[i.category]) acc[i.category] = [];
    acc[i.category].push(i);
    return acc;
  }, {} as Record<string, Integration[]>);

  const handleConnect = (id: string, status: string) => {
    if (status !== 'available') return;
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const connectedCount = connected.size;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 p-8 rounded-xl bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-gray-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Integrations</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Connect your agents to the tools your team already uses
              </p>
            </div>
          </div>
          {connectedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">{connectedCount} connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                category === cat
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600 hover:text-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Integration cards */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((integration) => {
                const Icon = integration.icon;
                const isConnected = connected.has(integration.id) || integration.status === 'connected';
                const effectiveStatus = isConnected ? 'connected' : integration.status;
                const cfg = statusConfig[effectiveStatus];

                return (
                  <div
                    key={integration.id}
                    className={`bg-gray-800 border rounded-xl p-5 transition-all ${
                      integration.status === 'available'
                        ? 'border-gray-700 hover:border-purple-500/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10'
                        : 'border-gray-700 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${integration.iconColor}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {isConnected && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{integration.name}</h3>
                    <p className="text-gray-400 text-xs mb-4 leading-relaxed">{integration.description}</p>
                    <button
                      onClick={() => handleConnect(integration.id, integration.status)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${cfg.color}`}
                      disabled={integration.status === 'coming_soon'}
                    >
                      {isConnected ? 'Connected ✓' : cfg.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Link2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No integrations match &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-10 p-6 bg-gray-800/50 border border-dashed border-gray-600 rounded-xl text-center">
        <p className="text-gray-400 text-sm mb-2">Don&apos;t see the integration you need?</p>
        <p className="text-gray-500 text-xs">
          Use the <span className="text-purple-400 font-medium">REST API</span> or <span className="text-purple-400 font-medium">Webhooks</span> integration to connect to any service.
        </p>
      </div>
    </div>
  );
}
