import { BADLValidator, validateAST } from '../../../packages/core/src/index.ts';
import targetPage from '../../../packages/core/src/schemas/__fixtures__/target-page.json';

try {
  const rawJson = JSON.stringify(targetPage);
  const validator = new BADLValidator();

  const domainObj = typeof targetPage === 'string' ? JSON.parse(targetPage) : targetPage;
  const canonicalAst = {
    schemaVersion: '1.0.0',
    domains: [domainObj],
  };

  const isDomainValid = validator.validateDomain(rawJson);
  const validatorErrors = validator.errors;
  const astErrors = validateAST(canonicalAst);

  const isPassed = isDomainValid && Array.isArray(astErrors) && astErrors.length === 0;

  self.postMessage({
    status: isPassed ? 'success' : 'validation_failed',
    validatorErrors,
    astErrors,
  });
} catch (e) {
  const errorMessage = e instanceof Error ? e.message : String(e);
  self.postMessage({
    status: 'error',
    error: errorMessage,
  });
}
