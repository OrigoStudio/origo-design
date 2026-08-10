import { compileFromFile } from 'json-schema-to-typescript';
import * as fs from 'fs';
import * as path from 'path';

async function generate() {
  const schemasDir = path.join(__dirname, '../src/schemas');
  const typesDir = path.join(__dirname, '../src/types');

  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }

  const domainTs = await compileFromFile(path.join(schemasDir, 'domain.schema.json'), {
    cwd: schemasDir,
    declareExternallyReferenced: true,
  });
  fs.writeFileSync(path.join(typesDir, 'domain.ts'), domainTs);

  const entityTs = await compileFromFile(path.join(schemasDir, 'entity.schema.json'), {
    cwd: schemasDir,
    declareExternallyReferenced: true,
  });
  fs.writeFileSync(path.join(typesDir, 'entity.ts'), entityTs);
}

generate().catch(e => {
  console.error(e);
  process.exit(1);
});
