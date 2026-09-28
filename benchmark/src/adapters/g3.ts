import type { Adapter, AiOutput, AiFinding } from '../types.js';

export const g3Adapter: Adapter = {
  name: 'g3',
  parse(raw: string): AiOutput {
    const data = JSON.parse(raw);

    const findings: AiFinding[] = [];
    const items = data.findings || data.vulnerabilities || data.results || [];

    for (const item of items) {
      findings.push({
        id: item.id || item.finding_id,
        title: item.title || item.name || item.vulnerability || '',
        description: item.description || item.details || '',
        severity: item.severity || item.risk_level,
        target_url: item.target_url || item.url || item.endpoint,
        target_path: item.path || item.target_path,
        target_service: item.service || item.target_service || item.subdomain,
        category: item.category || item.type,
        technology: item.technology || item.tech_stack,
        cve_id: item.cve || item.cve_id,
        confidence: item.confidence,
        evidence: item.evidence || item.proof,
        raw: item,
      });
    }

    return {
      tool_name: 'g3',
      tool_version: data.version || data.g3_version,
      scan_date: data.scan_date || data.timestamp,
      findings,
    };
  },
};
