import type { MatchResult, ScoreResult, ScoringConfig } from './types.js';

const DEFAULT_SCORING: ScoringConfig = {
  true_positive_points: 10,
  true_negative_points: 5,
  false_positive_penalty: -8,
  false_negative_penalty: -3,
  cascade_penalty: -5,
  duplicate_penalty: -2,
  severity_mismatch_penalty: -1,
};

export function score(matches: MatchResult[], config?: Partial<ScoringConfig>): ScoreResult {
  const scoring = { ...DEFAULT_SCORING, ...config };

  let tp = 0, tn = 0, fp = 0, fn = 0;
  let cascadeViolations = 0;
  let duplicateFindings = 0;
  let severityMismatches = 0;
  const fpByGroup: Record<string, { total: number; avoided: number }> = {};
  const byCategory: Record<string, { tp: number; tn: number; fp: number; fn: number }> = {};

  const seenFindings = new Set<string>();

  for (const m of matches) {
    switch (m.classification) {
      case 'TP': tp++; break;
      case 'TN': tn++; break;
      case 'FP': fp++; break;
      case 'FN': fn++; break;
    }

    if (m.fp_id) {
      if (!fpByGroup[m.fp_id]) fpByGroup[m.fp_id] = { total: 0, avoided: 0 };
      fpByGroup[m.fp_id].total++;
      if (m.classification === 'TN') fpByGroup[m.fp_id].avoided++;
    }

    // Cascade detection: FP-00 scenarios where a single weak signal spawns multiple findings
    if (m.fp_id === 'FP-00' && m.classification === 'FP' && m.matched_findings.length > 1) {
      cascadeViolations++;
    }

    // Duplicate detection: same finding title matched to multiple scenarios
    for (const f of m.matched_findings) {
      const key = `${f.title}::${f.target_url || f.target_path || ''}`;
      if (seenFindings.has(key)) {
        duplicateFindings++;
      }
      seenFindings.add(key);
    }

    // Severity mismatch: finding matched a TP but with wrong severity
    if (m.classification === 'TP' && m.matched_findings.length > 0) {
      const expectedSeverity = m.expected_severity;
      if (expectedSeverity) {
        const hasMismatch = m.matched_findings.some(
          f => f.severity && f.severity.toLowerCase() !== expectedSeverity.toLowerCase()
        );
        if (hasMismatch) severityMismatches++;
      }
    }

    const cat = m.scenario_type;
    if (!byCategory[cat]) byCategory[cat] = { tp: 0, tn: 0, fp: 0, fn: 0 };
    byCategory[cat][m.classification.toLowerCase() as 'tp' | 'tn' | 'fp' | 'fn']++;
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1_score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

  const totalFpTraps = Object.values(fpByGroup).reduce((s, g) => s + g.total, 0);
  const avoidedFpTraps = Object.values(fpByGroup).reduce((s, g) => s + g.avoided, 0);
  const fp_avoidance_rate = totalFpTraps > 0 ? avoidedFpTraps / totalFpTraps : 1;

  const points =
    tp * scoring.true_positive_points +
    tn * scoring.true_negative_points +
    fp * scoring.false_positive_penalty +
    fn * scoring.false_negative_penalty +
    cascadeViolations * scoring.cascade_penalty +
    duplicateFindings * scoring.duplicate_penalty +
    severityMismatches * scoring.severity_mismatch_penalty;

  const max_points =
    (tp + fn) * scoring.true_positive_points +
    (tn + fp) * scoring.true_negative_points;

  const fp_breakdown: ScoreResult['fp_breakdown'] = {};
  for (const [id, g] of Object.entries(fpByGroup)) {
    fp_breakdown[id] = {
      total: g.total,
      avoided: g.avoided,
      rate: g.total > 0 ? g.avoided / g.total : 1,
    };
  }

  return {
    total_scenarios: matches.length,
    true_positives: tp,
    true_negatives: tn,
    false_positives: fp,
    false_negatives: fn,
    cascade_violations: cascadeViolations,
    duplicate_findings: duplicateFindings,
    severity_mismatches: severityMismatches,
    precision: round4(precision),
    recall: round4(recall),
    f1_score: round4(f1_score),
    fp_avoidance_rate: round4(fp_avoidance_rate),
    fp_breakdown,
    category_breakdown: byCategory,
    points,
    max_points,
    percentage: max_points > 0 ? round4(points / max_points) : 0,
    details: matches,
  };
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
