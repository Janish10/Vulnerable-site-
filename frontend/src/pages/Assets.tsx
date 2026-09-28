import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import client from '../api/client';
import type { Asset } from '../types';

export default function Assets() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['assets', search, page],
    queryFn: () => client.get('/assets', { params: { search, page, limit: 25 } }).then((r) => r.data),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assets</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search hostname or IP..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field w-72"
          />
          <span className="text-sm text-gray-500">{data?.total ?? 0} assets</span>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="table-header">Hostname</th>
              <th className="table-header">IP Address</th>
              <th className="table-header">Port</th>
              <th className="table-header">Type</th>
              <th className="table-header">Status</th>
              <th className="table-header">Sanctioned</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="table-cell text-center text-gray-500">Loading...</td></tr>
            ) : data?.assets?.length ? (
              data.assets.map((asset: Asset) => (
                <tr key={asset.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                  <td className="table-cell">
                    <Link to={`/assets/${asset.id}`} className="text-brand-400 hover:text-brand-300 font-medium">
                      {asset.hostname}
                    </Link>
                  </td>
                  <td className="table-cell text-gray-400">{asset.ip_address || '-'}</td>
                  <td className="table-cell text-gray-400">{asset.port}</td>
                  <td className="table-cell">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                      {asset.asset_type}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      asset.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    {asset.is_sanctioned ? (
                      <span className="text-green-400">Yes</span>
                    ) : (
                      <span className="text-red-400 font-medium">No</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="table-cell text-center text-gray-500">No assets found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > 25 && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-30">
            Previous
          </button>
          <span className="text-sm text-gray-400">Page {page} of {Math.ceil(data.total / 25)}</span>
          <button onClick={() => setPage(page + 1)} disabled={page * 25 >= data.total} className="btn-secondary disabled:opacity-30">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
