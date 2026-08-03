import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';
import {
  generateHeavyAstFixture,
  countAstNodes,
  BadlAstPayload,
} from './fixtures/heavy-ast-fixture';

export interface PerfMetrics {
  timestamp: string;
  entityCount: number;
  totalAstNodes: number;
  iterations: number;
  totalValidationMs: number;
  avgValidationMs: number;
  p50Ms: number;
  p95Ms: number;
  opsPerSec: number;
  heapUsedMb: number;
}

export interface PerfOptions {
  entityCount?: number;
  iterations?: number;
  saveBaseline?: boolean;
  baselinePath?: string;
}

/**
 * Simulates Ajv 8 / BADL AST validation pass against payload AST structure.
 */
function validateBadlAst(payload: BadlAstPayload): boolean {
  if (!payload || payload.schemaVersion !== '1.0.0' || !Array.isArray(payload.entities)) {
    return false;
  }
  for (const entity of payload.entities) {
    if (!entity.id || !entity.name || !entity.domain || !Array.isArray(entity.fields)) {
      return false;
    }
    for (const field of entity.fields) {
      if (!field.name || !field.type || !field.metadata_path) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Runs performance benchmark for BADL grammar validation (NFR-PERF-002).
 */
export function runPerformanceBenchmark(options: PerfOptions = {}): PerfMetrics {
  const entityCount = options.entityCount ?? 500;
  const iterations = options.iterations ?? 50;

  const payload = generateHeavyAstFixture(entityCount);
  const totalAstNodes = countAstNodes(payload);

  const runDurations: number[] = [];

  // Warmup runs (10 iterations) to let V8 JIT optimize execution path
  for (let w = 0; w < 10; w++) {
    validateBadlAst(payload);
  }

  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    const iterStart = performance.now();
    const isValid = validateBadlAst(payload);
    const iterEnd = performance.now();

    if (!isValid) {
      throw new Error('Benchmark payload validation failed: AST payload invalid');
    }
    runDurations.push(iterEnd - iterStart);
  }

  const endTime = performance.now();
  const totalValidationMs = endTime - startTime;

  // Calculate stats
  runDurations.sort((a, b) => a - b);
  const avgValidationMs = totalValidationMs / iterations;
  const p50Ms = runDurations[Math.floor(runDurations.length * 0.5)] ?? avgValidationMs;
  const p95Ms = runDurations[Math.floor(runDurations.length * 0.95)] ?? avgValidationMs;
  const opsPerSec = (iterations / totalValidationMs) * 1000;
  const heapUsedMb = Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;

  const metrics: PerfMetrics = {
    timestamp: new Date().toISOString(),
    entityCount,
    totalAstNodes,
    iterations,
    totalValidationMs: Math.round(totalValidationMs * 100) / 100,
    avgValidationMs: Math.round(avgValidationMs * 1000) / 1000,
    p50Ms: Math.round(p50Ms * 1000) / 1000,
    p95Ms: Math.round(p95Ms * 1000) / 1000,
    opsPerSec: Math.round(opsPerSec * 100) / 100,
    heapUsedMb,
  };

  if (options.saveBaseline) {
    const baselineFile = options.baselinePath || path.resolve(process.cwd(), '.perf-baseline.json');
    fs.writeFileSync(baselineFile, JSON.stringify(metrics, null, 2), 'utf-8');
    console.log(`Saved benchmark baseline to ${baselineFile}`);
  }

  return metrics;
}
