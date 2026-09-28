import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import type { User, AuditLog } from '../types';

type Tab = 'users' | 'audit' | 'settings';

export default function Admin() {
  const [tab, setTab] = useState<Tab>('users');
  const queryClient = useQueryClient();

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => client.get('/users').then((r) => r.data),
    enabled: tab === 'users',
  });

  const { data: auditData } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => client.get('/admin/audit-logs').then((r) => r.data),
    enabled: tab === 'audit',
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => client.get('/admin/stats').then((r) => r.data),
    enabled: tab === 'settings',
  });

  const updateUser = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      client.patch(`/users/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'users', label: 'Users' },
    { key: 'audit', label: 'Audit Log' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Administration</h1>

      <div className="flex gap-1 mb-6 bg-gray-800/50 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="table-header">Email</th>
                <th className="table-header">Name</th>
                <th className="table-header">Role</th>
                <th className="table-header">Organization</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.users?.map((u: User & { org_name?: string }) => (
                <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                  <td className="table-cell font-medium">{u.email}</td>
                  <td className="table-cell text-gray-400">{u.name || '-'}</td>
                  <td className="table-cell">
                    <select
                      value={u.role}
                      onChange={(e) => updateUser.mutate({ id: u.id, payload: { role: e.target.value } })}
                      className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="analyst">Analyst</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </td>
                  <td className="table-cell text-gray-400 text-sm">{u.org_name || '-'}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => updateUser.mutate({ id: u.id, payload: { is_active: !u.is_active } })}
                      className="text-xs text-gray-400 hover:text-gray-200"
                    >
                      {u.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              )) || (
                <tr><td colSpan={6} className="table-cell text-center text-gray-500">Loading...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'audit' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="table-header">Timestamp</th>
                <th className="table-header">User</th>
                <th className="table-header">Action</th>
                <th className="table-header">Resource</th>
                <th className="table-header">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditData?.logs?.length ? (
                auditData.logs.map((log: AuditLog) => (
                  <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                    <td className="table-cell text-gray-500 text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="table-cell text-gray-400">{log.user_email || log.user_id}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        log.action.includes('delete') ? 'bg-red-500/20 text-red-400'
                        : log.action.includes('create') ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="table-cell text-gray-400 text-sm font-mono">{log.resource_type}/{log.resource_id?.slice(0, 8)}</td>
                    <td className="table-cell text-gray-500 text-xs max-w-xs truncate">{log.details ? JSON.stringify(log.details) : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="table-cell text-center text-gray-500">{auditData ? 'No audit logs' : 'Loading...'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Organization Stats</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Total Assets</dt><dd>{statsData?.total_assets ?? '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Total Users</dt><dd>{statsData?.total_users ?? '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Total Findings</dt><dd>{statsData?.total_findings ?? '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Active Scans</dt><dd>{statsData?.scans_by_status?.running ?? 0}</dd></div>
            </dl>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-400 mb-4">System Configuration</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">API Version</dt><dd>v1.0.0</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Rate Limit</dt><dd>100 req/15min</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Session Duration</dt><dd>24 hours</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Webhook URL</dt><dd className="text-gray-500 text-xs">Not configured</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
