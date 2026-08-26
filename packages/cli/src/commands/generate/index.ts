import { Command } from 'commander';
import { entityCommand } from './entity';
import { ejectTemplates } from '../../lib/generator';
import { handleError } from '../../utils/errors';

export function generateCommand(): Command {
  const cmd = new Command('generate').description('Generate Origo artifacts');

  cmd.addCommand(entityCommand());

  cmd
    .option('--eject', 'Copy internal templates to .origo/templates/ for customization')
    .option('--force', 'Overwrite existing templates if they exist')
    .option('--json', 'Output machine-readable JSON format')
    .action(async (options: { eject?: boolean; force?: boolean; json?: boolean }) => {
      if (options.eject) {
        try {
          await ejectTemplates({ force: options.force, json: options.json });
        } catch (error: unknown) {
          handleError(error, { json: options.json });
        }
      } else {
        cmd.outputHelp();
      }
    });

  return cmd;
}
