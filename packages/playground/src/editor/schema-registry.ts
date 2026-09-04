import * as monaco from 'monaco-editor';
import domainSchema from '../schemas/domain.schema.json';
import entitySchema from '../schemas/entity.schema.json';
import capabilitySchema from '../schemas/capability.schema.json';
import contractSchema from '../schemas/contract.schema.json';
import permissionSchema from '../schemas/permission.schema.json';
import extensionSchema from '../schemas/extension.schema.json';

let isRegistered = false;

export function registerBadlSchema(): void {
  if (isRegistered || !monaco?.languages?.json?.jsonDefaults) return;
  isRegistered = true;

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [
      {
        uri: 'https://origo.design/schemas/v1/domain.schema.json',
        fileMatch: ['*.json'],
        schema: domainSchema,
      },
      { uri: 'https://origo.design/schemas/v1/entity.schema.json', schema: entitySchema },
      { uri: 'https://origo.design/schemas/v1/capability.schema.json', schema: capabilitySchema },
      { uri: 'https://origo.design/schemas/v1/contract.schema.json', schema: contractSchema },
      { uri: 'https://origo.design/schemas/v1/permission.schema.json', schema: permissionSchema },
      { uri: 'https://origo.design/schemas/v1/extension.schema.json', schema: extensionSchema },
    ],
  });
}
