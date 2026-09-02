import { Command } from 'commander';
import { scaffoldProject } from '../lib/scaffolding';
import { handleError } from '../utils/errors';

export function newCommand(): Command {
  const cmd = new Command('new');

  cmd
    .description('Scaffold a new Origo project')
    .argument('<project-name>', 'Name of the project to scaffold')
    .option('--json', 'Output machine-readable JSON format')
    .action(async (projectName: string, options: { json?: boolean }) => {
      try {
        await scaffoldProject(projectName, { json: options.json });
      } catch (error) {
        handleError(error, { json: options.json });
        process.exitCode = 1;
      }
    });

  return cmd;
}
