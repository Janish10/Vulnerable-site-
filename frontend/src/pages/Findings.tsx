import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import client from '../api/client';
import type { Finding } from '../types';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  info: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function Findings() {
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['findings', severity, status, page],
    queryFn: () =>
      client
        .get('/findings', { params: { severity: severity || undefined, status: status || undefined, page, limit: 25 } })
        .then((r) => r.data),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Findings</h1>
        <div className="flex items-center gap-3">
          <select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }} className="input-field w-36">
            <option value="">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field w-36">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="confirmed">Confirmed</option>
            <option value="fp">False Positive</option>
            <option value="resolved">Resolved</option>
          </select>
          <span className="text-sm text-gray-500">{data?.total ?? 0} findings</span>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="table-header">Title</th>
              <th className="table-header">Severity</th>
              <th className="table-header">Category</th>
              <th className="table-header">Asset</th>
              <th className="table-header">Status</th>
              <th className="table-header">Found</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="table-cell text-center text-gray-500">Loading...</td></tr>
            ) : data?.findings?.length ? (
              data.findings.map((f: Finding) => (
                <tr key={f.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                  <td className="table-cell">
                    <Link to={`/findings/${f.id}`} className="text-brand-400 hover:text-brand-300 font-medium">
                      {f.title}
                    </Link>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${SEVERITY_STYLES[f.severity] || SEVERITY_STYLES.info}`}>
                      {f.severity}
                    </span>
                  </td>
                  <td className="table-cell text-gray-400">{f.category}</td>
                  <td className="table-cell text-gray-400">{f.asset_hostname}</td>
                  <td className="table-cell">
                    <span className="capitalize text-sm">{f.status}</span>
                  </td>
                  <td className="table-cell text-gray-500 text-xs">{new Date(f.first_found).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="table-cell text-center text-gray-500">No findings match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > 25 && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-30">Previous</button>
          <span className="text-sm text-gray-400">Page {page} of {Math.ceil(data.total / 25)}</span>
          <button onClick={() => setPage(page + 1)} disabled={page * 25 >= data.total} className="btn-secondary disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}
