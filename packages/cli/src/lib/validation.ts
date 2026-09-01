import * as fs from 'fs';
import * as path from 'path';
import { BADLValidator, validateAST } from '@origo/core';
import { CliError } from '../utils/errors';

export interface ValidationOptions {
  json?: boolean;
}

export async function validateDirectory(
  directory = './schemas',
  options: ValidationOptions = {}
): Promise<number> {
  const targetDir = path.resolve(process.cwd(), directory);
  const cwd = process.cwd();
  if (!targetDir.startsWith(cwd + path.sep) && targetDir !== cwd) {
    throw new CliError({
      code: 'ERR_PATH_TRAVERSAL',
      message: `Access denied: path "${directory}" resolves outside the working directory.`,
      context: { directory, resolvedPath: targetDir, cwd },
    });
  }

  let files: string[] = [];
  let targetDirBase = targetDir;

  try {
    const stat = await fs.promises.stat(targetDir);
    if (stat.isFile()) {
      targetDirBase = path.dirname(targetDir);
      files = [path.basename(targetDir)];
      if (!files[0].endsWith('.json')) {
        throw new CliError({
          code: 'ERR_INVALID_FILE_TYPE',
          message: 'Only .json files are supported for validation',
        });
      }
    } else {
      const dirents = await fs.promises.readdir(targetDir, {
        recursive: true,
        withFileTypes: true,
      });
      for (const d of dirents) {
        if (d.isFile() && d.name.endsWith('.json')) {
          const fullPath = path.join(d.parentPath || d.path, d.name);
          files.push(path.relative(targetDirBase, fullPath));
        }
      }
    }
  } catch (error: unknown) {
    if (error instanceof CliError) {
      throw error;
    }
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      throw new CliError({
        code: 'ERR_DIRECTORY_NOT_FOUND',
        message: `Path not found: ${directory}`,
        cause: error,
      });
    }
    throw new CliError({
      code: 'ERR_DIRECTORY_READ',
      message: `Failed to read path: ${err.message}`,
      cause: error,
    });
  }

  if (!options.json) {
    console.log(`Validating schemas in ${directory}...\n`);
  }

  if (files.length === 0) {
    if (!options.json) {
      console.log('No .json files found.');
    }
    return 0;
  }

  const results = [];
  let totalErrors = 0;

  let validator: BADLValidator;
  try {
    validator = new BADLValidator();
  } catch (error: unknown) {
    throw new CliError({
      code: 'ERR_VALIDATOR_INIT',
      message: `Failed to initialize BADLValidator: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  for (const file of files) {
    const filePath = path.join(targetDirBase, file);
    let rawContent: string;
    let combinedErrors: Array<{ code: string; message: string; line?: number; column?: number }> =
      [];
    let isValid = true;

    try {
      rawContent = await fs.promises.readFile(filePath, 'utf-8');
      rawContent = rawContent.replace(/^\uFEFF/, '');

      const parsed = JSON.parse(rawContent);
      const schemaType = parsed.$schema || '';

      let isSchemaValid = false;
      const schemaErrorsList: Array<{
        code?: string;
        message?: string;
        context?: { line?: number; column?: number };
      }> = [];
      let astErrorsList: Array<{
        type?: string;
        message?: string;
        line?: number;
        column?: number;
      }> = [];

      if (schemaType.includes('domain.schema.json')) {
        isSchemaValid = validator.validateDomain(rawContent);
        if (validator.errors) schemaErrorsList.push(...validator.errors);

        if (isSchemaValid) {
          astErrorsList = validateAST({ schemaVersion: '1.0', domains: [parsed] });
        }
      } else if (schemaType.includes('entity.schema.json')) {
        isSchemaValid = validator.validateEntity(rawContent);
        if (validator.errors) schemaErrorsList.push(...validator.errors);
      } else {
        schemaErrorsList.push({
          code: 'UNSUPPORTED_SCHEMA',
          message: `Schema type is unsupported or missing $schema. Cannot validate: ${schemaType}`,
        });
      }

      combinedErrors = [
        ...schemaErrorsList.map(e => ({
          code: e.code || 'VALIDATION_ERROR',
          message: e.message || 'Unknown error',
          line: e.context?.line,
          column: e.context?.column,
        })),
        ...astErrorsList.map(e => ({
          code: e.type || 'VALIDATION_ERROR',
          message: e.message || 'Unknown error',
          line: e.line,
          column: e.column,
        })),
      ];

      isValid = combinedErrors.length === 0;
    } catch (error: unknown) {
      combinedErrors = [
        {
          code: 'ERR_JSON_PARSE',
          message: `Failed to parse JSON or read file ${file}: ${error instanceof Error ? error.message : String(error)}`,
        },
      ];
      isValid = false;
    }

    totalErrors += combinedErrors.length;

    results.push({
      file,
      valid: isValid,
      errors: combinedErrors,
    });
  }

  if (options.json) {
    const jsonOutput = {
      status: totalErrors === 0 ? 'success' : 'error',
      data: {
        directory,
        filesValidated: files.length,
        errorsFound: totalErrors,
        results,
      },
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
    return totalErrors;
  }

  let validFilesCount = 0;
  let invalidFilesCount = 0;

  for (const result of results) {
    if (result.valid) {
      console.log(`  \x1b[32m✓\x1b[0m  ${result.file}`);
      validFilesCount++;
    } else {
      console.log(`  \x1b[31m✗\x1b[0m  ${result.file}`);
      invalidFilesCount++;
      for (const error of result.errors) {
        const line = error.line !== undefined ? error.line : '-';
        const col = error.column !== undefined ? error.column : '-';
        console.log(`       ${line}:${col}  [${error.code}]  ${error.message}`);
      }
    }
  }

  const fileWord = (count: number) => (count === 1 ? 'file' : 'files');
  console.log(
    `\nFound ${totalErrors} errors in ${invalidFilesCount} ${fileWord(invalidFilesCount)} (${validFilesCount} ${fileWord(validFilesCount)} valid, ${invalidFilesCount} ${fileWord(invalidFilesCount)} invalid).`
  );

  return totalErrors;
}
