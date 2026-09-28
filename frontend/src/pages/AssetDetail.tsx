import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import type { Asset, Technology, Finding } from '../types';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: assetData } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => client.get(`/assets/${id}`).then((r) => r.data),
  });

  const { data: techData } = useQuery({
    queryKey: ['asset-tech', id],
    queryFn: () => client.get(`/assets/${id}/technologies`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: findingsData } = useQuery({
    queryKey: ['asset-findings', id],
    queryFn: () => client.get('/findings', { params: { asset_id: id } }).then((r) => r.data),
    enabled: !!id,
  });

  const asset: Asset | undefined = assetData?.asset;

  if (!asset) {
    return <div className="text-gray-500">Loading asset...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/assets" className="text-gray-400 hover:text-gray-200">&larr; Assets</Link>
        <span className="text-gray-600">/</span>
        <h1 className="text-2xl font-bold">{asset.hostname}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Asset Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Hostname</dt><dd>{asset.hostname}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">IP Address</dt><dd>{asset.ip_address || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Port</dt><dd>{asset.port}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Protocol</dt><dd>{asset.protocol}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd>{asset.asset_type}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="capitalize">{asset.status}</dd></div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Sanctioned</dt>
              <dd className={asset.is_sanctioned ? 'text-green-400' : 'text-red-400 font-medium'}>{asset.is_sanctioned ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Technologies ({techData?.technologies?.length || 0})</h3>
          {techData?.technologies?.length ? (
            <div className="space-y-2">
              {techData.technologies.map((tech: Technology) => (
                <div key={tech.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-200">{tech.name}</span>
                    {tech.version && <span className="text-gray-400 ml-2">v{tech.version}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      tech.confidence === 'strong' ? 'bg-green-500/20 text-green-400'
                      : tech.confidence === 'weak' ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {tech.confidence}
                    </span>
                    {tech.is_strong_signal && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-brand-500/20 text-brand-400">strong signal</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No technologies detected</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Related Findings ({findingsData?.findings?.length || 0})</h3>
        {findingsData?.findings?.length ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="table-header">Title</th>
                <th className="table-header">Severity</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {findingsData.findings.map((f: Finding) => (
                <tr key={f.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                  <td className="table-cell">
                    <Link to={`/findings/${f.id}`} className="text-brand-400 hover:text-brand-300">{f.title}</Link>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      f.severity === 'critical' ? 'bg-red-500/20 text-red-400'
                      : f.severity === 'high' ? 'bg-orange-500/20 text-orange-400'
                      : f.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                    }`}>{f.severity}</span>
                  </td>
                  <td className="table-cell capitalize">{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">No findings for this asset</p>
        )}
      </div>
    </div>
  );
}
