import { Command } from 'commander';
import { scaffoldProject } from '../lib/scaffolding';
import { handleError } from '../utils/errors';

export function initCommand(): Command {
  const init = new Command('init')
    .description('Initialize a new Origo project (alias for origo new)')
    .argument('<project-name>', 'Name of the project to initialize')
    .option('--json', 'Output machine-readable JSON format')
    .action(async (projectName: string, options: { json?: boolean }) => {
      try {
        await initializeProject(projectName, process.cwd(), options);
      } catch (error) {
        handleError(error, { json: options.json });
      }
    });

  return init;
}

export async function initializeProject(
  projectName: string,
  targetPath: string = process.cwd(),
  options: { json?: boolean } = {}
): Promise<void> {
  // Delegate directly to scaffoldProject to maintain single source of truth for scaffolding
  await scaffoldProject(projectName, { ...options, cwd: targetPath });
}
