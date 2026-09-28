import type { Adapter, AiOutput, AiFinding } from '../types.js';

export const genericAdapter: Adapter = {
  name: 'generic',
  parse(raw: string): AiOutput {
    const data = JSON.parse(raw);

    if (data.findings && Array.isArray(data.findings)) {
      return {
        tool_name: data.tool_name || data.scanner || 'unknown',
        tool_version: data.tool_version || data.version,
        scan_date: data.scan_date || data.timestamp,
        findings: data.findings.map(normalizeFinding),
      };
    }

    if (data.results && Array.isArray(data.results)) {
      return {
        tool_name: data.tool || 'unknown',
        findings: data.results.map(normalizeFinding),
      };
    }

    if (Array.isArray(data)) {
      return {
        tool_name: 'unknown',
        findings: data.map(normalizeFinding),
      };
    }

    throw new Error('Unrecognized output format. Expected { findings: [...] }, { results: [...] }, or [...]');
  },
};

function normalizeFinding(raw: Record<string, unknown>): AiFinding {
  return {
    id: str(raw.id),
    title: str(raw.title || raw.name || raw.vulnerability || raw.finding || '') || '',
    description: str(raw.description || raw.detail || raw.details || ''),
    severity: str(raw.severity || raw.risk || raw.priority || ''),
    target_url: str(raw.target_url || raw.url || raw.target || raw.host || ''),
    target_path: str(raw.target_path || raw.path || raw.endpoint || ''),
    target_service: str(raw.target_service || raw.service || ''),
    category: str(raw.category || raw.type || ''),
    technology: str(raw.technology || raw.tech || raw.product || ''),
    cve_id: str(raw.cve_id || raw.cve || ''),
    confidence: typeof raw.confidence === 'number' ? raw.confidence : undefined,
    evidence: typeof raw.evidence === 'object' && raw.evidence !== null
      ? raw.evidence as Record<string, unknown>
      : undefined,
    raw,
  };
}

function str(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  return String(v);
}
