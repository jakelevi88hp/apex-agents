'use client';

import { useState } from 'react';

interface DataSource {
  name: string;
  icon: string;
  status: 'connected' | 'disconnected';
  docs: number;
}

interface Document {
  name: string;
  source: string;
  size: string;
  date: string;
}

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<'sources' | 'documents' | 'embeddings'>('sources');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const dataSources: DataSource[] = [
    { name: 'Google Drive', icon: '📁', status: 'connected', docs: 1247 },
    { name: 'Notion', icon: '📝', status: 'connected', docs: 342 },
    { name: 'GitHub', icon: '💻', status: 'connected', docs: 89 },
    { name: 'Salesforce', icon: '☁️', status: 'disconnected', docs: 0 },
    { name: 'Slack', icon: '💬', status: 'connected', docs: 5621 },
    { name: 'Confluence', icon: '📚', status: 'disconnected', docs: 0 },
  ];

  const documents: Document[] = [
    { name: 'Q4 Financial Report.pdf', source: 'Google Drive', size: '2.4 MB', date: '2 hours ago' },
    { name: 'Product Roadmap 2025', source: 'Notion', size: '156 KB', date: '1 day ago' },
    { name: 'Customer Feedback Analysis', source: 'Salesforce', size: '892 KB', date: '3 days ago' },
    { name: 'Engineering Documentation', source: 'GitHub', size: '5.1 MB', date: '1 week ago' },
  ];

  const handleManageSource = (sourceName: string) => {
    alert(`Opening management settings for ${sourceName}...\n\nThis would allow you to:\n- Configure sync settings\n- Select folders/channels\n- Set update frequency\n- Manage permissions`);
  };

  const handleConnectSource = (sourceName: string) => {
    alert(`Initiating connection to ${sourceName}...\n\nThis would:\n- Open OAuth authentication\n- Request necessary permissions\n- Begin initial sync`);
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const handleUploadDocument = () => {
    alert('Opening file upload dialog...\n\nSupported formats:\n- PDF, DOCX, TXT\n- MD, CSV, JSON\n- Max size: 50 MB');
  };

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
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Data Sources
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'documents'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveTab('embeddings')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'embeddings'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Embeddings
        </button>
      </div>

      {/* Data Sources Tab */}
      {activeTab === 'sources' && (
        <div className="grid md:grid-cols-3 gap-6">
          {dataSources.map((source) => (
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
              <p className="text-sm text-gray-700 mb-4">
                {source.docs > 0 ? `${source.docs.toLocaleString()} documents` : 'Not connected'}
              </p>
              <button
                onClick={() =>
                  source.status === 'connected'
                    ? handleManageSource(source.name)
                    : handleConnectSource(source.name)
                }
                className={`w-full px-4 py-2 rounded transition ${
                  source.status === 'connected'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
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
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleUploadDocument}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Upload
              </button>
            </div>
          </div>

          <div className="divide-y">
            {documents.map((doc, i) => (
              <div key={i} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-semibold">{doc.name}</div>
                    <div className="text-sm text-gray-700">
                      {doc.source} • {doc.size} • {doc.date}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDocument(doc)}
                    className="text-purple-600 hover:text-purple-700 font-medium transition"
                  >
                    View
                  </button>
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
                  <span className="text-sm text-gray-700">Total Vectors</span>
                  <span className="font-semibold">7,299</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '73%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">Storage Used</span>
                  <span className="font-semibold">8.7 GB / 10 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">Avg. Query Time</span>
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
                  <div className="text-sm font-medium">{query}</div>
                  <div className="text-xs text-gray-700 mt-1">
                    {Math.floor(Math.random() * 20 + 10)} results • {Math.floor(Math.random() * 50 + 20)}ms
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedDocument.name}</h2>
                <p className="text-gray-700">
                  {selectedDocument.source} • {selectedDocument.size} • {selectedDocument.date}
                </p>
              </div>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 p-6 rounded-lg min-h-[300px] flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-lg font-semibold mb-2">Document Preview</p>
                  <p className="text-sm">
                    Full document viewer would be integrated here
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => alert(`Downloading ${selectedDocument.name}...`)}
                className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Download
              </button>
              <button
                onClick={() => alert(`Opening ${selectedDocument.name} in external viewer...`)}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Open in Viewer
              </button>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

