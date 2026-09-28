import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import type { Scan } from '../types';

export default function Scans() {
  const [scanType, setScanType] = useState('full');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['scans'],
    queryFn: () => client.get('/scans').then((r) => r.data),
  });

  const createScan = useMutation({
    mutationFn: () => client.post('/scans', { scan_type: scanType }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scans'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Scans</h1>
        <div className="flex items-center gap-3">
          <select value={scanType} onChange={(e) => setScanType(e.target.value)} className="input-field w-40">
            <option value="full">Full Scan</option>
            <option value="fingerprint">Fingerprint</option>
            <option value="vuln">Vulnerability</option>
            <option value="port">Port Scan</option>
          </select>
          <button onClick={() => createScan.mutate()} disabled={createScan.isPending} className="btn-primary">
            {createScan.isPending ? 'Starting...' : 'New Scan'}
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="table-header">Type</th>
              <th className="table-header">Status</th>
              <th className="table-header">Initiated By</th>
              <th className="table-header">Started</th>
              <th className="table-header">Completed</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="table-cell text-center text-gray-500">Loading...</td></tr>
            ) : data?.scans?.length ? (
              data.scans.map((scan: Scan & { initiated_by_email?: string }) => (
                <tr key={scan.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                  <td className="table-cell capitalize font-medium">{scan.scan_type}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      scan.status === 'completed' ? 'bg-green-500/20 text-green-400'
                      : scan.status === 'running' ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                      : scan.status === 'failed' ? 'bg-red-500/20 text-red-400'
                      : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {scan.status}
                    </span>
                  </td>
                  <td className="table-cell text-gray-400">{scan.initiated_by_email || '-'}</td>
                  <td className="table-cell text-gray-400">{scan.started_at ? new Date(scan.started_at).toLocaleString() : '-'}</td>
                  <td className="table-cell text-gray-400">{scan.completed_at ? new Date(scan.completed_at).toLocaleString() : '-'}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="table-cell text-center text-gray-500">No scans yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
