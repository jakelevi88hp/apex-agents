'use client';
import { FileText, Bot, Workflow, BookOpen, Zap, Settings, Search } from 'lucide-react';
import { useState } from 'react';

const sections = [
  {
    id: 'getting-started',
    icon: Zap,
    title: 'Getting Started',
    color: 'purple',
    articles: [
      {
        title: 'What is Apex Agents?',
        content: `Apex Agents is an AI-powered automation platform that lets you create, deploy, and manage intelligent agents and workflows.

**Key concepts:**
- **Agents** — Autonomous AI workers you configure to handle specific tasks
- **Workflows** — Multi-step automation pipelines connecting agents and actions
- **Knowledge Base** — Documents and data your agents can reference
- **Executions** — Individual runs of an agent or workflow`,
      },
      {
        title: 'Quick Start Guide',
        content: `Get up and running in minutes:

1. **Create your first agent** — Go to Agents → New Agent. Give it a name, select a model, and write a system prompt describing what it should do.
2. **Build a workflow** — Go to Workflows → New Workflow. Add steps, connect agents, and set triggers.
3. **Upload knowledge** — Go to Knowledge → Upload to give your agents context they can reference.
4. **Run it** — Click Execute on any agent or workflow to see it in action.`,
      },
    ],
  },
  {
    id: 'agents',
    icon: Bot,
    title: 'Agents',
    color: 'blue',
    articles: [
      {
        title: 'Creating an Agent',
        content: `To create a new agent:

1. Click **New Agent** in the sidebar or Agents page
2. Enter a name and optional description
3. Choose an AI model (GPT-4, Claude, etc.)
4. Write a **system prompt** — this defines the agent's behavior and persona
5. Configure tools the agent can use (web search, code execution, etc.)
6. Save and test

**Tips for good system prompts:**
- Be specific about the agent's role and goals
- Include constraints and output format expectations
- Provide examples of ideal responses`,
      },
      {
        title: 'Running & Monitoring Agents',
        content: `Once created, agents can be:
- **Executed manually** from the Agents page
- **Triggered by workflows** as part of a pipeline
- **Scheduled** to run on a recurring basis

Monitor performance on the **Analytics** page — track execution count, success rate, average duration, and errors.`,
      },
    ],
  },
  {
    id: 'workflows',
    icon: Workflow,
    title: 'Workflows',
    color: 'cyan',
    articles: [
      {
        title: 'Building a Workflow',
        content: `Workflows chain multiple steps into a single automated pipeline.

**Step types:**
- **Agent step** — Run an agent with a given input
- **Transform step** — Modify or filter data between steps
- **Condition step** — Branch logic based on output
- **Webhook step** — Send data to an external service

**To build one:**
1. Go to Workflows → New Workflow
2. Drag in steps from the panel
3. Connect them in order
4. Set the trigger (manual, scheduled, or webhook)
5. Test with a sample input`,
      },
    ],
  },
  {
    id: 'knowledge',
    icon: BookOpen,
    title: 'Knowledge Base',
    color: 'green',
    articles: [
      {
        title: 'Uploading Documents',
        content: `The Knowledge Base lets you upload documents that agents can search and reference.

**Supported formats:** PDF, DOCX, TXT, MD, CSV

**How it works:**
1. Go to Knowledge → Upload
2. Select your file(s)
3. Apex Agents automatically chunks and indexes the content
4. When an agent runs, it can retrieve relevant passages using semantic search

**Best practices:**
- Keep documents focused on a single topic
- Use clear headings and structure
- Remove sensitive or irrelevant content before uploading`,
      },
    ],
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Settings & Account',
    color: 'gray',
    articles: [
      {
        title: 'API Keys & Integrations',
        content: `Go to **Settings → Integrations** to connect external services:
- OpenAI / Anthropic API keys for AI models
- Webhook endpoints for workflow triggers
- Notification channels (email, Slack)

Your API keys are encrypted at rest and never exposed in the UI after saving.`,
      },
      {
        title: 'Subscription & Usage',
        content: `View your current plan, usage limits, and billing under **Settings → Subscription**.

- **Free plan** — Limited executions per month, 1 active agent
- **Pro plan** — Unlimited agents, priority model access, advanced analytics
- **Enterprise** — Custom limits, dedicated support, SSO

Upgrade or manage your subscription from the Settings page.`,
      },
    ],
  },
];

const colorMap: Record<string, string> = {
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function DocsPage() {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<{ sectionId: string; index: number } | null>(null);

  const filtered = sections.map((s) => ({
    ...s,
    articles: s.articles.filter(
      (a) =>
        search === '' ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((s) => s.articles.length > 0);

  const currentArticle =
    activeArticle
      ? sections.find((s) => s.id === activeArticle.sectionId)?.articles[activeArticle.index]
      : null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 p-8 rounded-lg bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse" />
        <div className="relative z-10 flex items-center gap-3">
          <FileText className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Documentation</h1>
            <p className="text-gray-300 mt-1">Reference guides and how-tos for Apex Agents</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search docs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      <div className="flex gap-6">
        {/* Left nav */}
        <div className="w-56 flex-shrink-0 space-y-1">
          {filtered.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id}>
                <button
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeSection === section.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {section.title}
                </button>
                {(activeSection === section.id || search !== '') && section.articles.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveArticle({ sectionId: section.id, index: i })}
                    className={`w-full text-left pl-9 pr-3 py-1.5 text-xs rounded-lg transition-all
                      ${activeArticle?.sectionId === section.id && activeArticle?.index === i
                        ? 'text-purple-400 font-semibold'
                        : 'text-gray-400 hover:text-gray-200'
                      }`}
                  >
                    {a.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {currentArticle ? (
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-8">
              <button
                onClick={() => setActiveArticle(null)}
                className="text-sm text-gray-400 hover:text-gray-200 mb-4 transition-colors"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">{currentArticle.title}</h2>
              <div className="prose prose-invert prose-sm max-w-none">
                {currentArticle.content.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-bold text-white mt-4 mb-1">{line.slice(2, -2)}</p>;
                  }
                  if (line.match(/^\d+\./)) {
                    return <p key={i} className="text-gray-300 ml-4 my-1">{line}</p>;
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <p key={i} className="text-gray-300 ml-4 my-1">
                        • {line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}
                      </p>
                    );
                  }
                  if (line === '') return <br key={i} />;
                  return <p key={i} className="text-gray-300 my-1">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                })}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((section) => {
                const Icon = section.icon;
                const colorCls = colorMap[section.color];
                return (
                  <div
                    key={section.id}
                    className="rounded-lg border border-gray-700 bg-gray-800 p-6 hover:border-purple-500/50 transition-all cursor-pointer"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border mb-3 ${colorCls}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{section.title}</h3>
                    <ul className="space-y-1">
                      {section.articles.map((a, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-400 hover:text-purple-400 transition-colors cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); setActiveArticle({ sectionId: section.id, index: i }); }}
                        >
                          → {a.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
