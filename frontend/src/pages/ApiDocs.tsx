import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

interface PathMethod {
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Array<{ name: string; in: string; required?: boolean; schema?: { type: string } }>;
  security?: Array<Record<string, string[]>>;
  responses?: Record<string, { description: string }>;
}

type PathMethods = Record<string, PathMethod>;

export default function ApiDocs() {
  const { data: spec, isLoading } = useQuery({
    queryKey: ['api-docs'],
    queryFn: () => client.get('/docs').then((r) => r.data),
  });

  if (isLoading) return <div className="text-gray-500">Loading API documentation...</div>;
  if (!spec) return <div className="text-gray-500">Could not load API spec</div>;

  const paths: Record<string, PathMethods> = spec.paths || {};

  const methodColors: Record<string, string> = {
    get: 'bg-green-500/20 text-green-400 border-green-500/30',
    post: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    patch: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    put: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    delete: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{spec.info?.title || 'API Documentation'}</h1>
        <p className="text-gray-400 text-sm mt-1">{spec.info?.description || ''}</p>
        {spec.info?.version && <span className="text-xs text-gray-500">Version {spec.info.version}</span>}
      </div>

      {spec.servers?.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Base URL</h3>
          <code className="text-sm text-brand-400">{spec.servers[0].url}</code>
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(paths).map(([path, methods]) =>
          Object.entries(methods).map(([method, detail]) => (
            <details key={`${method}-${path}`} className="card group">
              <summary className="flex items-center gap-3 cursor-pointer list-none">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${methodColors[method] || methodColors.get}`}>
                  {method}
                </span>
                <code className="text-sm text-gray-200 font-mono">{path}</code>
                {detail.summary && <span className="text-sm text-gray-500 ml-auto">{detail.summary}</span>}
              </summary>

              <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
                {detail.description && <p className="text-sm text-gray-400">{detail.description}</p>}

                {detail.tags?.length > 0 && (
                  <div className="flex gap-1">
                    {detail.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">{tag}</span>
                    ))}
                  </div>
                )}

                {detail.parameters?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Parameters</h4>
                    <div className="space-y-1">
                      {detail.parameters.map((p) => (
                        <div key={p.name} className="flex items-center gap-2 text-sm">
                          <code className="text-gray-300">{p.name}</code>
                          <span className="text-xs text-gray-600">({p.in})</span>
                          {p.required && <span className="text-xs text-red-400">required</span>}
                          {p.schema?.type && <span className="text-xs text-gray-600">{p.schema.type}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detail.security && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Authentication</h4>
                    <span className="text-xs text-yellow-400">Bearer Token or API Key</span>
                  </div>
                )}

                {detail.responses && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Responses</h4>
                    <div className="space-y-1">
                      {Object.entries(detail.responses).map(([code, resp]) => (
                        <div key={code} className="flex items-center gap-2 text-sm">
                          <span className={`font-mono text-xs ${
                            code.startsWith('2') ? 'text-green-400' : code.startsWith('4') ? 'text-yellow-400' : 'text-red-400'
                          }`}>{code}</span>
                          <span className="text-gray-500">{resp.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
}
