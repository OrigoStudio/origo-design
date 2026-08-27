/**
 * Node Worker Threads Baseline Sanity Harness for Epic 7 Spike
 * NOTE: Node worker_threads are used here solely to verify that @origo/core execution
 * does not depend on browser DOM globals in a non-main-thread context.
 * Browser Web Worker CSP isolation must be validated via the HTTP browser harness (index.html / run-browser.js).
 */
import { Worker, isMainThread, parentPort } from 'worker_threads';
import { readFileSync } from 'fs';
import { join } from 'path';

if (isMainThread) {
  console.log('Starting Node worker thread baseline sanity test...');

  let execArgv: string[] = [];
  try {
    require.resolve('ts-node/register');
    execArgv = ['--require', 'ts-node/register'];
  } catch {
    console.warn(
      '[node-worker-harness] ts-node/register not found, running with standard execArgv'
    );
  }

  const worker = new Worker(__filename, { execArgv });

  worker.on('message', msg => {
    console.log('Worker Result:', msg);
    if (msg.status !== 'success') {
      console.error('Node worker harness FAILED:', msg);
      process.exit(1);
    }
    console.log('Node worker harness PASSED cleanly!');
  });

  worker.on('error', err => {
    console.error('Worker Error:', err);
    process.exit(1);
  });

  worker.on('exit', code => {
    if (code !== 0) {
      console.error('Worker exited with non-zero code:', code);
      process.exit(code);
    }
  });
} else {
  if (!parentPort) {
    console.error('parentPort is null; worker was not spawned via worker_threads');
    process.exit(1);
  }

  try {
    const { BADLValidator, validateAST } = require('../../../packages/core/src/index.ts');
    const fixturePath = join(
      __dirname,
      '../../../packages/core/src/schemas/__fixtures__/target-page.json'
    );
    const rawJson = readFileSync(fixturePath, 'utf8');

    const validator = new BADLValidator();
    const domainObj = JSON.parse(rawJson);
    const canonicalAst = {
      schemaVersion: '1.0.0',
      domains: [domainObj],
    };

    // Test BADLValidator
    const isDomainValid = validator.validateDomain(rawJson);
    const validatorErrors = validator.errors;

    // Test validateAST
    const astErrors = validateAST(canonicalAst);

    const isPassed = isDomainValid && Array.isArray(astErrors) && astErrors.length === 0;

    parentPort.postMessage({
      status: isPassed ? 'success' : 'validation_failed',
      validatorErrors,
      astErrors,
    });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    parentPort.postMessage({ status: 'error', error: error.message, stack: error.stack });
  }
}
