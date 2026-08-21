import { rm, mkdir } from 'fs/promises';
import { join } from 'path';
import { workspaceRoot } from '@nx/devkit';

export function getTmpProjectDir(workerIndex = 0): string {
  const baseDir = workspaceRoot || process.cwd();
  return join(baseDir, 'tmp', `e2e-project-${workerIndex}`);
}

export const TMP_PROJECT_DIR = getTmpProjectDir(0);

export async function setupTestEnvironment(targetDir: string = TMP_PROJECT_DIR) {
  // Ensure the directory is clean before the test starts
  await teardownTestEnvironment(targetDir);
  try {
    await mkdir(targetDir, { recursive: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Setup failed to create directory '${targetDir}': ${msg}`);
  }
}

export async function teardownTestEnvironment(targetDir: string = TMP_PROJECT_DIR) {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await rm(targetDir, { recursive: true, force: true });
      break;
    } catch (error: unknown) {
      const errCode = (error as { code?: string })?.code;
      if (errCode === 'ENOENT') {
        break;
      }
      if ((errCode === 'EBUSY' || errCode === 'EPERM') && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200 * attempt));
        continue;
      }
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to cleanup E2E temporary directory '${targetDir}':`, msg);
      break;
    }
  }
}
