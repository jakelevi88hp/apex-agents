'use client';

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Analytics & Monitoring</h1>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-700 text-sm font-medium mb-2">Total Executions</div>
          <div className="text-3xl font-bold">12,847</div>
          <div className="text-green-600 text-sm mt-2">↑ 23% from last month</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-700 text-sm font-medium mb-2">Success Rate</div>
          <div className="text-3xl font-bold">94.2%</div>
          <div className="text-green-600 text-sm mt-2">↑ 2.1% improvement</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-700 text-sm font-medium mb-2">Avg Response Time</div>
          <div className="text-3xl font-bold">1.8s</div>
          <div className="text-green-600 text-sm mt-2">↓ 0.3s faster</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-700 text-sm font-medium mb-2">API Cost</div>
          <div className="text-3xl font-bold">$247</div>
          <div className="text-gray-700 text-sm mt-2">This month</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Execution Trends</h3>
          <div className="h-64 flex items-end justify-around gap-2">
            {[65, 78, 82, 90, 75, 88, 95].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-purple-600 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="text-xs text-gray-700 mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Agent Performance</h3>
          <div className="space-y-3">
            {[
              { name: 'Research Agent', success: 96, executions: 3421 },
              { name: 'Analysis Agent', success: 94, executions: 2847 },
              { name: 'Writing Agent', success: 92, executions: 2156 },
              { name: 'Code Agent', success: 88, executions: 1892 },
            ].map((agent) => (
              <div key={agent.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{agent.name}</span>
                  <span className="text-gray-700">{agent.success}% • {agent.executions} runs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${agent.success}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Real-time Activity</h3>
        <div className="space-y-3">
          {[
            { agent: 'Research Agent', task: 'Market analysis for Q1', status: 'running', time: '2s ago' },
            { agent: 'Writing Agent', task: 'Blog post generation', status: 'completed', time: '1m ago' },
            { agent: 'Analysis Agent', task: 'Customer sentiment analysis', status: 'running', time: '3m ago' },
            { agent: 'Code Agent', task: 'API endpoint generation', status: 'completed', time: '5m ago' },
            { agent: 'Decision Agent', task: 'Budget allocation optimization', status: 'failed', time: '8m ago' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
              <div
                className={`w-2 h-2 rounded-full ${
                  activity.status === 'running'
                    ? 'bg-blue-500 animate-pulse'
                    : activity.status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
              ></div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{activity.agent}</div>
                <div className="text-sm text-gray-600">{activity.task}</div>
              </div>
              <div className="text-xs text-gray-700">{activity.time}</div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  activity.status === 'running'
                    ? 'bg-blue-100 text-blue-800'
                    : activity.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

