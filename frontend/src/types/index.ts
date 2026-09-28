export interface User {
  id: string;
  org_id: string;
  email: string;
  role: 'owner' | 'admin' | 'analyst' | 'viewer';
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  mfa_secret: string | null;
  last_login: string | null;
  created_at: string;
}

export interface Org {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  org_id: string;
  hostname: string;
  ip_address: string | null;
  port: number;
  protocol: string;
  asset_type: string;
  status: string;
  is_sanctioned: boolean;
  owner_user_id: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  first_seen: string;
  last_seen: string;
  created_at: string;
}

export interface Technology {
  id: string;
  asset_id: string;
  asset_hostname?: string;
  name: string;
  version: string | null;
  version_source: string;
  confidence: 'strong' | 'weak' | 'assumed';
  evidence_type: string;
  evidence_detail: string;
  fingerprint_source: string;
  is_strong_signal: boolean;
  created_at: string;
}

export interface Scan {
  id: string;
  org_id: string;
  initiated_by: string;
  initiated_by_email?: string;
  scan_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  target_assets: string[];
  config: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Finding {
  id: string;
  org_id: string;
  scan_id: string | null;
  asset_id: string;
  technology_id: string | null;
  asset_hostname?: string;
  tech_name?: string;
  tech_version?: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  finding_type: string;
  evidence: Record<string, unknown> & { comments?: Comment[] };
  remediation: string;
  status: 'open' | 'confirmed' | 'fp' | 'resolved' | 'accepted';
  cve_ids: string[];
  cvss_score: number | null;
  is_duplicate: boolean;
  first_found: string;
  last_found: string;
  resolved_at: string | null;
  created_at: string;
}

export interface Comment {
  user_id: string;
  user_email: string;
  body: string;
  created_at: string;
}

export interface CVE {
  id: string;
  description: string;
  cvss_v3_score: number | null;
  cvss_v3_vector: string;
  affected_product: string;
  affected_version_start: string | null;
  affected_version_end: string | null;
  version_end_type: string;
  is_kev: boolean;
  published_at: string;
  data: Record<string, unknown>;
}

export interface AuditLog {
  id: number;
  org_id: string;
  user_id: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface ApiToken {
  id: string;
  name: string;
  token_prefix: string;
  scopes: string[];
  last_used: string | null;
  expires_at: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: Pick<User, 'id' | 'email' | 'role' | 'org_id'>;
}
