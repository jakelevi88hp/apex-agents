'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'billing' | 'team'>('general');

  const handleSaveChanges = () => {
    alert('Settings saved successfully!');
  };

  const handleRevokeKey = (keyType: string) => {
    if (confirm(`Are you sure you want to revoke the ${keyType} key? This action cannot be undone.`)) {
      alert(`${keyType} key has been revoked.`);
    }
  };

  const handleCreateNewKey = () => {
    alert('Creating new API key...\n\nYour new key: sk_live_' + Math.random().toString(36).substring(2, 15));
  };

  const handleManageSubscription = () => {
    alert('Opening subscription management portal...\n\nYou would be redirected to Stripe customer portal.');
  };

  const handleUpdatePayment = () => {
    alert('Opening payment method update form...');
  };

  const handleInviteMember = () => {
    const email = prompt('Enter email address to invite:');
    if (email) {
      alert(`Invitation sent to ${email}`);
    }
  };

  const handleRemoveMember = (memberName: string) => {
    if (confirm(`Remove ${memberName} from the team?`)) {
      alert(`${memberName} has been removed from the team.`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-gray-800 p-4 rounded-lg shadow h-fit">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'general' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-700'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'api' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-700'
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'billing' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-700'
              }`}
            >
              Billing
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'team' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-700'
              }`}
            >
              Team
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3 bg-gray-800 p-6 rounded-lg shadow">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Organization Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization Name</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg" defaultValue="Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input type="email" className="w-full px-4 py-2 border rounded-lg" defaultValue="admin@acme.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Timezone</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC+0 (GMT)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span>Email notifications for agent completions</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span>Enable real-time monitoring</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Auto-retry failed executions</span>
                  </label>
                </div>
              </div>

              <button 
                onClick={handleSaveChanges}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">API Keys</h3>
                <p className="text-gray-300 mb-4">Manage your API keys for external integrations</p>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-white">Production Key</div>
                        <div className="text-sm text-gray-700 font-mono">sk_live_***************************</div>
                      </div>
                      <button 
                        onClick={() => handleRevokeKey('Production')}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Revoke
                      </button>
                    </div>
                    <div className="text-xs text-gray-700">Created 30 days ago • Last used 2 hours ago</div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-white">Development Key</div>
                        <div className="text-sm text-gray-700 font-mono">sk_test_***************************</div>
                      </div>
                      <button 
                        onClick={() => handleRevokeKey('Development')}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Revoke
                      </button>
                    </div>
                    <div className="text-xs text-gray-700">Created 60 days ago • Last used 1 day ago</div>
                  </div>
                </div>

                <button 
                  onClick={handleCreateNewKey}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create New Key
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">AI Model Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
                    <input type="password" className="w-full px-4 py-2 border rounded-lg" defaultValue="sk-proj-***" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Anthropic API Key</label>
                    <input type="password" className="w-full px-4 py-2 border rounded-lg" defaultValue="sk-ant-***" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Model</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>GPT-4 Turbo</option>
                      <option>GPT-4</option>
                      <option>Claude 3.5 Sonnet</option>
                      <option>Claude 3 Opus</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Current Plan</h3>
                <div className="p-6 border-2 border-purple-600 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-2xl font-bold text-white">Pro Plan</div>
                      <div className="text-gray-300">Unlimited agents and executions</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">$97</div>
                      <div className="text-gray-300">per month</div>
                    </div>
                  </div>
                  <button 
                    onClick={handleManageSubscription}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-900"
                  >
                    Manage Subscription
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Usage This Month</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span>Agent Executions</span>
                    <span className="font-semibold text-white">12,847</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>API Calls</span>
                    <span className="font-semibold text-white">45,231</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Storage Used</span>
                    <span className="font-semibold text-white">8.7 GB</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>AI Model Costs</span>
                    <span className="font-semibold text-white">$247.32</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
                <div className="p-4 border rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center text-xs">VISA</div>
                    <div>
                      <div className="font-semibold text-white">•••• 4242</div>
                      <div className="text-sm text-gray-700">Expires 12/25</div>
                    </div>
                  </div>
                  <button 
                    onClick={handleUpdatePayment}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Team Members</h3>
                <div className="space-y-3">
                  {[
                    { name: 'John Doe', email: 'john@acme.com', role: 'Owner' },
                    { name: 'Jane Smith', email: 'jane@acme.com', role: 'Admin' },
                    { name: 'Bob Johnson', email: 'bob@acme.com', role: 'Member' },
                  ].map((member, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-white">{member.name}</div>
                        <div className="text-sm text-gray-700">{member.email}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <select className="px-3 py-1 border rounded" defaultValue={member.role}>
                          <option>Owner</option>
                          <option>Admin</option>
                          <option>Member</option>
                        </select>
                        {member.role !== 'Owner' && (
                          <button 
                            onClick={() => handleRemoveMember(member.name)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleInviteMember}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Invite Member
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

