import type { ScoreResult } from './types.js';

export function generateTextReport(result: ScoreResult): string {
  const lines: string[] = [];
  const hr = '═'.repeat(70);
  const divider = '─'.repeat(70);

  lines.push(hr);
  lines.push('  SOLTRISK BENCHMARK REPORT');
  lines.push(hr);
  lines.push('');

  lines.push('  OVERALL SCORE');
  lines.push(divider);
  lines.push(`  Points:              ${result.points} / ${result.max_points} (${pct(result.percentage)})`);
  lines.push(`  Precision:           ${pct(result.precision)}`);
  lines.push(`  Recall:              ${pct(result.recall)}`);
  lines.push(`  F1 Score:            ${pct(result.f1_score)}`);
  lines.push(`  FP Avoidance Rate:   ${pct(result.fp_avoidance_rate)}`);
  lines.push('');

  lines.push('  CONFUSION MATRIX');
  lines.push(divider);
  lines.push(`  True Positives:      ${result.true_positives}`);
  lines.push(`  True Negatives:      ${result.true_negatives}`);
  lines.push(`  False Positives:     ${result.false_positives}`);
  lines.push(`  False Negatives:     ${result.false_negatives}`);
  lines.push(`  Total Scenarios:     ${result.total_scenarios}`);
  lines.push('');

  if (result.cascade_violations || result.duplicate_findings || result.severity_mismatches) {
    lines.push('  PENALTIES');
    lines.push(divider);
    if (result.cascade_violations) lines.push(`  Cascade violations:  ${result.cascade_violations}`);
    if (result.duplicate_findings) lines.push(`  Duplicate findings:  ${result.duplicate_findings}`);
    if (result.severity_mismatches) lines.push(`  Severity mismatches: ${result.severity_mismatches}`);
    lines.push('');
  }

  lines.push('  CATEGORY BREAKDOWN');
  lines.push(divider);
  for (const [cat, nums] of Object.entries(result.category_breakdown)) {
    lines.push(`  ${cat}:`);
    lines.push(`    TP=${nums.tp}  TN=${nums.tn}  FP=${nums.fp}  FN=${nums.fn}`);
  }
  lines.push('');

  lines.push('  FALSE POSITIVE AVOIDANCE BY FP-ID');
  lines.push(divider);

  const fpEntries = Object.entries(result.fp_breakdown)
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));

  for (const [fpId, data] of fpEntries) {
    const status = data.rate === 1 ? ' PASS' : data.rate === 0 ? ' FAIL' : ' PARTIAL';
    lines.push(`  ${fpId.padEnd(10)} ${data.avoided}/${data.total} avoided (${pct(data.rate)})${status}`);
  }
  lines.push('');

  const fps = result.details.filter(d => d.classification === 'FP');
  if (fps.length > 0) {
    lines.push('  FALSE POSITIVES (ERRORS)');
    lines.push(divider);
    for (const fp of fps) {
      lines.push(`  [${fp.scenario_id}]`);
      if (fp.notes) lines.push(`    Reason: ${fp.notes}`);
      if (fp.matched_findings.length > 0) {
        lines.push(`    Incorrect findings: ${fp.matched_findings.map(f => f.title).join(', ')}`);
      }
    }
    lines.push('');
  }

  const fns = result.details.filter(d => d.classification === 'FN');
  if (fns.length > 0) {
    lines.push('  FALSE NEGATIVES (MISSED)');
    lines.push(divider);
    for (const fn of fns) {
      lines.push(`  [${fn.scenario_id}] ${fn.notes || ''}`);
    }
    lines.push('');
  }

  lines.push(hr);
  return lines.join('\n');
}

export function generateJsonReport(result: ScoreResult): string {
  return JSON.stringify({
    summary: {
      points: result.points,
      max_points: result.max_points,
      percentage: result.percentage,
      precision: result.precision,
      recall: result.recall,
      f1_score: result.f1_score,
      fp_avoidance_rate: result.fp_avoidance_rate,
      confusion_matrix: {
        true_positives: result.true_positives,
        true_negatives: result.true_negatives,
        false_positives: result.false_positives,
        false_negatives: result.false_negatives,
      },
      penalties: {
        cascade_violations: result.cascade_violations,
        duplicate_findings: result.duplicate_findings,
        severity_mismatches: result.severity_mismatches,
      },
    },
    fp_breakdown: result.fp_breakdown,
    category_breakdown: result.category_breakdown,
    details: result.details.map(d => ({
      scenario_id: d.scenario_id,
      classification: d.classification,
      fp_id: d.fp_id,
      matched_count: d.matched_findings.length,
      notes: d.notes,
    })),
  }, null, 2);
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
