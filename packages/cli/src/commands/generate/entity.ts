import { Command } from 'commander';
import { generateEntity } from '../../lib/generator';
import { handleError } from '../../utils/errors';

export function entityCommand(): Command {
  const cmd = new Command('entity');
  cmd
    .description('Generate a new entity BADL schema')
    .argument('<name>', 'Entity name (PascalCase, e.g. User)')
    .option('--force', 'Overwrite existing file if it exists')
    .option('--json', 'Output machine-readable JSON format')
    .action(async (name: string, options: { force?: boolean; json?: boolean }) => {
      try {
        await generateEntity(name, { force: options.force, json: options.json });
      } catch (error: unknown) {
        handleError(error, { json: options.json });
      }
    });
  return cmd;
}
