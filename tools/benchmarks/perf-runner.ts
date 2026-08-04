import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';
import * as v8 from 'v8';
import Ajv from 'ajv';
import { generateHeavyAstFixture, countAstNodes } from './fixtures/heavy-ast-fixture';

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
  schemaCompileMs?: number;
}

export interface PerfOptions {
  entityCount?: number;
  iterations?: number;
  saveBaseline?: boolean;
  baselinePath?: string;
}

// TODO: Replace this hardcoded schema with import from @origo/core once AD-3 is fully unblocked
const BADL_SCHEMA = {
  type: 'object',
  properties: {
    schemaVersion: { type: 'string' },
    application: { type: 'string' },
    generatedAt: { type: 'string' },
    entities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          domain: { type: 'string' },
          description: { type: 'string' },
          fields: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                label: { type: 'string' },
                required: { type: 'boolean' },
                metadata_path: { type: 'string' },
                validation: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      rule: { type: 'string' },
                      value: { type: ['string', 'number'] },
                    },
                    required: ['rule'],
                  },
                },
              },
              required: ['name', 'type', 'label', 'required', 'metadata_path'],
            },
          },
          capabilities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                type: { type: 'string' },
                async: { type: 'boolean' },
                preconditions: { type: 'array', items: { type: 'string' } },
                postconditions: { type: 'array', items: { type: 'string' } },
                permissions: { type: 'array', items: { type: 'string' } },
              },
              required: [
                'id',
                'name',
                'type',
                'async',
                'preconditions',
                'postconditions',
                'permissions',
              ],
            },
          },
          contracts: { type: 'array', items: { type: 'string' } },
        },
        required: ['id', 'name', 'domain', 'description', 'fields', 'capabilities', 'contracts'],
      },
    },
  },
  required: ['schemaVersion', 'application', 'generatedAt', 'entities'],
};

/**
 * Runs performance benchmark for BADL grammar validation (NFR-PERF-002).
 */
export function runPerformanceBenchmark(options: PerfOptions = {}): PerfMetrics {
  const entityCount = options.entityCount ?? 500;
  const iterations = options.iterations ?? 50;

  const payload = generateHeavyAstFixture(entityCount);
  const totalAstNodes = countAstNodes(payload);

  const ajv = new Ajv();

  const compileStart = performance.now();
  const validate = ajv.compile(BADL_SCHEMA);
  const schemaCompileMs = performance.now() - compileStart;

  const runDurations: number[] = [];

  // Warmup runs (10 iterations) to let V8 JIT optimize execution path
  for (let w = 0; w < 10; w++) {
    validate(payload);
  }

  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    const iterStart = performance.now();
    const isValid = validate(payload);
    const iterEnd = performance.now();

    if (!isValid) {
      throw new Error(
        `Benchmark payload validation failed: AST payload invalid. ${JSON.stringify(validate.errors)}`
      );
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
  const heapUsedMb = Math.round((v8.getHeapStatistics().used_heap_size / 1024 / 1024) * 100) / 100;

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
    schemaCompileMs: Math.round(schemaCompileMs * 100) / 100,
  };

  if (options.saveBaseline) {
    const baselineFile = options.baselinePath || path.resolve(process.cwd(), '.perf-baseline.json');
    fs.writeFileSync(baselineFile, JSON.stringify(metrics, null, 2), 'utf-8');
    console.log(`Saved benchmark baseline to ${baselineFile}`);
  }

  return metrics;
}
