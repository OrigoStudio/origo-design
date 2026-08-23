import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CliError } from '../utils/errors';
import { generateOrigoConfig } from '../templates';

export function initCommand(): Command {
  const init = new Command('init')
    .description('Initialize a new Origo project')
    .argument('<project-name>', 'Name of the project to initialize')
    .action(async (projectName: string) => {
      await initializeProject(projectName);
    });

  return init;
}

export async function initializeProject(
  projectName: string,
  targetPath: string = process.cwd()
): Promise<void> {
  const projectDir = path.join(targetPath, projectName);
  const schemasDir = path.join(projectDir, 'schemas');
  const configFile = path.join(projectDir, 'origo.json');

  try {
    // Check if directory already exists
    try {
      await fs.access(projectDir);
      throw new CliError({
        code: 'ERR_DIR_EXISTS',
        message: `Directory ${projectName} already exists.`,
      });
    } catch (e) {
      if (e instanceof CliError) {
        throw e;
      }
      const isEnoent =
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        (e as { code?: string }).code === 'ENOENT';
      if (!isEnoent) {
        throw e;
      }
    }

    // Create project directories
    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(schemasDir, { recursive: true });

    // Create config file securely
    const configContent = generateOrigoConfig({
      build: { outDir: './dist' },
      schemas: './schemas',
    });

    await fs.writeFile(configFile, configContent, 'utf-8');

    console.log(`Successfully initialized Origo project in ${projectDir}`);
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new CliError({
      code: 'ERR_INIT_FAILED',
      message: `Failed to initialize project: ${errorMessage}`,
      context: { projectName, error },
    });
  }
}
