'use client';

import { useState, useEffect } from 'react';
import {
  Link2, CheckCircle, ExternalLink, Search, Zap, Mail, MessageSquare,
  Database, Globe, Code2, BarChart3, Bell, Calendar, FileText, Lock,
  CreditCard, X, Eye, EyeOff, AlertCircle, Trash2, ChevronRight,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type FieldType = 'text' | 'password' | 'url' | 'select' | 'oauth' | 'generated';

interface ConfigField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  category: string;
  status: 'available' | 'coming_soon';
  docsUrl?: string;
  configFields: ConfigField[];
  connectedSummary?: (config: Record<string, string>) => string;
}

// ─── Integration Definitions ─────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  // Communication
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages, post to channels, and trigger agents from Slack commands',
    icon: MessageSquare,
    iconColor: 'from-purple-500 to-pink-500',
    category: 'Communication',
    status: 'available',
    docsUrl: 'https://api.slack.com/apps',
    configFields: [
      { key: 'webhook_url', label: 'Incoming Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...', hint: 'Create at api.slack.com → Your App → Incoming Webhooks', required: true },
      { key: 'bot_token', label: 'Bot OAuth Token (optional)', type: 'password', placeholder: 'xoxb-...', hint: 'Required for reading messages and DMs' },
      { key: 'default_channel', label: 'Default Channel', type: 'text', placeholder: '#general', hint: 'Channel your agent will post to by default' },
    ],
    connectedSummary: (c) => c.default_channel || c.webhook_url.split('/').pop() || 'Slack',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Read, send, and draft emails automatically with your agents',
    icon: Mail,
    iconColor: 'from-red-500 to-orange-500',
    category: 'Communication',
    status: 'available',
    docsUrl: 'https://developers.google.com/gmail/api/quickstart/nodejs',
    configFields: [
      { key: 'oauth_note', label: '', type: 'oauth', hint: 'Gmail uses Google OAuth 2.0. Paste your credentials from the Google Cloud Console.' },
      { key: 'client_id', label: 'OAuth Client ID', type: 'text', placeholder: 'xxxx.apps.googleusercontent.com', required: true },
      { key: 'client_secret', label: 'OAuth Client Secret', type: 'password', placeholder: 'GOCSPX-...', required: true },
      { key: 'refresh_token', label: 'Refresh Token', type: 'password', placeholder: 'Paste refresh token here', hint: 'Run the OAuth flow once in the Google OAuth Playground to get this', required: true },
    ],
    connectedSummary: (c) => c.client_id ? c.client_id.split('@')[0] : 'Gmail',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Integrate with Microsoft Outlook for email and calendar access',
    icon: Mail,
    iconColor: 'from-blue-500 to-cyan-500',
    category: 'Communication',
    status: 'coming_soon',
    configFields: [],
  },

  // Productivity
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Schedule events and check availability with AI agents',
    icon: Calendar,
    iconColor: 'from-blue-400 to-blue-600',
    category: 'Productivity',
    status: 'available',
    docsUrl: 'https://developers.google.com/calendar/api/quickstart/nodejs',
    configFields: [
      { key: 'oauth_note', label: '', type: 'oauth', hint: 'Google Calendar uses OAuth 2.0. Use the same credentials as Gmail if you have them.' },
      { key: 'client_id', label: 'OAuth Client ID', type: 'text', placeholder: 'xxxx.apps.googleusercontent.com', required: true },
      { key: 'client_secret', label: 'OAuth Client Secret', type: 'password', placeholder: 'GOCSPX-...', required: true },
      { key: 'refresh_token', label: 'Refresh Token', type: 'password', placeholder: 'Paste refresh token here', required: true },
      { key: 'calendar_id', label: 'Calendar ID', type: 'text', placeholder: 'primary or yourname@gmail.com', hint: 'Use "primary" for your main calendar' },
    ],
    connectedSummary: (c) => c.calendar_id || 'Google Calendar',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Read and write Notion pages, databases, and blocks',
    icon: FileText,
    iconColor: 'from-gray-400 to-gray-600',
    category: 'Productivity',
    status: 'coming_soon',
    configFields: [],
  },
  {
    id: 'google-docs',
    name: 'Google Docs',
    description: 'Create and edit Google Docs directly from your agents',
    icon: FileText,
    iconColor: 'from-green-400 to-teal-500',
    category: 'Productivity',
    status: 'coming_soon',
    configFields: [],
  },

  // Data
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Query and write to your PostgreSQL databases',
    icon: Database,
    iconColor: 'from-blue-600 to-indigo-600',
    category: 'Data',
    status: 'available',
    configFields: [
      { key: 'host', label: 'Host', type: 'text', placeholder: 'db.example.com or 127.0.0.1', required: true },
      { key: 'port', label: 'Port', type: 'text', placeholder: '5432', hint: 'Default PostgreSQL port is 5432' },
      { key: 'database', label: 'Database Name', type: 'text', placeholder: 'myapp_production', required: true },
      { key: 'username', label: 'Username', type: 'text', placeholder: 'postgres', required: true },
      { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
      { key: 'ssl', label: 'SSL Mode', type: 'select', options: [{ value: 'require', label: 'Require (recommended)' }, { value: 'disable', label: 'Disable' }], hint: 'Use Require for production databases' },
    ],
    connectedSummary: (c) => c.host && c.database ? `${c.username}@${c.host}/${c.database}` : 'PostgreSQL',
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Read, write, and automate Airtable bases with your agents',
    icon: Database,
    iconColor: 'from-yellow-500 to-orange-500',
    category: 'Data',
    status: 'available',
    docsUrl: 'https://airtable.com/create/tokens',
    configFields: [
      { key: 'api_key', label: 'Personal Access Token', type: 'password', placeholder: 'pat...', hint: 'Create at airtable.com/create/tokens — needs data.records scope', required: true },
      { key: 'base_id', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', hint: 'Found in the Airtable API docs for your base', required: true },
    ],
    connectedSummary: (c) => c.base_id || 'Airtable',
  },
  {
    id: 'bigquery',
    name: 'BigQuery',
    description: 'Run analytics queries on Google BigQuery at scale',
    icon: BarChart3,
    iconColor: 'from-blue-500 to-blue-700',
    category: 'Data',
    status: 'coming_soon',
    configFields: [],
  },

  // Developer
  {
    id: 'github',
    name: 'GitHub',
    description: 'Create issues, PRs, and review code with your Code Agent',
    icon: Code2,
    iconColor: 'from-gray-500 to-gray-700',
    category: 'Developer',
    status: 'available',
    docsUrl: 'https://github.com/settings/tokens',
    configFields: [
      { key: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_...', hint: 'Create at github.com/settings/tokens — needs repo scope', required: true },
      { key: 'default_repo', label: 'Default Repository (optional)', type: 'text', placeholder: 'owner/repo-name', hint: 'e.g. myorg/myapp — agents will target this repo by default' },
    ],
    connectedSummary: (c) => c.default_repo || 'GitHub',
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    description: 'Trigger agents from any external service via HTTP webhook',
    icon: Zap,
    iconColor: 'from-yellow-400 to-orange-500',
    category: 'Developer',
    status: 'available',
    configFields: [
      {
        key: 'endpoint',
        label: 'Your Webhook Endpoint',
        type: 'generated',
        hint: 'Point external services at this URL to trigger your agents',
      },
      { key: 'secret', label: 'Webhook Secret', type: 'password', placeholder: 'Optional signing secret for verification', hint: 'If set, we validate the X-Webhook-Secret header on incoming requests' },
      { key: 'target_agent', label: 'Target Agent ID (optional)', type: 'text', placeholder: 'Leave blank to route manually', hint: 'When set, incoming webhooks automatically run this agent' },
    ],
    connectedSummary: () => 'Webhook active',
  },
  {
    id: 'rest-api',
    name: 'REST API',
    description: 'Connect to any REST API with built-in authentication support',
    icon: Globe,
    iconColor: 'from-green-500 to-teal-500',
    category: 'Developer',
    status: 'available',
    configFields: [
      { key: 'base_url', label: 'Base URL', type: 'url', placeholder: 'https://api.yourservice.com/v1', required: true },
      { key: 'auth_type', label: 'Authentication', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'api_key', label: 'API Key Header' }, { value: 'bearer', label: 'Bearer Token' }, { value: 'basic', label: 'Basic Auth' }] },
      { key: 'auth_value', label: 'API Key / Token', type: 'password', placeholder: 'Your credential value', hint: 'Leave blank if authentication is None' },
      { key: 'auth_header', label: 'Custom Header Name (optional)', type: 'text', placeholder: 'X-Api-Key', hint: 'For API Key auth — defaults to Authorization' },
    ],
    connectedSummary: (c) => c.base_url ? new URL(c.base_url).hostname : 'REST API',
  },

  // CRM & Sales
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync contacts, deals, and automate CRM updates with agents',
    icon: BarChart3,
    iconColor: 'from-orange-400 to-red-500',
    category: 'CRM & Sales',
    status: 'coming_soon',
    configFields: [],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Read and update Salesforce records, leads, and opportunities',
    icon: BarChart3,
    iconColor: 'from-blue-400 to-blue-600',
    category: 'CRM & Sales',
    status: 'coming_soon',
    configFields: [],
  },

  // Notifications
  {
    id: 'twilio',
    name: 'Twilio (SMS)',
    description: 'Send SMS and WhatsApp messages from your agents',
    icon: Bell,
    iconColor: 'from-red-500 to-pink-500',
    category: 'Notifications',
    status: 'available',
    docsUrl: 'https://console.twilio.com/',
    configFields: [
      { key: 'account_sid', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', hint: 'Found at console.twilio.com — top of your dashboard', required: true },
      { key: 'auth_token', label: 'Auth Token', type: 'password', placeholder: '••••••••••••••••••••••••••••••••', required: true },
      { key: 'from_number', label: 'From Phone Number', type: 'text', placeholder: '+15551234567', hint: 'Your Twilio number in E.164 format', required: true },
    ],
    connectedSummary: (c) => c.from_number || 'Twilio',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Send transactional emails via SendGrid at scale',
    icon: Mail,
    iconColor: 'from-blue-400 to-cyan-500',
    category: 'Notifications',
    status: 'available',
    docsUrl: 'https://app.sendgrid.com/settings/api_keys',
    configFields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'SG.xxxxxxxxxxxxxxxxxxxxxxxx', hint: 'Create at app.sendgrid.com → Settings → API Keys — needs Mail Send access', required: true },
      { key: 'from_email', label: 'From Email Address', type: 'text', placeholder: 'noreply@yourcompany.com', hint: 'Must be a verified sender in your SendGrid account', required: true },
      { key: 'from_name', label: 'From Name (optional)', type: 'text', placeholder: 'Apex Agents', hint: 'Display name shown to email recipients' },
    ],
    connectedSummary: (c) => c.from_email || 'SendGrid',
  },

  // Security
  {
    id: 'auth0',
    name: 'Auth0',
    description: 'Identity and access management for your agent workflows',
    icon: Lock,
    iconColor: 'from-orange-500 to-red-500',
    category: 'Security',
    status: 'coming_soon',
    configFields: [],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage subscriptions with AI automation',
    icon: CreditCard,
    iconColor: 'from-purple-500 to-indigo-500',
    category: 'Payments',
    status: 'coming_soon',
    configFields: [],
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(INTEGRATIONS.map((i) => i.category)))];
const STORAGE_KEY = 'apex_integrations_config';

