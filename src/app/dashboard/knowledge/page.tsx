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
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

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

  const handleManageSource = (source: DataSource) => {
    setSelectedSource(source);
    setShowManageModal(true);
  };

  const handleConnectSource = (source: DataSource) => {
    setSelectedSource(source);
    setShowConnectModal(true);
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
      <h1 className="text-3xl font-bold text-white mb-8">Knowledge Base</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'sources'
              ? 'border-b-2 border-purple-600 text-purple-400'
              : 'text-gray-300 hover:text-gray-100'
          }`}
        >
          Data Sources
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'documents'
              ? 'border-b-2 border-purple-600 text-purple-400'
              : 'text-gray-300 hover:text-gray-100'
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveTab('embeddings')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'embeddings'
              ? 'border-b-2 border-purple-600 text-purple-400'
              : 'text-gray-300 hover:text-gray-100'
          }`}
        >
          Embeddings
        </button>
      </div>

      {/* Data Sources Tab */}
      {activeTab === 'sources' && (
        <div className="grid md:grid-cols-3 gap-6">
          {dataSources.map((source) => (
            <div key={source.name} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-4xl mb-2">{source.icon}</div>
                  <h3 className="text-lg font-bold text-white">{source.name}</h3>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    source.status === 'connected'
                      ? 'bg-green-900 text-green-300'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {source.status}
                </span>
              </div>
              <div className="text-gray-300 mb-4">{source.docs.toLocaleString()} documents</div>
              <div className="flex gap-2">
                {source.status === 'connected' ? (
                  <button
                    onClick={() => handleManageSource(source)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    Manage
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnectSource(source)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-300">{documents.length} documents indexed</p>
            <button
              onClick={handleUploadDocument}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              + Upload Document
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Source</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Size</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {documents.map((doc, i) => (
                  <tr key={i} className="hover:bg-gray-700">
                    <td className="px-6 py-4 text-white">{doc.name}</td>
                    <td className="px-6 py-4 text-gray-300">{doc.source}</td>
                    <td className="px-6 py-4 text-gray-300">{doc.size}</td>
                    <td className="px-6 py-4 text-gray-300">{doc.date}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Embeddings Tab */}
      {activeTab === 'embeddings' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Vector Embeddings</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <div>
                <div className="font-semibold text-white">Total Embeddings</div>
                <div className="text-gray-300">7,298 vectors</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-gray-400">Indexed</div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-700 rounded">
                <div className="text-gray-300 text-sm">Last Query</div>
                <div className="text-white font-semibold">"market trends 2025"</div>
                <div className="text-gray-400 text-sm mt-1">2 minutes ago</div>
              </div>
              <div className="p-4 bg-gray-700 rounded">
                <div className="text-gray-300 text-sm">Avg Response Time</div>
                <div className="text-white font-semibold">0.3s</div>
                <div className="text-gray-400 text-sm mt-1">Last 100 queries</div>
              </div>
              <div className="p-4 bg-gray-700 rounded">
                <div className="text-gray-300 text-sm">Model</div>
                <div className="text-white font-semibold">text-embedding-3-large</div>
                <div className="text-gray-400 text-sm mt-1">OpenAI</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Source Modal */}
      {showManageModal && selectedSource && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Manage {selectedSource.name}
                </h2>
                <p className="text-gray-300">
                  Configure sync settings and manage permissions
                </p>
              </div>
              <button
                onClick={() => setShowManageModal(false)}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Sync Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="text-gray-300">Auto-sync enabled</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sync Frequency
                    </label>
                    <select className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded">
                      <option>Every 15 minutes</option>
                      <option>Every hour</option>
                      <option>Every 6 hours</option>
                      <option>Daily</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Folders/Channels</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="text-gray-300">All folders</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-gray-300">Specific folders only</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Permissions</h3>
                <div className="p-4 bg-gray-700 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Read access</span>
                    <span className="text-green-400">✓ Granted</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Write access</span>
                    <span className="text-green-400">✓ Granted</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowManageModal(false)}
                  className="flex-1 px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Settings saved successfully!');
                    setShowManageModal(false);
                  }}
                  className="flex-1 px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Source Modal */}
      {showConnectModal && selectedSource && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Connect to {selectedSource.name}
                </h2>
                <p className="text-gray-300">
                  Authorize access to sync your data
                </p>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-700 rounded">
                <h3 className="font-semibold text-white mb-2">This will allow Apex Agents to:</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Read your files and documents</li>
                  <li>• Access metadata and permissions</li>
                  <li>• Sync changes automatically</li>
                  <li>• Create embeddings for search</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`OAuth authentication would be initiated here for ${selectedSource.name}`);
                  setShowConnectModal(false);
                }}
                className="flex-1 px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedDocument.name}</h2>
                <p className="text-gray-400 mt-1">
                  {selectedDocument.source} • {selectedDocument.size} • {selectedDocument.date}
                </p>
              </div>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-8 bg-gray-700 min-h-[400px] flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-white mb-2">Document Preview</h3>
              <p className="text-gray-300 text-center mb-6">
                Full document viewer would be integrated here
              </p>
              <div className="text-sm text-gray-400 bg-gray-800 p-4 rounded max-w-md">
                <p className="mb-2">Preview would show:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>PDF rendering for .pdf files</li>
                  <li>Markdown preview for .md files</li>
                  <li>Syntax highlighting for code</li>
                  <li>Text extraction for documents</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-700 bg-gray-800">
              <button
                onClick={() => alert('Download functionality would be implemented here')}
                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Download
              </button>
              <button
                onClick={() => alert('External viewer would open here')}
                className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Open in Viewer
              </button>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="ml-auto px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
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

