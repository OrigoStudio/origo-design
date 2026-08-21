import { initializeProject } from './init';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CliError } from '../utils/errors';

jest.mock('fs/promises');

describe('initCommand', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const mockTarget = '/mock/cwd';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should initialize a project successfully', async () => {
    mockFs.access.mockRejectedValue({ code: 'ENOENT' });
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);

    await initializeProject('test-project', mockTarget);

    const expectedProjectDir = path.join(mockTarget, 'test-project');
    const expectedSchemasDir = path.join(expectedProjectDir, 'schemas');
    const expectedConfigFile = path.join(expectedProjectDir, 'origo.json');

    expect(mockFs.access).toHaveBeenCalledWith(expectedProjectDir);
    expect(mockFs.mkdir).toHaveBeenCalledWith(expectedProjectDir, { recursive: true });
    expect(mockFs.mkdir).toHaveBeenCalledWith(expectedSchemasDir, { recursive: true });

    expect(mockFs.writeFile).toHaveBeenCalledWith(
      expectedConfigFile,
      expect.stringContaining('"version": "1.0"'),
      'utf-8'
    );
  });

  it('should throw an error if the directory already exists', async () => {
    mockFs.access.mockResolvedValue(undefined); // Directory exists

    await expect(initializeProject('test-project', mockTarget)).rejects.toThrow(CliError);
    await expect(initializeProject('test-project', mockTarget)).rejects.toMatchObject({
      code: 'ERR_DIR_EXISTS',
    });
  });

  it('should throw a generic error if fs.mkdir fails', async () => {
    mockFs.access.mockRejectedValue({ code: 'ENOENT' });
    mockFs.mkdir.mockRejectedValue(new Error('Permission denied'));

    await expect(initializeProject('test-project', mockTarget)).rejects.toThrow(CliError);
    await expect(initializeProject('test-project', mockTarget)).rejects.toMatchObject({
      code: 'ERR_INIT_FAILED',
    });
  });
});
