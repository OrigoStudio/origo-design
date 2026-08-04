import { runPerformanceBenchmark } from './perf-runner';
import { evaluatePerformanceMetrics } from './compare-baseline';

describe('Performance Benchmark Harness (NFR-PERF-002)', () => {
  it('should run benchmark suite and collect valid metrics', () => {
    const metrics = runPerformanceBenchmark({ entityCount: 50, iterations: 10 });

    expect(metrics.entityCount).toBe(50);
    expect(metrics.totalAstNodes).toBeGreaterThan(1000);
    expect(metrics.iterations).toBe(10);
    expect(metrics.totalValidationMs).toBeGreaterThan(0);
    expect(metrics.avgValidationMs).toBeGreaterThan(0);
    expect(metrics.p50Ms).toBeGreaterThanOrEqual(0);
    expect(metrics.p95Ms).toBeGreaterThanOrEqual(metrics.p50Ms);
    expect(metrics.heapUsedMb).toBeGreaterThan(0);
  });

  it('should pass performance gate when within SLA and baseline thresholds', () => {
    const baseline = {
      timestamp: '2026-07-31T00:00:00.000Z',
      entityCount: 500,
      totalAstNodes: 10000,
      iterations: 50,
      totalValidationMs: 100,
      avgValidationMs: 2.0,
      p50Ms: 2.0,
      p95Ms: 2.5,
      opsPerSec: 500,
      heapUsedMb: 50,
    };

    // Current run: 2.1ms (5% increase, within 15% threshold and under 30s SLA)
    const currentRun = { ...baseline, avgValidationMs: 2.1 };
    const result = evaluatePerformanceMetrics(currentRun, baseline, {
      maxRegressionPercent: 15,
      maxSlaMs: 30000,
    });

    expect(result.success).toBe(true);
    expect(result.regressionPercent).toBeCloseTo(5);
  });

  it('should fail performance gate when relative regression exceeds 15%', () => {
    const baseline = {
      timestamp: '2026-07-31T00:00:00.000Z',
      entityCount: 500,
      totalAstNodes: 10000,
      iterations: 50,
      totalValidationMs: 100,
      avgValidationMs: 2.0,
      p50Ms: 2.0,
      p95Ms: 2.5,
      opsPerSec: 500,
      heapUsedMb: 50,
    };

    // Current run: 2.5ms (25% increase, exceeds 15% threshold)
    const currentRun = { ...baseline, avgValidationMs: 2.5 };
    const result = evaluatePerformanceMetrics(currentRun, baseline, {
      maxRegressionPercent: 15,
      maxSlaMs: 30000,
    });

    expect(result.success).toBe(false);
    expect(result.reason).toContain('exceeds baseline regression threshold');
  });

  it('should fail performance gate when validation time exceeds 30s SLA', () => {
    const baseline = {
      timestamp: '2026-07-31T00:00:00.000Z',
      entityCount: 500,
      totalAstNodes: 10000,
      iterations: 50,
      totalValidationMs: 100,
      avgValidationMs: 2.0,
      p50Ms: 2.0,
      p95Ms: 2.5,
      opsPerSec: 500,
      heapUsedMb: 50,
    };

    // Current run: 35,000ms total validation time (exceeds 30,000ms SLA)
    const currentRun = { ...baseline, totalValidationMs: 35000, avgValidationMs: 700 };
    const result = evaluatePerformanceMetrics(currentRun, baseline, {
      maxRegressionPercent: 15,
      maxSlaMs: 30000,
    });

    expect(result.success).toBe(false);
    expect(result.reason).toContain('NFR-PERF-002 SLA ceiling exceeded');
  });
});
