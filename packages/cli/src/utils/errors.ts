export interface OrigoCliError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

export class CliError extends Error {
  public code: string;
  public context?: Record<string, unknown>;

  constructor(error: OrigoCliError) {
    super(error.message);
    this.name = 'CliError';
    this.code = error.code;
    this.context = error.context;
  }
}

export function handleError(error: unknown): void {
  if (error instanceof CliError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    if (error.context) {
      console.error(JSON.stringify(error.context, null, 2));
    }
    process.exit(1);
  } else if (error instanceof Error) {
    console.error(`Unexpected Error: ${error.message}`);
    process.exit(1);
  } else {
    console.error('An unknown error occurred.');
    process.exit(1);
  }
}
