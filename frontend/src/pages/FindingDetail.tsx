import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import type { Finding, Comment } from '../types';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  info: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function FindingDetail() {
  const { id } = useParams<{ id: string }>();
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['finding', id],
    queryFn: () => client.get(`/findings/${id}`).then((r) => r.data),
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['finding-comments', id],
    queryFn: () => client.get(`/findings/${id}/comments`).then((r) => r.data),
    enabled: !!id,
  });

  const addComment = useMutation({
    mutationFn: (body: string) => client.post(`/findings/${id}/comment`, { body }),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['finding-comments', id] });
    },
  });

  const finding: Finding | undefined = data?.finding;

  if (!finding) {
    return <div className="text-gray-500">Loading finding...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/findings" className="text-gray-400 hover:text-gray-200">&larr; Findings</Link>
        <span className="text-gray-600">/</span>
        <h1 className="text-2xl font-bold">{finding.title}</h1>
        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium border ${SEVERITY_STYLES[finding.severity] || SEVERITY_STYLES.info}`}>
          {finding.severity}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Description</h3>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{finding.description}</div>

          {finding.evidence && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Evidence</h3>
              <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">{finding.evidence}</pre>
            </div>
          )}

          {finding.remediation && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Remediation</h3>
              <div className="text-gray-300 leading-relaxed">{finding.remediation}</div>
            </div>
          )}
        </div>

        <div className="card h-fit">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="capitalize">{finding.status}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Category</dt><dd>{finding.category}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Asset</dt><dd>{finding.asset_hostname}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">First Found</dt><dd>{new Date(finding.first_found).toLocaleDateString()}</dd></div>
            {finding.last_seen && (
              <div className="flex justify-between"><dt className="text-gray-500">Last Seen</dt><dd>{new Date(finding.last_seen).toLocaleDateString()}</dd></div>
            )}
            {finding.cvss_score !== null && finding.cvss_score !== undefined && (
              <div className="flex justify-between"><dt className="text-gray-500">CVSS</dt><dd className="font-bold">{finding.cvss_score}</dd></div>
            )}
            {finding.cve_id && (
              <div className="flex justify-between"><dt className="text-gray-500">CVE</dt><dd className="font-mono text-xs">{finding.cve_id}</dd></div>
            )}
          </dl>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Comments ({commentsData?.comments?.length || 0})</h3>

        <div className="space-y-4 mb-6">
          {commentsLoading ? (
            <p className="text-gray-500 text-sm">Loading comments...</p>
          ) : commentsData?.comments?.length ? (
            commentsData.comments.map((c: Comment) => (
              <div key={c.id} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{c.author_email}</span>
                  <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <div
                  className="text-sm text-gray-400 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: c.body }}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No comments yet</p>
          )}
        </div>

        <div className="flex gap-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="input-field flex-1 resize-none"
          />
          <button
            onClick={() => comment.trim() && addComment.mutate(comment)}
            disabled={!comment.trim() || addComment.isPending}
            className="btn-primary self-end disabled:opacity-30"
          >
            {addComment.isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
