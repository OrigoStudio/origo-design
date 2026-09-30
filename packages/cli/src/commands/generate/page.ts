import { Command, Option } from 'commander';
import { generatePage } from '../../lib/generator';
import { handleError } from '../../utils/errors';

export function pageCommand(): Command {
  const cmd = new Command('page');
  cmd
    .description('Generate a BADL page boilerplate from a named template')
    .addOption(
      new Option('--template <name>', 'Template name')
        .choices(['list-detail', 'login'])
        .makeOptionMandatory(true)
    )
    .argument('<name>', 'Output schema name (PascalCase, e.g. UserListDetail)')
    .option('--force', 'Overwrite existing file if it exists')
    .option('--json', 'Output machine-readable JSON format')
    .action(
      async (name: string, options: { template: string; force?: boolean; json?: boolean }) => {
        try {
          await generatePage(options.template, name, { force: options.force, json: options.json });
        } catch (error: unknown) {
          handleError(error, { json: options.json });
        }
      }
    );
  return cmd;
}
