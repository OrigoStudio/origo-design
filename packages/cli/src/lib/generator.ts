import * as fs from 'fs/promises';
import * as path from 'path';
import { CliError } from '../utils/errors';
import { generateEntityTemplate } from '../templates';

export async function generateEntity(
  name: string,
  options: { force?: boolean; json?: boolean }
): Promise<void> {
  const targetDir = path.join(process.cwd(), 'schemas');
  const targetPath = path.join(targetDir, name.toLowerCase() + '.json');
  const userTemplatePath = path.join(process.cwd(), '.origo', 'templates', 'entity.json');
  let content: string;

  try {
    await fs.access(targetPath);
    if (!options.force) {
      throw new CliError({
        code: 'ERR_FILE_EXISTS',
        message: `File already exists: ${targetPath}. Use --force to overwrite.`,
        context: { path: targetPath },
      });
    }
  } catch (error: unknown) {
    if (error instanceof CliError) throw error;
  }

  try {
    const rawTemplate = await fs.readFile(userTemplatePath, 'utf-8');
    content =
      rawTemplate.replace(/\{\{name\}\}/g, name).replace(/\{\{id\}\}/g, name.toLowerCase()) + '\n';
  } catch {
    content = generateEntityTemplate({ id: name.toLowerCase(), name });
  }

  try {
    await fs.mkdir(targetDir, { recursive: true });
  } catch {
    // ignore if directory exists
  }

  await fs.writeFile(targetPath, content, 'utf-8');

  if (options.json) {
    console.log(
      JSON.stringify({
        status: 'success',
        data: {
          file: `./schemas/${name.toLowerCase()}.json`,
          entityName: name,
        },
      })
    );
  }
}

export async function ejectTemplates(options: { json?: boolean }): Promise<void> {
  const destDir = path.join(process.cwd(), '.origo', 'templates');
  const srcDir = path.resolve(__dirname, '../templates');

  await fs.mkdir(destDir, { recursive: true });

  const files = await fs.readdir(srcDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  for (const file of jsonFiles) {
    await fs.copyFile(path.join(srcDir, file), path.join(destDir, file));
  }

  if (options.json) {
    console.log(
      JSON.stringify({
        status: 'success',
        data: {
          destination: '.origo/templates',
          filesEjected: jsonFiles,
        },
      })
    );
  }
}
