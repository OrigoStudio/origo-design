export interface ValidationError {
  type: string;
  message: string;
  path?: string;
}

export type ASTErrorType =
  | 'CONTRACT_BREACH'
  | 'INVALID_PERMISSION'
  | 'UNSECURED_CAPABILITY'
  | 'MISSING_MANIFEST_VERSION'
  | 'VERSION_MISMATCH';

export class ASTValidationError extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[], message = 'AST Validation Failed') {
    const detailedMessage =
      errors.length > 0 ? `${message}: ${errors.map(e => e.message).join(' | ')}` : message;
    super(detailedMessage);
    this.name = 'ASTValidationError';
    this.errors = errors;

    // Fix prototype chain for instanceof when extending built-in Error in TS
    Object.setPrototypeOf(this, ASTValidationError.prototype);
  }
}
