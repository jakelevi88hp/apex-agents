"use client";

import { useState, useEffect } from "react";
import { Activity, CheckCircle, XCircle, Clock, FileText, Code, MessageSquare, Link as LinkIcon } from "lucide-react";

interface ActivityRollup {
  id: string;
  periodStart: string;
  periodEnd: string;
  summary: string;
  mainTasks: Array<{
    task: string;
    status: 'completed' | 'in_progress' | 'pending';
    details?: string;
  }>;
  projects: Array<{
    project: string;
    activity: string;
    changes?: string;
  }>;
  issuesResolved: Array<{
    issue: string;
    resolution: string;
    link?: string;
  }>;
  keyDecisions: Array<{
    decision: string;
    context: string;
    impact?: string;
  }>;
  discussions: Array<{
    topic: string;
    participants?: string[];
    summary: string;
    link?: string;
  }>;
  documents: Array<{
    document: string;
    action: 'created' | 'updated' | 'reviewed';
    link?: string;
  }>;
  codeReviewed: Array<{
    file: string;
    changes: string;
    link?: string;
  }>;
  links: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
}

export default function WorkstreamActivityPage() {
  const [rollups, setRollups] = useState<ActivityRollup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRollup, setSelectedRollup] = useState<ActivityRollup | null>(null);

  useEffect(() => {
    loadRollups();
  }, []);

  async function loadRollups() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch("/api/pieces/workstream", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setRollups(data.rollups || []);
      }
    } catch (error) {
      console.error('Failed to load rollups:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Workstream Activity</h1>
              <p className="text-sm text-gray-400">Automated activity roll-ups every 20 minutes</p>
            </div>
          </div>
        </div>

        {/* Roll-ups List */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading activity...</div>
        ) : rollups.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No activity roll-ups yet</p>
            <p className="text-sm text-gray-500 mt-2">Roll-ups are generated automatically every 20 minutes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rollups.map((rollup) => (
              <div
                key={rollup.id}
                className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-orange-500 transition-all cursor-pointer"
                onClick={() => setSelectedRollup(rollup)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {formatPeriod(rollup.periodStart, rollup.periodEnd)}
                    </h3>
                    <p className="text-sm text-gray-400">{rollup.summary}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(rollup.periodStart).toLocaleDateString()}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {rollup.mainTasks.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white">{rollup.mainTasks.length}</div>
                      <div className="text-xs text-gray-400">Tasks</div>
                    </div>
                  )}
                  {rollup.discussions.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white">{rollup.discussions.length}</div>
                      <div className="text-xs text-gray-400">Discussions</div>
                    </div>
                  )}
                  {rollup.codeReviewed.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white">{rollup.codeReviewed.length}</div>
                      <div className="text-xs text-gray-400">Code Files</div>
                    </div>
                  )}
                  {rollup.documents.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white">{rollup.documents.length}</div>
                      <div className="text-xs text-gray-400">Documents</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedRollup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedRollup(null)}>
            <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Activity Roll-up
                    </h2>
                    <p className="text-sm text-gray-400">
                      {formatPeriod(selectedRollup.periodStart, selectedRollup.periodEnd)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRollup(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Summary</h3>
                  <p className="text-gray-300">{selectedRollup.summary}</p>
                </div>

                {/* Tasks */}
                {selectedRollup.mainTasks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Tasks
                    </h3>
                    <div className="space-y-2">
                      {selectedRollup.mainTasks.map((task, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            {task.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                            {task.status === 'in_progress' && <Clock className="w-4 h-4 text-yellow-400" />}
                            {task.status === 'pending' && <XCircle className="w-4 h-4 text-gray-400" />}
                            <span className="text-white font-medium">{task.task}</span>
                          </div>
                          {task.details && (
                            <p className="text-sm text-gray-400 ml-6">{task.details}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Discussions */}
                {selectedRollup.discussions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Discussions
                    </h3>
                    <div className="space-y-2">
                      {selectedRollup.discussions.map((disc, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-3">
                          <div className="text-white font-medium mb-1">{disc.topic}</div>
                          <p className="text-sm text-gray-400">{disc.summary}</p>
                          {disc.link && (
                            <a
                              href={disc.link}
                              className="text-blue-400 text-xs hover:underline mt-1 inline-block"
                            >
                              View conversation →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Reviewed */}
                {selectedRollup.codeReviewed.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Code Reviewed
                    </h3>
                    <div className="space-y-2">
                      {selectedRollup.codeReviewed.map((code, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-3">
                          <div className="text-white font-medium mb-1">{code.file}</div>
                          <p className="text-sm text-gray-400">{code.changes}</p>
                          {code.link && (
                            <a
                              href={code.link}
                              className="text-blue-400 text-xs hover:underline mt-1 inline-block"
                            >
                              View file →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {selectedRollup.links.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <LinkIcon className="w-5 h-5" />
                      Helpful Links
                    </h3>
                    <div className="space-y-2">
                      {selectedRollup.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors"
                        >
                          <div className="text-white font-medium">{link.title}</div>
                          {link.description && (
                            <p className="text-sm text-gray-400 mt-1">{link.description}</p>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
