'use client';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Active Agents</div>
          <div className="text-3xl font-bold mt-2">12</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Workflows</div>
          <div className="text-3xl font-bold mt-2">8</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Executions Today</div>
          <div className="text-3xl font-bold mt-2">247</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <div className="font-semibold">Research Agent completed task</div>
              <div className="text-sm text-gray-500">2 minutes ago</div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Completed</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <div className="font-semibold">Workflow "Data Analysis" started</div>
              <div className="text-sm text-gray-500">15 minutes ago</div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">Running</span>
          </div>
        </div>
      </div>
    </div>
  );
}

