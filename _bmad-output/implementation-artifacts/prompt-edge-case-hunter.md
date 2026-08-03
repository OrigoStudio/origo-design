Invoke the `bmad-review-edge-case-hunter` skill on this diff:

```diff
diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
index a15bb19..d0b777a 100644
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -47,3 +47,6 @@ jobs:
       - name: Check formatting
         run: npx nx format:check

+      - name: Run Performance Benchmark Harness (NFR-PERF-002)
+        run: npm run perf:benchmark
+
diff --git a/jest.config.ts b/jest.config.ts
index c6b9319..cd4ec89 100644
--- a/jest.config.ts
+++ b/jest.config.ts
@@ -7,4 +7,8 @@ export default {
       tsconfig: '<rootDir>/tsconfig.base.json',
     },
   ],
+  testMatch: [
+    '**/+(*.)+(spec|test).+(ts|js)?(x)',
+    '**/tools/benchmarks/**/*.+(spec|test).+(ts|js)?(x)',
+  ],
 };
diff --git a/package.json b/package.json
index f7fb8c6..736e676 100644
--- a/package.json
+++ b/package.json
@@ -6,7 +6,9 @@
     "build": "nx build",
     "test": "nx test",
     "lint": "nx lint",
-    "prepare": "husky"
+    "prepare": "husky",
+    "perf:benchmark": "ts-node tools/benchmarks/compare-baseline.ts",
+    "perf:test": "ts-node tools/benchmarks/run-tests.ts"
   },
   "private": true,
   "dependencies": {
diff --git a/tools/benchmarks/compare-baseline.ts b/tools/benchmarks/compare-baseline.ts
new file mode 100644
index 0000000..f6b52c0
--- /dev/null
+++ b/tools/benchmarks/compare-baseline.ts
@@ -0,0 +1,93 @@
+import * as fs from 'fs';
+import * as path from 'path';
+import { runPerformanceBenchmark, PerfMetrics } from './perf-runner';
+
+export interface EvaluationResult {
+  success: boolean;
+  reason: string;
+}
+
+export function evaluatePerformanceMetrics(
+  current: PerfMetrics,
+  baseline: PerfMetrics,
+  options: { maxRegressionPercent: number; maxSlaMs: number }
+): EvaluationResult {
+  // Rule 1: Hard SLA Ceiling
+  if (current.totalValidationMs > options.maxSlaMs) {
+    return {
+      success: false,
+      reason: `NFR-PERF-002 SLA ceiling exceeded: Validation took ${current.totalValidationMs}ms (Limit: ${options.maxSlaMs}ms for ${current.entityCount} entities)`,
+    };
+  }
+
+  // Rule 2: Relative Regression Threshold
+  const thresholdMs = baseline.avgValidationMs * (1 + options.maxRegressionPercent / 100);
+  if (current.avgValidationMs > thresholdMs) {
+    const regressionPercent = Math.round(
+      ((current.avgValidationMs - baseline.avgValidationMs) / baseline.avgValidationMs) * 100
+    );
+    return {
+      success: false,
+      reason: `Performance regression detected: ${regressionPercent}% slower than baseline. Current avg: ${current.avgValidationMs}ms, Baseline avg: ${baseline.avgValidationMs}ms, Threshold limit: ${options.maxRegressionPercent}%`,
+    };
+  }
+
+  return {
+    success: true,
+    reason: 'Performance metrics within acceptable thresholds.',
+  };
+}
+
+function executeCompareBaseline() {
+  console.log('🚀 Running BADL Validation Performance Benchmark Harness...');
+
+  const baselinePath = path.resolve(process.cwd(), '.perf-baseline.json');
+  let baseline: PerfMetrics | null = null;
+
+  if (fs.existsSync(baselinePath)) {
+    try {
+      baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
+    } catch (e) {
+      console.warn('⚠️ Could not read baseline file, generating a new one.');
+    }
+  }
+
+  const currentRun = runPerformanceBenchmark({
+    entityCount: 500,
+    iterations: 50,
+    saveBaseline: !baseline, // Save if baseline doesn't exist
+    baselinePath,
+  });
+
+  console.log('\n📊 Current Run Metrics:');
+  console.table(currentRun);
+
+  if (!baseline) {
+    console.log('\n✅ No previous baseline found. Baseline established. Passing pipeline.');
+    process.exit(0);
+  }
+
+  console.log('\n📈 Baseline Comparison:');
+  console.table(baseline);
+
+  const evaluation = evaluatePerformanceMetrics(currentRun, baseline, {
+    maxRegressionPercent: 15,
+    maxSlaMs: 30000,
+  });
+
+  if (evaluation.success) {
+    console.log(`\n✅ PASS: ${evaluation.reason}`);
+    // Update baseline if we are strictly better (optional, but good practice if improving)
+    if (currentRun.avgValidationMs < baseline.avgValidationMs) {
+       console.log('✨ Performance improved! You might want to update the baseline.');
+    }
+    process.exit(0);
+  } else {
+    console.error(`\n❌ FAIL: ${evaluation.reason}`);
+    process.exit(1);
+  }
+}
+
+// Run if executed directly
+if (require.main === module) {
+  executeCompareBaseline();
+}
diff --git a/tools/benchmarks/fixtures/heavy-ast-fixture.ts b/tools/benchmarks/fixtures/heavy-ast-fixture.ts
new file mode 100644
index 0000000..f98e090
--- /dev/null
+++ b/tools/benchmarks/fixtures/heavy-ast-fixture.ts
@@ -0,0 +1,93 @@
+/**
+ * Generator for standardized, heavy-weight BADL AST payloads to evaluate
+ * NFR-PERF-002 validation compliance.
+ */
+
+// Represents a simplified subset of the canonical BADL AST
+export interface BadlAstPayload {
+  schemaVersion: string;
+  entities: Array<{
+    id: string;
+    name: string;
+    domain: string;
+    fields: Array<{
+      name: string;
+      type: string;
+      required: boolean;
+      metadata_path: string;
+      constraints?: Record<string, any>;
+    }>;
+    capabilities: Array<{
+      name: string;
+      type: string;
+    }>;
+  }>;
+}
+
+/**
+ * Generates a deterministic BADL AST payload of given entity count.
+ */
+export function generateHeavyAstFixture(entityCount = 500): BadlAstPayload {
+  const payload: BadlAstPayload = {
+    schemaVersion: '1.0.0',
+    entities: [],
+  };
+
+  for (let i = 0; i < entityCount; i++) {
+    const fields = [];
+    // Generate 20 fields per entity
+    for (let f = 0; f < 20; f++) {
+      fields.push({
+        name: `field_${i}_${f}`,
+        type: f % 2 === 0 ? 'string' : 'number',
+        required: f % 3 === 0,
+        metadata_path: `/metadata/domain/entity_${i}/field_${f}`,
+        constraints: {
+          minLength: f % 5,
+          maxLength: 100 + f,
+          pattern: '^[a-zA-Z0-9_]+$',
+        },
+      });
+    }
+
+    const capabilities = [];
+    // Generate 5 capabilities per entity
+    for (let c = 0; c < 5; c++) {
+      capabilities.push({
+        name: `capability_${i}_${c}`,
+        type: c % 2 === 0 ? 'READ' : 'WRITE',
+      });
+    }
+
+    payload.entities.push({
+      id: `entity_uuid_${i}`,
+      name: `EntityModel${i}`,
+      domain: `CoreDomain${i % 10}`,
+      fields,
+      capabilities,
+    });
+  }
+
+  return payload;
+}
+
+/**
+ * Helper to count total approximate nodes in the AST to verify complexity.
+ */
+export function countAstNodes(payload: BadlAstPayload): number {
+  let count = 1; // Root node
+  for (const entity of payload.entities) {
+    count += 1; // Entity node
+    for (const field of entity.fields) {
+      count += 1; // Field node
+      if (field.constraints) {
+        count += Object.keys(field.constraints).length;
+      }
+    }
+    for (const cap of entity.capabilities) {
+      count += 1; // Capability node
+    }
+  }
+  return count;
+}
diff --git a/tools/benchmarks/perf-runner.ts b/tools/benchmarks/perf-runner.ts
new file mode 100644
index 0000000..a451f58
--- /dev/null
+++ b/tools/benchmarks/perf-runner.ts
@@ -0,0 +1,111 @@
+import { performance } from 'perf_hooks';
+import * as fs from 'fs';
+import * as path from 'path';
+import {
+  generateHeavyAstFixture,
+  countAstNodes,
+  BadlAstPayload,
+} from './fixtures/heavy-ast-fixture';
+
+export interface PerfMetrics {
+  timestamp: string;
+  entityCount: number;
+  totalAstNodes: number;
+  iterations: number;
+  totalValidationMs: number;
+  avgValidationMs: number;
+  p50Ms: number;
+  p95Ms: number;
+  opsPerSec: number;
+  heapUsedMb: number;
+}
+
+export interface PerfOptions {
+  entityCount?: number;
+  iterations?: number;
+  saveBaseline?: boolean;
+  baselinePath?: string;
+}
+
+/**
+ * Simulates Ajv 8 / BADL AST validation pass against payload AST structure.
+ */
+function validateBadlAst(payload: BadlAstPayload): boolean {
+  if (!payload || payload.schemaVersion !== '1.0.0' || !Array.isArray(payload.entities)) {
+    return false;
+  }
+  for (const entity of payload.entities) {
+    if (!entity.id || !entity.name || !entity.domain || !Array.isArray(entity.fields)) {
+      return false;
+    }
+    for (const field of entity.fields) {
+      if (!field.name || !field.type || !field.metadata_path) {
+        return false;
+      }
+    }
+  }
+  return true;
+}
+
+/**
+ * Runs performance benchmark for BADL grammar validation (NFR-PERF-002).
+ */
+export function runPerformanceBenchmark(options: PerfOptions = {}): PerfMetrics {
+  const entityCount = options.entityCount ?? 500;
+  const iterations = options.iterations ?? 50;
+
+  const payload = generateHeavyAstFixture(entityCount);
+  const totalAstNodes = countAstNodes(payload);
+
+  const runDurations: number[] = [];
+
+  // Warmup runs (10 iterations) to let V8 JIT optimize execution path
+  for (let w = 0; w < 10; w++) {
+    validateBadlAst(payload);
+  }
+
+  const startTime = performance.now();
+
+  for (let i = 0; i < iterations; i++) {
+    const iterStart = performance.now();
+    const isValid = validateBadlAst(payload);
+    const iterEnd = performance.now();
+
+    if (!isValid) {
+      throw new Error('Benchmark payload validation failed: AST payload invalid');
+    }
+    runDurations.push(iterEnd - iterStart);
+  }
+
+  const endTime = performance.now();
+  const totalValidationMs = endTime - startTime;
+
+  // Calculate stats
+  runDurations.sort((a, b) => a - b);
+  const avgValidationMs = totalValidationMs / iterations;
+  const p50Ms = runDurations[Math.floor(runDurations.length * 0.5)] ?? avgValidationMs;
+  const p95Ms = runDurations[Math.floor(runDurations.length * 0.95)] ?? avgValidationMs;
+  const opsPerSec = (iterations / totalValidationMs) * 1000;
+  const heapUsedMb = Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
+
+  const metrics: PerfMetrics = {
+    timestamp: new Date().toISOString(),
+    entityCount,
+    totalAstNodes,
+    iterations,
+    totalValidationMs: Math.round(totalValidationMs * 100) / 100,
+    avgValidationMs: Math.round(avgValidationMs * 1000) / 1000,
+    p50Ms: Math.round(p50Ms * 1000) / 1000,
+    p95Ms: Math.round(p95Ms * 1000) / 1000,
+    opsPerSec: Math.round(opsPerSec * 100) / 100,
+    heapUsedMb,
+  };
+
+  if (options.saveBaseline) {
+    const baselineFile = options.baselinePath || path.resolve(process.cwd(), '.perf-baseline.json');
+    fs.writeFileSync(baselineFile, JSON.stringify(metrics, null, 2), 'utf-8');
+    console.log(`Saved benchmark baseline to ${baselineFile}`);
+  }
+
+  return metrics;
+}
diff --git a/tools/benchmarks/run-tests.ts b/tools/benchmarks/run-tests.ts
new file mode 100644
index 0000000..1ad1adf
--- /dev/null
+++ b/tools/benchmarks/run-tests.ts
@@ -0,0 +1,83 @@
+import { generateHeavyAstFixture, countAstNodes } from './fixtures/heavy-ast-fixture';
+import { runPerformanceBenchmark } from './perf-runner';
+import { evaluatePerformanceMetrics } from './compare-baseline';
+
+function runUnitTests() {
+  console.log('🧪 Running Benchmark Harness Self-Tests...');
+
+  // Test 1: Heavy AST Fixture
+  const fixture1 = generateHeavyAstFixture(500);
+  const fixture2 = generateHeavyAstFixture(500);
+
+  if (fixture1.schemaVersion !== '1.0.0' || fixture1.entities.length !== 500) {
+    throw new Error('Test failed: Fixture schemaVersion or entity count mismatch');
+  }
+
+  if (JSON.stringify(fixture1) !== JSON.stringify(fixture2)) {
+    throw new Error('Test failed: Fixture generation is non-deterministic');
+  }
+
+  const nodeCount = countAstNodes(fixture1);
+  if (nodeCount < 10000) {
+    throw new Error(`Test failed: Expected >= 10,000 AST nodes, got ${nodeCount}`);
+  }
+  console.log(`  ✓ Heavy AST Fixture generator verified (500 entities, ${nodeCount} AST nodes)`);
+
+  // Test 2: Perf Runner Execution
+  const metrics = runPerformanceBenchmark({ entityCount: 50, iterations: 10 });
+  if (metrics.entityCount !== 50 || metrics.iterations !== 10 || metrics.avgValidationMs <= 0) {
+    throw new Error('Test failed: Performance runner metrics invalid');
+  }
+  console.log(
+    `  ✓ Performance runner metrics collection verified (${metrics.avgValidationMs} ms/iter)`
+  );
+
+  // Test 3: Evaluation Gate (Success Case)
+  const baseline = {
+    timestamp: new Date().toISOString(),
+    entityCount: 500,
+    totalAstNodes: 10000,
+    iterations: 50,
+    totalValidationMs: 100,
+    avgValidationMs: 2.0,
+    p50Ms: 2.0,
+    p95Ms: 2.5,
+    opsPerSec: 500,
+    heapUsedMb: 50,
+  };
+
+  const passResult = evaluatePerformanceMetrics({ ...baseline, avgValidationMs: 2.1 }, baseline, {
+    maxRegressionPercent: 15,
+    maxSlaMs: 30000,
+  });
+  if (!passResult.success) {
+    throw new Error('Test failed: Evaluation gate failed valid test case');
+  }
+
+  // Test 4: Evaluation Gate (Regression Failure)
+  const failResult = evaluatePerformanceMetrics({ ...baseline, avgValidationMs: 2.8 }, baseline, {
+    maxRegressionPercent: 15,
+    maxSlaMs: 30000,
+  });
+  if (failResult.success) {
+    throw new Error('Test failed: Evaluation gate missed regression failure case');
+  }
+
+  // Test 5: Evaluation Gate (SLA Ceiling Failure)
+  const slaFailResult = evaluatePerformanceMetrics(
+    { ...baseline, totalValidationMs: 35000 },
+    baseline,
+    {
+      maxRegressionPercent: 15,
+      maxSlaMs: 30000,
+    }
+  );
+  if (slaFailResult.success) {
+    throw new Error('Test failed: Evaluation gate missed SLA ceiling breach');
+  }
+  console.log('  ✓ Baseline comparison & SLA gate evaluation logic verified');
+
+  console.log('✅ ALL BENCHMARK HARNESS UNIT TESTS PASSED!');
+}
+
+runUnitTests();
diff --git a/tsconfig.base.json b/tsconfig.base.json
index 976ea74..8834cc0 100644
--- a/tsconfig.base.json
+++ b/tsconfig.base.json
@@ -11,10 +11,17 @@
     "target": "es2022",
     "module": "es2022",
     "lib": ["es2022", "dom"],
+    "types": ["node"],
     "skipLibCheck": true,
     "skipDefaultLibCheck": true,
     "baseUrl": ".",
-    "paths": {}
+    "paths": {},
+    "ignoreDeprecations": "6.0"
   },
-  "exclude": ["node_modules", "tmp", "dist", ".nx/cache"]
+  "exclude": ["node_modules", "tmp", "dist", ".nx/cache"],
+  "ts-node": {
+    "compilerOptions": {
+      "module": "commonjs"
+    }
+  }
 }
```
