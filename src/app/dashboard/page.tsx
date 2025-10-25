'use client';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="text-gray-300 text-sm font-medium">Active Agents</div>
          <div className="text-3xl font-bold mt-2 text-white">12</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="text-gray-300 text-sm font-medium">Workflows</div>
          <div className="text-3xl font-bold mt-2 text-white">8</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="text-gray-300 text-sm font-medium">Executions Today</div>
          <div className="text-3xl font-bold mt-2 text-white">247</div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-white">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <div>
              <div className="font-semibold text-white">Research Agent completed task</div>
              <div className="text-sm text-gray-400">2 minutes ago</div>
            </div>
            <span className="px-3 py-1 bg-green-900 text-green-300 rounded text-sm">Completed</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <div>
              <div className="font-semibold text-white">Workflow "Data Analysis" started</div>
              <div className="text-sm text-gray-400">15 minutes ago</div>
            </div>
            <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded text-sm">Running</span>
          </div>
        </div>
      </div>
    </div>
  );
}

