import { Command } from 'commander';
import { entityCommand } from './entity';
import { ejectTemplates } from '../../lib/generator';
import { handleError } from '../../utils/errors';

export function generateCommand(): Command {
  const cmd = new Command('generate').description('Generate Origo artifacts');

  cmd.addCommand(entityCommand());

  cmd
    .option('--eject', 'Copy internal templates to .origo/templates/ for customization')
    .option('--json', 'Output machine-readable JSON format')
    .action(async (options: { eject?: boolean; json?: boolean }) => {
      if (options.eject) {
        try {
          await ejectTemplates({ json: options.json });
        } catch (error: unknown) {
          handleError(error, { json: options.json });
        }
      }
    });

  return cmd;
}