// ─── Config Modal ─────────────────────────────────────────────────────────────

function ConfigModal({
  integration,
  existing,
  onSave,
  onDisconnect,
  onClose,
}: {
  integration: Integration;
  existing: Record<string, string> | null;
  onSave: (id: string, config: Record<string, string>) => void;
  onDisconnect: (id: string) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(existing ?? {});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isConnected = existing !== null;

  const generatedEndpoint = `https://apex-agents.vercel.app/api/webhooks/${integration.id}`;

  const validate = () => {
    const errs: Record<string, string> = {};
    integration.configFields.forEach((f) => {
      if (f.required && f.type !== 'oauth' && f.type !== 'generated' && !values[f.key]?.trim()) {
        errs[f.key] = `${f.label} is required`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(integration.id, values);
    onClose();
  };

  const Icon = integration.icon;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${integration.iconColor}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">{integration.name}</h2>
              <p className="text-xs text-gray-400">{isConnected ? 'Update connection settings' : 'Configure to connect'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 p-1 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 space-y-4">
          {integration.configFields.map((field) => {
            if (field.type === 'oauth') {
              return (
                <div key={field.key} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300 leading-relaxed">{field.hint}</p>
                </div>
              );
            }

            if (field.type === 'generated') {
              return (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">{field.label || 'Webhook URL'}</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg">
                    <span className="text-xs text-purple-300 font-mono flex-1 break-all">{generatedEndpoint}</span>
                    <button
                      onClick={() => navigator.clipboard?.writeText(generatedEndpoint)}
                      className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1 bg-gray-700 rounded flex-shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                  {field.hint && <p className="text-xs text-gray-500 mt-1">{field.hint}</p>}
                </div>
              );
            }

            if (field.type === 'select') {
              return (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">{field.label}</label>
                  <select
                    value={values[field.key] ?? (field.options?.[0]?.value ?? '')}
                    onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    {field.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {field.hint && <p className="text-xs text-gray-500 mt-1">{field.hint}</p>}
                </div>
              );
            }

            const isSecret = field.type === 'password';
            const visible = showSecrets[field.key];

            return (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={isSecret && !visible ? 'password' : 'text'}
                    value={values[field.key] ?? ''}
                    onChange={(e) => {
                      setValues({ ...values, [field.key]: e.target.value });
                      if (errors[field.key]) setErrors({ ...errors, [field.key]: '' });
                    }}
                    placeholder={field.placeholder}
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white text-sm focus:outline-none transition-colors placeholder-gray-600 ${
                      errors[field.key] ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-purple-500'
                    } ${isSecret ? 'pr-9' : ''}`}
                  />
                  {isSecret && (
                    <button
                      type="button"
                      onClick={() => setShowSecrets({ ...showSecrets, [field.key]: !visible })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {errors[field.key] && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors[field.key]}
                  </p>
                )}
                {field.hint && !errors[field.key] && (
                  <p className="text-xs text-gray-500 mt-1">{field.hint}</p>
                )}
              </div>
            );
          })}

          {integration.docsUrl && (
            <a
              href={integration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View {integration.name} docs
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between gap-3 border-t border-gray-800 pt-4">
          {isConnected ? (
            <button
              onClick={() => { onDisconnect(integration.id); onClose(); }}
              className="flex items-center gap-1.5 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-lg text-sm transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Disconnect
            </button>
          ) : (
            <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm transition-colors">
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all hover:scale-105"
          >
            <CheckCircle className="w-4 h-4" />
            {isConnected ? 'Save Changes' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});
  const [activeModal, setActiveModal] = useState<Integration | null>(null);

  // Load configs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setConfigs(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveConfig = (id: string, config: Record<string, string>) => {
    const next = { ...configs, [id]: config };
    setConfigs(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const disconnectIntegration = (id: string) => {
    const next = { ...configs };
    delete next[id];
    setConfigs(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

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

  const connectedCount = Object.keys(configs).length;

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
                const isConnected = !!configs[integration.id];
                const config = configs[integration.id];
                const summary = isConnected && integration.connectedSummary
                  ? integration.connectedSummary(config)
                  : null;

                return (
                  <div
                    key={integration.id}
                    className={`bg-gray-800 border rounded-xl p-5 transition-all ${
                      integration.status === 'available'
                        ? 'border-gray-700 hover:border-purple-500/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10'
                        : 'border-gray-700 opacity-60'
                    } ${isConnected ? 'border-green-500/30 bg-gray-800/80' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${integration.iconColor}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {isConnected && (
                        <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Connected
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-white text-sm mb-1">{integration.name}</h3>
                    <p className="text-gray-400 text-xs mb-3 leading-relaxed">{integration.description}</p>

                    {/* Connected summary */}
                    {isConnected && summary && (
                      <p className="text-xs text-gray-500 mb-3 font-mono truncate">{summary}</p>
                    )}

                    {integration.status === 'coming_soon' ? (
                      <span className="text-xs font-medium px-3 py-1.5 rounded-lg border text-gray-500 bg-gray-700/50 border-gray-600">
                        Coming Soon
                      </span>
                    ) : isConnected ? (
                      <button
                        onClick={() => setActiveModal(integration)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border text-purple-400 bg-purple-400/10 border-purple-400/20 hover:bg-purple-400/20 transition-all flex items-center gap-1.5"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                        Manage
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveModal(integration)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border text-purple-400 bg-purple-400/10 border-purple-400/20 hover:bg-purple-400/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Connect
                      </button>
                    )}
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
        <p className="text-gray-400 text-sm mb-2">Don&apos;t see what you need?</p>
        <p className="text-gray-500 text-xs">
          Use the <button onClick={() => setActiveModal(INTEGRATIONS.find(i => i.id === 'rest-api')!)} className="text-purple-400 font-medium hover:underline">REST API</button> or <button onClick={() => setActiveModal(INTEGRATIONS.find(i => i.id === 'webhook')!)} className="text-purple-400 font-medium hover:underline">Webhooks</button> integration to connect any service.
        </p>
      </div>

      {/* Config Modal */}
      {activeModal && (
        <ConfigModal
          integration={activeModal}
          existing={configs[activeModal.id] ?? null}
          onSave={saveConfig}
          onDisconnect={disconnectIntegration}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
