import * as fs from 'fs';
import * as path from 'path';
import { PerfMetrics, runPerformanceBenchmark } from './perf-runner';

export interface EvaluationOptions {
  maxRegressionPercent?: number; // Default 15%
  maxSlaMs?: number; // Default 30,000ms (30 seconds for NFR-PERF-002)
}

export interface EvaluationResult {
  success: boolean;
  regressionPercent: number;
  reason?: string;
}

/**
 * Evaluates current benchmark metrics against baseline and SLA limits.
 */
export function evaluatePerformanceMetrics(
  current: PerfMetrics,
  baseline: PerfMetrics,
  options: EvaluationOptions = {}
): EvaluationResult {
  const maxRegressionPercent = options.maxRegressionPercent ?? 15;
  const maxSlaMs = options.maxSlaMs ?? 30000;

  // Check SLA Ceiling
  if (current.totalValidationMs > maxSlaMs) {
    return {
      success: false,
      regressionPercent:
        ((current.totalValidationMs - baseline.totalValidationMs) / baseline.totalValidationMs) *
        100,
      reason: `NFR-PERF-002 SLA ceiling exceeded: total validation time ${current.totalValidationMs}ms > max SLA threshold ${maxSlaMs}ms`,
    };
  }

  // Calculate relative regression against baseline
  const regressionPercent =
    ((current.avgValidationMs - baseline.avgValidationMs) / baseline.avgValidationMs) * 100;

  if (regressionPercent > maxRegressionPercent) {
    return {
      success: false,
      regressionPercent: Math.round(regressionPercent * 100) / 100,
      reason: `Performance regression detected: ${Math.round(regressionPercent * 100) / 100}% increase in avg validation time exceeds baseline regression threshold (${maxRegressionPercent}%)`,
    };
  }

  return {
    success: true,
    regressionPercent: Math.round(regressionPercent * 100) / 100,
  };
}

/**
 * CLI execution entrypoint for performance benchmark gate.
 */
export function runBenchmarkGate(): void {
  const baselinePath = path.resolve(process.cwd(), '.perf-baseline.json');
  console.log('🚀 Running BADL Performance Benchmark Suite (NFR-PERF-002)...');

  const currentMetrics = runPerformanceBenchmark({ entityCount: 500, iterations: 50 });

  console.log('--------------------------------------------------');
  console.log(`Entities:         ${currentMetrics.entityCount}`);
  console.log(`Total AST Nodes:  ${currentMetrics.totalAstNodes}`);
  console.log(`Iterations:       ${currentMetrics.iterations}`);
  console.log(`Total Validation: ${currentMetrics.totalValidationMs} ms`);
  console.log(`Avg Validation:   ${currentMetrics.avgValidationMs} ms/iter`);
  console.log(`p50 Latency:      ${currentMetrics.p50Ms} ms`);
  console.log(`p95 Latency:      ${currentMetrics.p95Ms} ms`);
  console.log(`Throughput:       ${currentMetrics.opsPerSec} ops/sec`);
  console.log(`Heap Usage:       ${currentMetrics.heapUsedMb} MB`);
  console.log('--------------------------------------------------');

  if (!fs.existsSync(baselinePath)) {
    console.log(
      `ℹ️ No baseline file found at ${baselinePath}. Saving current run as initial baseline.`
    );
    fs.writeFileSync(baselinePath, JSON.stringify(currentMetrics, null, 2), 'utf-8');
    console.log('✅ Baseline established successfully.');
    process.exit(0);
  }

  const baselineMetrics: PerfMetrics = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
  console.log(
    `Baseline Avg Time: ${baselineMetrics.avgValidationMs} ms/iter (Recorded: ${baselineMetrics.timestamp})`
  );

  const evaluation = evaluatePerformanceMetrics(currentMetrics, baselineMetrics);

  if (!evaluation.success) {
    console.error(`❌ PERFORMANCE GATE FAILED: ${evaluation.reason}`);
    process.exit(1);
  }

  console.log(
    `✅ PERFORMANCE GATE PASSED: Delta = ${evaluation.regressionPercent}% (within SLA and regression bounds).`
  );
  process.exit(0);
}

// Run CLI directly if executed from command line
if (require.main === module) {
  runBenchmarkGate();
}
