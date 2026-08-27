import { Worker, isMainThread, parentPort } from 'worker_threads';
import { readFileSync } from 'fs';
import { join } from 'path';

if (isMainThread) {
  console.log('Starting worker thread...');
  const worker = new Worker(__filename, {
    // We need to use ts-node or similar in the worker if it loads TS files
    execArgv: ['--require', 'ts-node/register'],
  });
  worker.on('message', msg => {
    console.log('Worker Result:', msg);
  });
  worker.on('error', err => {
    console.error('Worker Error:', err);
  });
  worker.on('exit', code => {
    console.log('Worker exited with code', code);
  });
} else {
  // Inside worker
  try {
    const { BADLValidator, validateAST } = require('../../../packages/core/src/index.ts');
    const fixturePath = join(
      __dirname,
      '../../../packages/core/src/schemas/__fixtures__/target-page.json'
    );
    const rawJson = readFileSync(fixturePath, 'utf8');

    const validator = new BADLValidator();
    const domainObj = JSON.parse(rawJson);

    // Test BADLValidator
    const validatorErrors = validator.validateDomain(rawJson);

    // Test validateAST
    const astErrors = validateAST(domainObj);

    parentPort?.postMessage({
      status: 'success',
      validatorErrors,
      astErrors,
    });
  } catch (e: unknown) {
    const error = e as Error;
    parentPort?.postMessage({ status: 'error', error: error.message, stack: error.stack });
  }
}
