import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { parseTokens, generateCssVariables } from './build';
import Ajv2020 from 'ajv/dist/2020';

function loadJson(path: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e: unknown) {
    throw new Error(`Failed to read or parse JSON at ${path}: ${(e as Error).message}`);
  }
}

function main() {
  const baseJsonPath = join(__dirname, 'tokens/base.json');
  const semanticJsonPath = join(__dirname, 'tokens/semantic.json');
  const baseSchemaPath = join(__dirname, 'schemas/base-tokens.schema.json');
  const semanticSchemaPath = join(__dirname, 'schemas/semantic-tokens.schema.json');

  const baseJson = loadJson(baseJsonPath);
  const semanticJson = loadJson(semanticJsonPath);
  const baseSchema = loadJson(baseSchemaPath);
  const semanticSchema = loadJson(semanticSchemaPath);

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  if (!ajv.validate(baseSchema, baseJson)) {
    throw new Error(`Base tokens failed validation: ${ajv.errorsText()}`);
  }
  if (!ajv.validate(semanticSchema, semanticJson)) {
    throw new Error(`Semantic tokens failed validation: ${ajv.errorsText()}`);
  }

  const baseTokens = parseTokens(baseJson, 'origo');
  const semanticTokens = parseTokens(semanticJson, 'origo');

  const css = generateCssVariables(baseTokens, semanticTokens);

  const allTokens = { ...baseTokens, ...semanticTokens };

  const outDir = join(__dirname, '..');
  mkdirSync(outDir, { recursive: true });

  // Write CSS
  writeFileSync(join(outDir, 'tokens.css'), css, 'utf8');

  // Write JSON
  writeFileSync(join(outDir, 'tokens.json'), JSON.stringify(allTokens, null, 2), 'utf8');

  // Write JS
  const jsContent = `module.exports = ${JSON.stringify(allTokens, null, 2)};`;
  writeFileSync(join(outDir, 'tokens.js'), jsContent, 'utf8');

  // Write TS definitions
  const tsContent = `declare const tokens: Record<string, string>;\nexport default tokens;`;
  writeFileSync(join(outDir, 'tokens.d.ts'), tsContent, 'utf8');

  console.log(`Successfully compiled design tokens to ${outDir}`);
}

main();
