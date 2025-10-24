'use client';

import { useState } from 'react';

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<'sources' | 'documents' | 'embeddings'>('sources');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Knowledge Base</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'sources'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-500'
          }`}
        >
          Data Sources
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'documents'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-500'
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveTab('embeddings')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'embeddings'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-500'
          }`}
        >
          Embeddings
        </button>
      </div>

      {/* Data Sources Tab */}
      {activeTab === 'sources' && (
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Google Drive', icon: '📁', status: 'connected', docs: 1247 },
            { name: 'Notion', icon: '📝', status: 'connected', docs: 342 },
            { name: 'GitHub', icon: '💻', status: 'connected', docs: 89 },
            { name: 'Salesforce', icon: '☁️', status: 'disconnected', docs: 0 },
            { name: 'Slack', icon: '💬', status: 'connected', docs: 5621 },
            { name: 'Confluence', icon: '📚', status: 'disconnected', docs: 0 },
          ].map((source) => (
            <div key={source.name} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{source.icon}</div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    source.status === 'connected'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {source.status}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2">{source.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {source.docs > 0 ? `${source.docs.toLocaleString()} documents` : 'Not connected'}
              </p>
              <button
                className={`w-full px-4 py-2 rounded ${
                  source.status === 'connected'
                    ? 'bg-gray-100 hover:bg-gray-200'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {source.status === 'connected' ? 'Manage' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search documents..."
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Upload
              </button>
            </div>
          </div>

          <div className="divide-y">
            {[
              { name: 'Q4 Financial Report.pdf', source: 'Google Drive', size: '2.4 MB', date: '2 hours ago' },
              { name: 'Product Roadmap 2025', source: 'Notion', size: '156 KB', date: '1 day ago' },
              { name: 'Customer Feedback Analysis', source: 'Salesforce', size: '892 KB', date: '3 days ago' },
              { name: 'Engineering Documentation', source: 'GitHub', size: '5.1 MB', date: '1 week ago' },
            ].map((doc, i) => (
              <div key={i} className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-semibold">{doc.name}</div>
                    <div className="text-sm text-gray-500">
                      {doc.source} • {doc.size} • {doc.date}
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embeddings Tab */}
      {activeTab === 'embeddings' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Embedding Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Total Vectors</span>
                  <span className="font-semibold">7,299</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '73%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Storage Used</span>
                  <span className="font-semibold">8.7 GB / 10 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Avg. Query Time</span>
                  <span className="font-semibold">42ms</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Recent Queries</h3>
            <div className="space-y-3">
              {[
                'Product pricing strategies',
                'Customer retention best practices',
                'Q4 revenue projections',
                'Competitor analysis framework',
              ].map((query, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded">
                  <div className="text-sm">{query}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.floor(Math.random() * 20 + 10)} results • {Math.floor(Math.random() * 50 + 20)}ms
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

