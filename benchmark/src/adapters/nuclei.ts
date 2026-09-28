import type { Adapter, AiOutput, AiFinding } from '../types.js';

interface NucleiResult {
  'template-id'?: string;
  'template-url'?: string;
  info?: {
    name?: string;
    description?: string;
    severity?: string;
    tags?: string[];
    reference?: string[];
    classification?: { 'cve-id'?: string[] };
  };
  type?: string;
  host?: string;
  matched_at?: string;
  extracted_results?: string[];
  ip?: string;
  timestamp?: string;
  matcher_status?: boolean;
  matched_line?: string;
  curl_command?: string;
}

export const nucleiAdapter: Adapter = {
  name: 'nuclei',
  parse(raw: string): AiOutput {
    const lines = raw.trim().split('\n').filter(l => l.trim());
    const findings: AiFinding[] = [];

    for (const line of lines) {
      try {
        const result: NucleiResult = JSON.parse(line);
        if (result.matcher_status === false) continue;

        const url = result.matched_at || result.host || '';
        let path = '';
        try {
          path = new URL(url).pathname;
        } catch { /* */ }

        findings.push({
          id: result['template-id'],
          title: result.info?.name || result['template-id'] || '',
          description: result.info?.description || '',
          severity: result.info?.severity,
          target_url: url,
          target_path: path,
          technology: result.info?.tags?.join(', '),
          cve_id: result.info?.classification?.['cve-id']?.[0],
          confidence: result.matcher_status ? 1 : 0,
          raw: result as unknown as Record<string, unknown>,
        });
      } catch {
        // skip non-JSON lines
      }
    }

    return { tool_name: 'nuclei', findings };
  },
};
