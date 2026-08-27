import { BADLValidator, validateAST } from '../../../packages/core/src/index.ts';
// We'll bundle this with esbuild so it resolves TS and imports.
import targetPage from '../../../packages/core/src/schemas/__fixtures__/target-page.json';

try {
  const rawJson = JSON.stringify(targetPage);
  const validator = new BADLValidator();

  const validatorErrors = validator.validateDomain(rawJson);
  const astErrors = validateAST(targetPage);

  self.postMessage({
    status: 'success',
    validatorErrors,
    astErrors,
  });
} catch (e) {
  self.postMessage({
    status: 'error',
    error: e.message,
  });
}
