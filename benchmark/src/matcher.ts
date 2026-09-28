import type { GroundTruthScenario, AiFinding, MatchResult } from './types.js';

function normalizeUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
}

function fuzzyMatch(text: string, patterns: string[]): boolean {
  const lower = text.toLowerCase();
  return patterns.some(p => lower.includes(p.toLowerCase()));
}

function matchesFinding(scenario: GroundTruthScenario, finding: AiFinding): boolean {
  if (finding.target_url && scenario.target_url) {
    const findingUrl = normalizeUrl(finding.target_url);
    const scenarioUrl = normalizeUrl(scenario.target_url);
    if (findingUrl.includes(scenarioUrl) || scenarioUrl.includes(findingUrl)) {
      return true;
    }
  }

  if (finding.target_path && scenario.target_path) {
    if (finding.target_path === scenario.target_path) {
      return true;
    }
  }

  if (finding.target_service && scenario.target_service) {
    if (finding.target_service.toLowerCase() === scenario.target_service.toLowerCase()) {
      if (scenario.incorrect_findings && finding.title) {
        if (fuzzyMatch(finding.title, scenario.incorrect_findings)) {
          return true;
        }
      }
      if (scenario.correct_findings && finding.title) {
        if (fuzzyMatch(finding.title, scenario.correct_findings)) {
          return true;
        }
      }
    }
  }

  if (scenario.incorrect_findings && finding.title) {
    if (fuzzyMatch(finding.title, scenario.incorrect_findings)) {
      return true;
    }
  }

  if (scenario.tags && finding.technology) {
    const techLower = finding.technology.toLowerCase();
    if (scenario.tags.some(t => techLower.includes(t.toLowerCase()))) {
      if (scenario.incorrect_findings && finding.title) {
        if (fuzzyMatch(finding.title, scenario.incorrect_findings)) {
          return true;
        }
      }
    }
  }

  return false;
}

function isCorrectFinding(scenario: GroundTruthScenario, finding: AiFinding): boolean {
  if (!scenario.correct_findings || !finding.title) return false;
  return fuzzyMatch(finding.title, scenario.correct_findings);
}

export function matchScenarios(
  scenarios: GroundTruthScenario[],
  findings: AiFinding[]
): MatchResult[] {
  return scenarios.map(scenario => {
    const matched_findings = findings.filter(f => matchesFinding(scenario, f));
    const matched = matched_findings.length > 0;

    let classification: MatchResult['classification'];

    if (scenario.expected_finding) {
      classification = matched ? 'TP' : 'FN';
    } else {
      const hasIncorrectMatch = matched_findings.some(f => !isCorrectFinding(scenario, f));
      classification = hasIncorrectMatch ? 'FP' : 'TN';
    }

    return {
      scenario_id: scenario.id,
      scenario_type: scenario.type,
      expected_finding: scenario.expected_finding,
      expected_severity: scenario.severity,
      matched,
      matched_findings,
      classification,
      fp_id: scenario.fp_id,
      notes: classification === 'FP'
        ? scenario.fp_reasoning
        : classification === 'FN'
          ? `Missed: ${scenario.title}`
          : undefined,
    };
  });
}
