import { Command } from 'commander';
import { validateDirectory } from '../lib/validation';
import { handleError, CliError } from '../utils/errors';

export function validateCommand(): Command {
  const cmd = new Command('validate');

  cmd
    .description('Validate BADL schemas in a directory or file')
    .argument('[directory]', 'Directory or file containing BADL schemas to validate', './schemas')
    .option('--json', 'Output machine-readable JSON format')
    .action(async (directory: string, options: { json?: boolean }) => {
      try {
        const totalErrors = await validateDirectory(directory, { json: options.json });
        if (totalErrors > 0) {
          process.exit(1);
        }
      } catch (error: unknown) {
        if (options.json) {
          const code = error instanceof CliError ? error.code : 'UNKNOWN_ERROR';
          const message = error instanceof Error ? error.message : String(error);
          const jsonOutput = {
            status: 'error',
            data: {
              directory,
              filesValidated: 0,
              errorsFound: 1,
              results: [
                {
                  file: directory,
                  valid: false,
                  errors: [{ code, message }],
                },
              ],
            },
          };
          console.log(JSON.stringify(jsonOutput, null, 2));
          process.exit(1);
        } else {
          handleError(error, { json: false });
        }
      }
    });

  return cmd;
}
