import * as fs from 'fs/promises';
import * as path from 'path';
import { CliError } from '../utils/errors';
import { generateEntityTemplate } from '../templates';

// FR-AI-005 Extensibility: Plugin registry for future AI integration
export interface GeneratorPlugin {
  resolveTemplate?(entityName: string): Promise<string | null>;
  postGenerate?(context: { name: string; targetPath: string }): Promise<void>;
}
const plugins: GeneratorPlugin[] = [];
export function registerGeneratorPlugin(plugin: GeneratorPlugin) {
  plugins.push(plugin);
}

export async function generateEntity(
  name: string,
  options: { force?: boolean; json?: boolean }
): Promise<void> {
  if (!name || !name.trim()) {
    throw new CliError({ code: 'ERR_INVALID_NAME', message: 'Entity name must not be empty.' });
  }
  if (/[/\\]/.test(name)) {
    throw new CliError({
      code: 'ERR_INVALID_NAME',
      message: 'Entity name must not contain path separators.',
    });
  }

  const targetDir = path.join(process.cwd(), 'schemas');
  const targetPath = path.join(targetDir, name.toLowerCase() + '.json');
  const userTemplatePath = path.join(process.cwd(), '.origo', 'templates', 'entity.json');
  let content: string | null = null;

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
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  // FR-AI-005 Extensibility: Check plugins first
  for (const plugin of plugins) {
    if (plugin.resolveTemplate) {
      const resolved = await plugin.resolveTemplate(name);
      if (resolved) {
        content = resolved;
        break;
      }
    }
  }

  if (!content) {
    try {
      const rawTemplate = await fs.readFile(userTemplatePath, 'utf-8');
      content =
        rawTemplate.replace(/\{\{name\}\}/g, name).replace(/\{\{id\}\}/g, name.toLowerCase()) +
        '\n';
      // Validate user template output
      try {
        JSON.parse(content);
      } catch {
        throw new CliError({
          code: 'ERR_INVALID_TEMPLATE',
          message: `The user template at ${userTemplatePath} produced invalid JSON when substituted.`,
        });
      }
    } catch (err: unknown) {
      if (err instanceof CliError) throw err;
      const code = (err as NodeJS.ErrnoException).code;
      if (code && code !== 'ENOENT') throw err;
      content = generateEntityTemplate({ id: name.toLowerCase(), name });
    }
  }

  try {
    await fs.mkdir(targetDir, { recursive: true });
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
  }

  if (content === null) {
    throw new CliError({ code: 'ERR_UNEXPECTED', message: 'Content is unexpectedly null.' });
  }

  await fs.writeFile(targetPath, content, 'utf-8');

  // FR-AI-005 Extensibility: Post-generate hooks
  for (const plugin of plugins) {
    if (plugin.postGenerate) {
      await plugin.postGenerate({ name, targetPath });
    }
  }

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          status: 'success',
          data: {
            file: `./schemas/${name.toLowerCase()}.json`,
            entityName: name,
          },
        },
        null,
        2
      )
    );
  } else {
    console.log(`Successfully generated entity ${name} at ./schemas/${name.toLowerCase()}.json`);
  }
}

export async function ejectTemplates(options: { force?: boolean; json?: boolean }): Promise<void> {
  const destDir = path.join(process.cwd(), '.origo', 'templates');
  const srcDir = path.resolve(__dirname, '../templates');

  let files: string[];
  try {
    files = await fs.readdir(srcDir);
  } catch {
    throw new CliError({ code: 'ERR_NO_TEMPLATES', message: 'No template files found to eject.' });
  }

  const jsonFiles = files.filter(f => f.endsWith('.json'));
  if (jsonFiles.length === 0) {
    throw new CliError({ code: 'ERR_NO_TEMPLATES', message: 'No template files found to eject.' });
  }

  if (!options.force) {
    for (const file of jsonFiles) {
      const destFile = path.join(destDir, file);
      try {
        await fs.access(destFile);
        throw new CliError({
          code: 'ERR_FILE_EXISTS',
          message: `Template file already exists: ${destFile}. Use --force to overwrite.`,
          context: { path: destFile },
        });
      } catch (err: unknown) {
        if (err instanceof CliError) throw err;
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
      }
    }
  }

  try {
    await fs.mkdir(destDir, { recursive: true });
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
  }

  await Promise.all(
    jsonFiles.map(file => fs.copyFile(path.join(srcDir, file), path.join(destDir, file)))
  );

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          status: 'success',
          data: {
            destination: './.origo/templates',
            filesEjected: jsonFiles,
          },
        },
        null,
        2
      )
    );
  } else {
    console.log(`Successfully ejected ${jsonFiles.length} templates to ./.origo/templates`);
  }
}
