/* eslint-disable @nx/enforce-module-boundaries */
import { registerBadlSchema } from './schema-registry';
import * as monaco from 'monaco-editor';
import { vi, Mock } from 'vitest';
import coreDomainSchema from '../../../core/src/schemas/domain.schema.json';
import playgroundDomainSchema from '../schemas/domain.schema.json';
import coreEntitySchema from '../../../core/src/schemas/entity.schema.json';
import playgroundEntitySchema from '../schemas/entity.schema.json';
import coreCapabilitySchema from '../../../core/src/schemas/capability.schema.json';
import playgroundCapabilitySchema from '../schemas/capability.schema.json';
import coreContractSchema from '../../../core/src/schemas/contract.schema.json';
import playgroundContractSchema from '../schemas/contract.schema.json';
import corePermissionSchema from '../../../core/src/schemas/permission.schema.json';
import playgroundPermissionSchema from '../schemas/permission.schema.json';
import coreExtensionSchema from '../../../core/src/schemas/extension.schema.json';
import playgroundExtensionSchema from '../schemas/extension.schema.json';

// mock the module before tests
vi.mock('monaco-editor', () => ({
  languages: {
    json: {
      jsonDefaults: {
        setDiagnosticsOptions: vi.fn(),
      },
    },
  },
}));

describe('schema-registry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register all 6 BADL schemas', () => {
    registerBadlSchema();

    expect(monaco.languages.json.jsonDefaults.setDiagnosticsOptions).toHaveBeenCalled();
    const args = (monaco.languages.json.jsonDefaults.setDiagnosticsOptions as Mock).mock
      .calls[0][0];

    expect(args.validate).toBe(true);
    expect(args.schemas).toHaveLength(6);

    const uris = args.schemas.map((s: { uri: string }) => s.uri);
    expect(uris).toContain('https://origo.design/schemas/v1/domain.schema.json');
    expect(uris).toContain('https://origo.design/schemas/v1/entity.schema.json');
    expect(uris).toContain('https://origo.design/schemas/v1/capability.schema.json');
    expect(uris).toContain('https://origo.design/schemas/v1/contract.schema.json');
    expect(uris).toContain('https://origo.design/schemas/v1/permission.schema.json');
    expect(uris).toContain('https://origo.design/schemas/v1/extension.schema.json');
  });

  it('should have schema parity with core schemas', () => {
    expect(playgroundDomainSchema).toEqual(coreDomainSchema);
    expect(playgroundEntitySchema).toEqual(coreEntitySchema);
    expect(playgroundCapabilitySchema).toEqual(coreCapabilitySchema);
    expect(playgroundContractSchema).toEqual(coreContractSchema);
    expect(playgroundPermissionSchema).toEqual(corePermissionSchema);
    expect(playgroundExtensionSchema).toEqual(coreExtensionSchema);
  });
});
