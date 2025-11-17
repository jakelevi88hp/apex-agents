'use client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'billing' | 'team'>('general');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnvironment, setNewKeyEnvironment] = useState<'production' | 'development' | 'test'>('development');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  // Fetch data
  const { data: settings, refetch: refetchSettings } = trpc.settings.getSettings.useQuery();
  const { data: apiKeys, refetch: refetchApiKeys } = trpc.settings.listApiKeys.useQuery();
  const { data: modelConfig, refetch: refetchModelConfig } = trpc.settings.getModelConfig.useQuery();
  const { data: billingInfo } = trpc.settings.getBillingInfo.useQuery();
  const { data: teamMembers, refetch: refetchTeam } = trpc.settings.listTeamMembers.useQuery();

  // Mutations
  const updateSettings = trpc.settings.updateSettings.useMutation({
    onSuccess: () => {
      refetchSettings();
      alert('Settings saved successfully!');
    },
  });

  const createApiKey = trpc.settings.createApiKey.useMutation({
    onSuccess: (data) => {
      refetchApiKeys();
      setCreatedKey(data.keyValue);
      setNewKeyName('');
    },
  });

  const revokeApiKey = trpc.settings.revokeApiKey.useMutation({
    onSuccess: () => {
      refetchApiKeys();
      alert('API key revoked successfully');
    },
  });

  const updateModelConfig = trpc.settings.updateModelConfig.useMutation({
    onSuccess: () => {
      refetchModelConfig();
      alert('AI model configuration updated!');
    },
  });

  const inviteTeamMember = trpc.settings.inviteTeamMember.useMutation({
    onSuccess: () => {
      refetchTeam();
      alert('Team member invited successfully!');
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateTeamMemberRole = trpc.settings.updateTeamMemberRole.useMutation({
    onSuccess: () => {
      refetchTeam();
      alert('Team member role updated!');
    },
  });

  const removeTeamMember = trpc.settings.removeTeamMember.useMutation({
    onSuccess: () => {
      refetchTeam();
      alert('Team member removed successfully!');
    },
  });

  const handleSaveGeneralSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateSettings.mutate({
      organizationName: formData.get('organizationName') as string,
      email: formData.get('email') as string,
      timezone: formData.get('timezone') as string,
      emailNotifications: formData.get('emailNotifications') === 'on',
      realtimeMonitoring: formData.get('realtimeMonitoring') === 'on',
      autoRetry: formData.get('autoRetry') === 'on',
    });
  };

  const handleSaveModelConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateModelConfig.mutate({
      openaiApiKey: formData.get('openaiApiKey') as string,
      anthropicApiKey: formData.get('anthropicApiKey') as string,
      defaultModel: formData.get('defaultModel') as string,
    });
  };

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) {
      alert('Please enter a key name');
      return;
    }
    createApiKey.mutate({
      name: newKeyName,
      environment: newKeyEnvironment,
    });
  };

  const handleRevokeKey = (keyId: string, keyName: string) => {
    if (confirm(`Are you sure you want to revoke the ${keyName} key? This action cannot be undone.`)) {
      revokeApiKey.mutate({ id: keyId });
    }
  };

  const handleInviteMember = () => {
    const email = prompt('Enter email address to invite:');
    if (email) {
      inviteTeamMember.mutate({ email, role: 'member' });
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (confirm(`Remove ${memberName} from the team?`)) {
      removeTeamMember.mutate({ memberId });
    }
  };

  const handleUpdateMemberRole = (memberId: string, role: 'admin' | 'member') => {
    updateTeamMemberRole.mutate({ memberId, role });
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
              className={`w-full text-left px-4 py-2 rounded text-white ${
                activeTab === 'general' ? 'bg-purple-600' : 'hover:bg-gray-700'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`w-full text-left px-4 py-2 rounded text-white ${
                activeTab === 'api' ? 'bg-purple-600' : 'hover:bg-gray-700'
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full text-left px-4 py-2 rounded text-white ${
                activeTab === 'billing' ? 'bg-purple-600' : 'hover:bg-gray-700'
              }`}
            >
              Billing
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`w-full text-left px-4 py-2 rounded text-white ${
                activeTab === 'team' ? 'bg-purple-600' : 'hover:bg-gray-700'
              }`}
            >
              Team
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3 bg-gray-800 p-6 rounded-lg shadow">
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Organization Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
                    <input
                      type="text"
                      name="organizationName"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      defaultValue={settings?.organizationName || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      defaultValue={settings?.email || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                    <select
                      name="timezone"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      defaultValue={settings?.timezone || 'UTC-5'}
                    >
                      <option value="UTC-5">UTC-5 (Eastern Time)</option>
                      <option value="UTC-8">UTC-8 (Pacific Time)</option>
                      <option value="UTC+0">UTC+0 (GMT)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-gray-300">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      className="w-4 h-4"
                      defaultChecked={settings?.emailNotifications}
                    />
                    <span>Email notifications for agent completions</span>
                  </label>
                  <label className="flex items-center gap-3 text-gray-300">
                    <input
                      type="checkbox"
                      name="realtimeMonitoring"
                      className="w-4 h-4"
                      defaultChecked={settings?.realtimeMonitoring}
                    />
                    <span>Enable real-time monitoring</span>
                  </label>
                  <label className="flex items-center gap-3 text-gray-300">
                    <input
                      type="checkbox"
                      name="autoRetry"
                      className="w-4 h-4"
                      defaultChecked={settings?.autoRetry}
                    />
                    <span>Auto-retry failed executions</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateSettings.isPending}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">API Keys</h3>
                <p className="text-gray-400 mb-4">Manage your API keys for external integrations</p>
                
                {apiKeys && apiKeys.length > 0 ? (
                  <div className="space-y-4">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="p-4 border border-gray-700 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-white">{key.name}</div>
                            <div className="text-sm text-gray-400 font-mono">{key.keyPrefix}***************************</div>
                          </div>
                          <button
                            onClick={() => handleRevokeKey(key.id, key.name)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Revoke
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          Created {new Date(key.createdAt).toLocaleDateString()} •{' '}
                          {key.lastUsedAt
                            ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                            : 'Never used'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No API keys yet. Create your first API key!
                  </div>
                )}

                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create New Key
                </button>
              </div>

              <form onSubmit={handleSaveModelConfig}>
                <h3 className="text-lg font-bold text-white mb-4">AI Model Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">OpenAI API Key</label>
                    <input
                      type="password"
                      name="openaiApiKey"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      defaultValue={modelConfig?.openaiApiKey || ''}
                      placeholder="sk-proj-..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Anthropic API Key</label>
                    <input
                      type="password"
                      name="anthropicApiKey"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      defaultValue={modelConfig?.anthropicApiKey || ''}
                      placeholder="sk-ant-..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Model</label>
                    <select
                      name="defaultModel"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      defaultValue={modelConfig?.defaultModel || 'gpt-4-turbo'}
                    >
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={updateModelConfig.isPending}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {updateModelConfig.isPending ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'billing' && billingInfo && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Current Plan</h3>
                <div className="p-6 border-2 border-purple-600 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-2xl font-bold text-white">{billingInfo.plan}</div>
                      <div className="text-gray-400">Unlimited agents and executions</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">${billingInfo.price}</div>
                      <div className="text-gray-400">per {billingInfo.billingCycle}</div>
                    </div>
                  </div>
                  <button className="px-6 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-white">
                    Manage Subscription
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Usage This Month</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-700 text-gray-300">
                    <span>Agent Executions</span>
                    <span className="font-semibold text-white">{billingInfo.usage.executions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700 text-gray-300">
                    <span>API Calls</span>
                    <span className="font-semibold text-white">{billingInfo.usage.apiCalls.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700 text-gray-300">
                    <span>Storage Used</span>
                    <span className="font-semibold text-white">{billingInfo.usage.storageGB} GB</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700 text-gray-300">
                    <span>AI Model Costs</span>
                    <span className="font-semibold text-white">${billingInfo.usage.aiModelCosts.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {billingInfo.paymentMethod && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
                  <div className="p-4 border border-gray-700 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center text-xs text-white uppercase">
                        {billingInfo.paymentMethod.brand}
                      </div>
                      <div>
                        <div className="font-semibold text-white">•••• {billingInfo.paymentMethod.last4}</div>
                        <div className="text-sm text-gray-400">
                          Expires {billingInfo.paymentMethod.expiryMonth}/{billingInfo.paymentMethod.expiryYear}
                        </div>
                      </div>
                    </div>
                    <button className="text-purple-400 hover:text-purple-300">Update</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Team Members</h3>
                {teamMembers && teamMembers.length > 0 ? (
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex justify-between items-center p-4 border border-gray-700 rounded-lg">
                        <div>
                          <div className="font-semibold text-white">{member.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-400">{member.email}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          {member.role !== 'owner' ? (
                            <>
                              <select
                                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                                value={member.role}
                                onChange={(e) =>
                                  handleUpdateMemberRole(member.userId, e.target.value as 'admin' | 'member')
                                }
                              >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                              </select>
                              <button
                                onClick={() => handleRemoveMember(member.userId, member.name || 'this member')}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <span className="px-3 py-1 bg-purple-600 text-white rounded text-sm">Owner</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No team members yet. Invite your first team member!
                  </div>
                )}

                <button
                  onClick={handleInviteMember}
                  disabled={inviteTeamMember.isPending}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {inviteTeamMember.isPending ? 'Inviting...' : 'Invite Member'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Create API Key</h2>
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  setCreatedKey(null);
                }}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {createdKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                  <p className="text-green-400 font-semibold mb-2">API Key Created!</p>
                  <p className="text-sm text-gray-300 mb-3">
                    Make sure to copy your API key now. You won't be able to see it again!
                  </p>
                  <div className="p-3 bg-gray-900 rounded font-mono text-sm text-white break-all">
                    {createdKey}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdKey);
                    alert('API key copied to clipboard!');
                  }}
                  className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setCreatedKey(null);
                  }}
                  className="w-full px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="My API Key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Environment</label>
                  <select
                    value={newKeyEnvironment}
                    onChange={(e) => setNewKeyEnvironment(e.target.value as any)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="development">Development</option>
                    <option value="production">Production</option>
                    <option value="test">Test</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateApiKey}
                    disabled={createApiKey.isPending}
                    className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {createApiKey.isPending ? 'Creating...' : 'Create Key'}
                  </button>
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

