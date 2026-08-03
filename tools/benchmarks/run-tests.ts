import { generateHeavyAstFixture, countAstNodes } from './fixtures/heavy-ast-fixture';
import { runPerformanceBenchmark } from './perf-runner';
import { evaluatePerformanceMetrics } from './compare-baseline';

function runUnitTests() {
  console.log('🧪 Running Benchmark Harness Self-Tests...');

  // Test 1: Heavy AST Fixture
  const fixture1 = generateHeavyAstFixture(500);
  const fixture2 = generateHeavyAstFixture(500);

  if (fixture1.schemaVersion !== '1.0.0' || fixture1.entities.length !== 500) {
    throw new Error('Test failed: Fixture schemaVersion or entity count mismatch');
  }

  if (JSON.stringify(fixture1) !== JSON.stringify(fixture2)) {
    throw new Error('Test failed: Fixture generation is non-deterministic');
  }

  const nodeCount = countAstNodes(fixture1);
  if (nodeCount < 10000) {
    throw new Error(`Test failed: Expected >= 10,000 AST nodes, got ${nodeCount}`);
  }
  console.log(`  ✓ Heavy AST Fixture generator verified (500 entities, ${nodeCount} AST nodes)`);

  // Test 2: Perf Runner Execution
  const metrics = runPerformanceBenchmark({ entityCount: 50, iterations: 10 });
  if (metrics.entityCount !== 50 || metrics.iterations !== 10 || metrics.avgValidationMs <= 0) {
    throw new Error('Test failed: Performance runner metrics invalid');
  }
  console.log(
    `  ✓ Performance runner metrics collection verified (${metrics.avgValidationMs} ms/iter)`
  );

  // Test 3: Evaluation Gate (Success Case)
  const baseline = {
    timestamp: new Date().toISOString(),
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

  const passResult = evaluatePerformanceMetrics({ ...baseline, avgValidationMs: 2.1 }, baseline, {
    maxRegressionPercent: 15,
    maxSlaMs: 30000,
  });
  if (!passResult.success) {
    throw new Error('Test failed: Evaluation gate failed valid test case');
  }

  // Test 4: Evaluation Gate (Regression Failure)
  const failResult = evaluatePerformanceMetrics({ ...baseline, avgValidationMs: 2.8 }, baseline, {
    maxRegressionPercent: 15,
    maxSlaMs: 30000,
  });
  if (failResult.success) {
    throw new Error('Test failed: Evaluation gate missed regression failure case');
  }

  // Test 5: Evaluation Gate (SLA Ceiling Failure)
  const slaFailResult = evaluatePerformanceMetrics(
    { ...baseline, totalValidationMs: 35000 },
    baseline,
    {
      maxRegressionPercent: 15,
      maxSlaMs: 30000,
    }
  );
  if (slaFailResult.success) {
    throw new Error('Test failed: Evaluation gate missed SLA ceiling breach');
  }
  console.log('  ✓ Baseline comparison & SLA gate evaluation logic verified');

  console.log('✅ ALL BENCHMARK HARNESS UNIT TESTS PASSED!');
}

runUnitTests();
