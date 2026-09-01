export interface OrigoCliError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  cause?: unknown;
}

export class CliError extends Error {
  public code: string;
  public context?: Record<string, unknown>;

  constructor(error: OrigoCliError & { cause?: unknown }) {
    super(error.message, { cause: error.cause });
    this.name = 'CliError';
    this.code = error.code;
    this.context = error.context;
  }
}

export interface ErrorOptions {
  json?: boolean;
}

export function handleError(error: unknown, options: ErrorOptions = {}): void {
  if (options.json) {
    if (error instanceof CliError) {
      console.error(
        JSON.stringify(
          {
            error: {
              code: error.code,
              message: error.message,
              context: error.context,
            },
          },
          null,
          2
        )
      );
    } else if (error instanceof Error) {
      console.error(
        JSON.stringify(
          {
            error: {
              code: 'UNEXPECTED_ERROR',
              message: error.message,
            },
          },
          null,
          2
        )
      );
    } else {
      console.error(
        JSON.stringify(
          {
            error: {
              code: 'UNKNOWN_ERROR',
              message: String(error),
            },
          },
          null,
          2
        )
      );
    }
    return;
  }

  if (error instanceof CliError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    if (error.context) {
      console.error(JSON.stringify(error.context, null, 2));
    }
  } else if (error instanceof Error) {
    console.error(`Unexpected Error: ${error.message}`);
  } else {
    console.error('An unknown error occurred.');
  }
}
