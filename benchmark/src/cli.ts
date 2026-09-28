#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { Command } from 'commander';
import { getAdapter, listAdapters } from './adapters/index.js';
import { matchScenarios } from './matcher.js';
import { score } from './scorer.js';
import { generateTextReport, generateJsonReport } from './reporter.js';
import type { GroundTruth } from './types.js';

const GROUND_TRUTH_PATH = resolve(dirname(new URL(import.meta.url).pathname), '../../ground-truth/ground_truth.json');

const program = new Command()
  .name('soltrisk-benchmark')
  .description('Score AI pentester output against the Soltrisk benchmark')
  .version('1.0.0');

program
  .command('score')
  .description('Score an AI tool\'s output against the ground truth')
  .requiredOption('-i, --input <path>', 'Path to AI tool output file (JSON or JSONL)')
  .option('-a, --adapter <name>', 'Output format adapter', 'generic')
  .option('-g, --ground-truth <path>', 'Path to ground truth file', GROUND_TRUTH_PATH)
  .option('-o, --output <path>', 'Write JSON report to file')
  .option('--format <type>', 'Output format: text, json, both', 'text')
  .action((opts) => {
    try {
      const gt: GroundTruth = JSON.parse(readFileSync(resolve(opts.groundTruth), 'utf-8'));
      const raw = readFileSync(resolve(opts.input), 'utf-8');
      const adapter = getAdapter(opts.adapter);
      const aiOutput = adapter.parse(raw);

      console.log(`Parsed ${aiOutput.findings.length} findings from ${aiOutput.tool_name}`);

      const matches = matchScenarios(gt.scenarios, aiOutput.findings);
      const result = score(matches, gt.scoring);

      if (opts.format === 'text' || opts.format === 'both') {
        console.log(generateTextReport(result));
      }

      if (opts.format === 'json' || opts.format === 'both') {
        const json = generateJsonReport(result);
        if (opts.output) {
          mkdirSync(dirname(resolve(opts.output)), { recursive: true });
          writeFileSync(resolve(opts.output), json);
          console.log(`JSON report written to ${opts.output}`);
        } else {
          console.log(json);
        }
      }

      if (opts.output && opts.format === 'text') {
        const json = generateJsonReport(result);
        mkdirSync(dirname(resolve(opts.output)), { recursive: true });
        writeFileSync(resolve(opts.output), json);
        console.log(`Report written to ${opts.output}`);
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('adapters')
  .description('List available output format adapters')
  .action(() => {
    console.log('Available adapters:');
    for (const name of listAdapters()) {
      console.log(`  - ${name}`);
    }
  });

program
  .command('summary')
  .description('Show ground truth summary without scoring')
  .option('-g, --ground-truth <path>', 'Path to ground truth file', GROUND_TRUTH_PATH)
  .action((opts) => {
    const gt: GroundTruth = JSON.parse(readFileSync(resolve(opts.groundTruth), 'utf-8'));
    const scenarios = gt.scenarios;
    const fpTraps = scenarios.filter(s => s.type === 'false_positive_trap');
    const tps = scenarios.filter(s => s.expected_finding);
    const fpIds = new Set(fpTraps.map(s => s.fp_id).filter(Boolean));

    console.log('Soltrisk Benchmark Ground Truth Summary');
    console.log('─'.repeat(40));
    console.log(`Total scenarios:     ${scenarios.length}`);
    console.log(`True positive cases: ${tps.length}`);
    console.log(`FP trap cases:       ${fpTraps.length}`);
    console.log(`Unique FP IDs:       ${fpIds.size} (FP-00 to FP-${String(Math.max(...[...fpIds].map(id => parseInt(id!.split('-')[1])))).padStart(2, '0')})`);
    console.log('');
    console.log('FP coverage:');
    for (const fpId of [...fpIds].sort((a, b) => a!.localeCompare(b!, undefined, { numeric: true }))) {
      const count = fpTraps.filter(s => s.fp_id === fpId).length;
      console.log(`  ${fpId}: ${count} scenario${count > 1 ? 's' : ''}`);
    }
  });

program.parse();
