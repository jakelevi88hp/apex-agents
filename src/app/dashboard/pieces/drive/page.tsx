"use client";

import { useState, useEffect } from "react";
import { Folder, FileCode, Link as LinkIcon, FileText, Plus, Search, Share2 } from "lucide-react";

interface DriveMaterial {
  id: string;
  materialType: 'code' | 'note' | 'link' | 'document' | 'snippet';
  title: string;
  content?: string;
  url?: string;
  language?: string;
  tags?: string[];
  shareableLink?: string;
  createdAt: string;
}

export default function PiecesDrivePage() {
  const [materials, setMaterials] = useState<DriveMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>('all');
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch("/api/pieces/drive", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setMaterials(data.materials || []);
      }
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    // Implementation for saving new material
    setShowSaveModal(false);
    loadMaterials();
  }

  const filteredMaterials = materials.filter((mat) => {
    if (filterType !== 'all' && mat.materialType !== filterType) return false;
    if (searchQuery && !mat.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'code':
      case 'snippet':
        return <FileCode className="w-5 h-5" />;
      case 'link':
        return <LinkIcon className="w-5 h-5" />;
      case 'note':
      case 'document':
        return <FileText className="w-5 h-5" />;
      default:
        return <Folder className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Pieces Drive</h1>
                <p className="text-sm text-gray-400">Your material repository</p>
              </div>
            </div>
            <button
              onClick={() => setShowSaveModal(true)}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg px-4 py-2 font-medium hover:from-green-700 hover:to-teal-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Save Material
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials..."
                className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'code', 'note', 'link', 'document', 'snippet'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filterType === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading materials...</div>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No materials found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="bg-gray-900 rounded-lg border border-gray-800 p-4 hover:border-green-500 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-green-400">{getIcon(material.materialType)}</div>
                    <div>
                      <h3 className="text-white font-medium">{material.title}</h3>
                      <p className="text-xs text-gray-400">{material.materialType}</p>
                    </div>
                  </div>
                  {material.shareableLink && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/share/${material.shareableLink}`
                        );
                      }}
                      className="text-gray-400 hover:text-green-400 transition-colors"
                      title="Copy shareable link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {material.content && (
                  <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                    {material.content.substring(0, 150)}...
                  </p>
                )}
                {material.url && (
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-xs hover:underline"
                  >
                    {material.url}
                  </a>
                )}
                {material.tags && material.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {material.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-3">
                  {new Date(material.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
