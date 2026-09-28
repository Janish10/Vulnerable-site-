import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function SeverityBadge({ severity, count }: { severity: string; count: number }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    info: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${colors[severity] || colors.info}`}>
      <span className="capitalize">{severity}</span>
      <span className="font-bold">{count}</span>
    </span>
  );
}

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => client.get('/admin/stats').then((r) => r.data),
  });

  const { data: scansData } = useQuery({
    queryKey: ['scans'],
    queryFn: () => client.get('/scans').then((r) => r.data),
  });

  const { data: findingsData } = useQuery({
    queryKey: ['findings-recent'],
    queryFn: () => client.get('/findings?limit=5').then((r) => r.data),
  });

  const findings = stats?.findings_by_severity || {};
  const totalFindings = Object.values(findings).reduce((a: number, b) => a + (b as number), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Assets" value={stats?.total_assets ?? '...'} color="text-brand-400" />
        <StatCard label="Open Findings" value={totalFindings} color="text-yellow-400" />
        <StatCard label="Active Scans" value={stats?.scans_by_status?.running ?? 0} color="text-green-400" />
        <StatCard label="Team Members" value={stats?.total_users ?? '...'} color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Findings by Severity</h2>
          <div className="flex flex-wrap gap-2">
            {['critical', 'high', 'medium', 'low', 'info'].map((s) => (
              <SeverityBadge key={s} severity={s} count={findings[s] || 0} />
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Scans</h2>
          {scansData?.scans?.length ? (
            <div className="space-y-3">
              {scansData.scans.slice(0, 5).map((scan: any) => (
                <div key={scan.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-300">{scan.scan_type}</span>
                    <span className="text-gray-600 ml-2">{new Date(scan.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    scan.status === 'completed' ? 'bg-green-500/20 text-green-400'
                    : scan.status === 'running' ? 'bg-blue-500/20 text-blue-400'
                    : scan.status === 'failed' ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {scan.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No scans yet</p>
          )}
        </div>
      </div>

      {findingsData?.findings?.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-lg font-semibold mb-4">Recent Findings</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="table-header">Title</th>
                <th className="table-header">Severity</th>
                <th className="table-header">Asset</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {findingsData.findings.map((f: any) => (
                <tr key={f.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                  <td className="table-cell font-medium text-gray-200">{f.title}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      f.severity === 'critical' ? 'bg-red-500/20 text-red-400'
                      : f.severity === 'high' ? 'bg-orange-500/20 text-orange-400'
                      : f.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {f.severity}
                    </span>
                  </td>
                  <td className="table-cell text-gray-400">{f.asset_hostname}</td>
                  <td className="table-cell capitalize">{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
