import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { parseTokens, generateCssVariables } from './build';

function main() {
  const baseJsonPath = join(__dirname, 'tokens/base.json');
  const semanticJsonPath = join(__dirname, 'tokens/semantic.json');

  const baseJson = JSON.parse(readFileSync(baseJsonPath, 'utf8'));
  const semanticJson = JSON.parse(readFileSync(semanticJsonPath, 'utf8'));

  const baseTokens = parseTokens(baseJson, 'origo');
  const semanticTokens = parseTokens(semanticJson, 'origo');

  const allTokens = { ...baseTokens, ...semanticTokens };
  const css = generateCssVariables(allTokens);

  const outputPath = join(__dirname, '../../../dist/packages/design-tokens/tokens.css');
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, css, 'utf8');

  console.log(`Successfully compiled design tokens CSS to ${outputPath}`);
}

main();
