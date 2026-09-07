import * as comlink from 'comlink';
import { BADLValidator, validateAST, CanonicalAST } from '@origo/core';

export interface CompilerError {
  type: string;
  message: string;
  line?: number;
  column?: number;
  path?: string;
}

export class CompilerWorker {
  public async compile(
    badlJson: string
  ): Promise<{ ast?: CanonicalAST; errors?: CompilerError[] }> {
    if (!badlJson || badlJson.trim() === '') {
      return { errors: [{ type: 'Syntax Error', message: 'Empty document' }] };
    }

    const validator = new BADLValidator();
    // Use validateDomain on the raw JSON string to leverage source map error reporting
    const isValid = validator.validateDomain(badlJson);

    if (!isValid && validator.errors) {
      const errors = validator.errors.map(err => ({
        type: 'Syntax Error',
        message: err.message || 'Validation error',
        line: err.context?.line,
        column: err.context?.column,
        path: err.instancePath,
      }));
      return { errors };
    }

    try {
      const parsed = JSON.parse(badlJson);
      // Ensure we have a CanonicalAST shape to pass to validateAST
      const ast: CanonicalAST = parsed.domains
        ? parsed
        : { schemaVersion: '1.0', domains: [parsed] };

      const semanticErrors = validateAST(ast);
      if (semanticErrors && semanticErrors.length > 0) {
        const errors = semanticErrors.map(err => ({
          type: 'Semantic Error',
          message: err.message,
          path: err.path,
          line: err.line,
          column: err.column,
        }));
        return { errors };
      }

      return { ast };
    } catch (err: unknown) {
      return { errors: [{ type: 'Syntax Error', message: (err as Error).message }] };
    }
  }
}

// @ts-expect-error worker context requires comlink injection
if (typeof importScripts === 'function') {
  comlink.expose(new CompilerWorker());
}
