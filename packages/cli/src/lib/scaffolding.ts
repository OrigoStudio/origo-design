import * as fs from 'fs/promises';
import * as path from 'path';
import { CliError } from '../utils/errors';
import { generateOrigoConfig } from '../templates';

export interface ScaffoldOptions {
  json?: boolean;
  cwd?: string;
}

export async function scaffoldProject(
  projectName: string,
  options: ScaffoldOptions = {}
): Promise<void> {
  // Guard against path traversal, empty input, or invalid directory names
  if (
    !projectName ||
    path.basename(projectName) !== projectName ||
    !/^[a-zA-Z0-9_.-]+$/.test(projectName)
  ) {
    throw new CliError({
      code: 'ERR_INVALID_PROJECT_NAME',
      message: `Invalid project name "${projectName}". Project name must be a single directory name without path traversal characters.`,
      context: { projectName },
    });
  }

  const baseDir = options.cwd ? path.resolve(options.cwd) : process.cwd();
  const targetDir = path.resolve(baseDir, projectName);

  // Check if directory already exists asynchronously
  try {
    await fs.access(targetDir);
    throw new CliError({
      code: 'EEXIST',
      message: `Directory ${projectName} already exists.`,
      context: { path: targetDir },
    });
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }
    const isEnoent =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'ENOENT';
    if (!isEnoent) {
      throw new CliError({
        code: 'SCAFFOLD_ERROR',
        message: `Failed to inspect target directory: ${error instanceof Error ? error.message : String(error)}`,
        context: { targetDir },
        cause: error,
      });
    }
  }

  try {
    const schemasDir = path.join(targetDir, 'schemas');
    const configFile = path.join(targetDir, 'origo.json');

    await fs.mkdir(targetDir, { recursive: true });
    await fs.mkdir(schemasDir, { recursive: true });

    // Sourced directly from secure-by-default templates built in Story 5.5.5
    const configContent = generateOrigoConfig({
      version: '1.0',
      build: { outDir: './dist' },
      schemas: './schemas',
    });

    await fs.writeFile(configFile, configContent, 'utf-8');

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            status: 'success',
            data: {
              projectName,
              targetDir,
              configFile,
              schemasDir,
            },
          },
          null,
          2
        )
      );
    } else {
      console.log(`Successfully initialized Origo project in ${targetDir}`);
    }
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }
    throw new CliError({
      code: 'SCAFFOLD_ERROR',
      message: `Failed to scaffold project: ${error instanceof Error ? error.message : String(error)}`,
      context: { projectName, targetDir, error },
      cause: error,
    });
  }
}
