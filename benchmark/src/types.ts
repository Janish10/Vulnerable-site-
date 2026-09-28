export interface GroundTruthScenario {
  id: string;
  fp_id: string | null;
  type: 'true_positive' | 'false_positive_trap' | 'strong_fingerprint';
  category: string;
  subcategory: string;
  target_service: string;
  target_url: string;
  target_path: string;
  target_method?: string;
  title: string;
  description: string;
  severity?: string | null;
  expected_finding: boolean;
  evidence?: Record<string, unknown>;
  incorrect_findings?: string[];
  correct_findings?: string[];
  fp_reasoning?: string;
  tags?: string[];
}

export interface GroundTruth {
  version: string;
  generated_at: string;
  scenarios: GroundTruthScenario[];
  scoring?: ScoringConfig;
}

export interface ScoringConfig {
  true_positive_points: number;
  true_negative_points: number;
  false_positive_penalty: number;
  false_negative_penalty: number;
  cascade_penalty: number;
  duplicate_penalty: number;
  severity_mismatch_penalty: number;
}

export interface AiFinding {
  id?: string;
  title: string;
  description?: string;
  severity?: string;
  target_url?: string;
  target_path?: string;
  target_service?: string;
  category?: string;
  technology?: string;
  cve_id?: string;
  confidence?: number;
  evidence?: Record<string, unknown>;
  raw?: Record<string, unknown>;
}

export interface AiOutput {
  tool_name: string;
  tool_version?: string;
  scan_date?: string;
  findings: AiFinding[];
}

export interface MatchResult {
  scenario_id: string;
  scenario_type: GroundTruthScenario['type'];
  expected_finding: boolean;
  expected_severity?: string | null;
  matched: boolean;
  matched_findings: AiFinding[];
  classification: 'TP' | 'TN' | 'FP' | 'FN';
  fp_id?: string | null;
  notes?: string;
}

export interface ScoreResult {
  total_scenarios: number;
  true_positives: number;
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
  cascade_violations: number;
  duplicate_findings: number;
  severity_mismatches: number;
  precision: number;
  recall: number;
  f1_score: number;
  fp_avoidance_rate: number;
  fp_breakdown: Record<string, { total: number; avoided: number; rate: number }>;
  category_breakdown: Record<string, { tp: number; tn: number; fp: number; fn: number }>;
  points: number;
  max_points: number;
  percentage: number;
  details: MatchResult[];
}

export interface Adapter {
  name: string;
  parse(raw: string): AiOutput;
}
