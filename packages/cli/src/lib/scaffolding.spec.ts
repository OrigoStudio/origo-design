import * as fs from 'fs/promises';
import * as path from 'path';
import { scaffoldProject } from './scaffolding';
import { CliError } from '../utils/errors';

jest.mock('fs/promises');

describe('scaffoldProject', () => {
  let mkdirSpy: jest.SpyInstance;
  let writeFileSpy: jest.SpyInstance;
  let accessSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    mkdirSpy = (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    writeFileSpy = (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    accessSpy = (fs.access as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
    logSpy = jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.clearAllMocks();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('should scaffold project correctly and produce secure-by-default origo.json', async () => {
    const projectName = 'test-project';
    const targetDir = path.resolve(process.cwd(), projectName);

    await scaffoldProject(projectName);

    expect(accessSpy).toHaveBeenCalledWith(targetDir);
    expect(mkdirSpy).toHaveBeenCalledWith(targetDir, { recursive: true });
    expect(mkdirSpy).toHaveBeenCalledWith(path.join(targetDir, 'schemas'), { recursive: true });

    expect(writeFileSpy).toHaveBeenCalledWith(
      path.join(targetDir, 'origo.json'),
      expect.any(String),
      'utf-8'
    );

    const writtenConfigStr = (writeFileSpy as jest.Mock).mock.calls[0][1];
    const parsedConfig = JSON.parse(writtenConfigStr);

    expect(parsedConfig.version).toBe('1.0');
    expect(parsedConfig.security).toBeDefined();
    expect(parsedConfig.security.sandboxEnabled).toBe(true);
    expect(parsedConfig.security.allowNetworkAccess).toBe(false);
    expect(parsedConfig.security.allowFileSystemAccess).toBe(false);
  });

  it('should reject invalid project names without filesystem mutations', async () => {
    const invalidNames = [
      '../evil-project',
      './nested/name',
      'nested/project',
      'nested\\project',
      'bad*name',
      'bad?name',
      '',
      '   ',
    ];

    for (const name of invalidNames) {
      jest.clearAllMocks();
      await expect(scaffoldProject(name)).rejects.toMatchObject({
        code: 'ERR_INVALID_PROJECT_NAME',
      });
      expect(mkdirSpy).not.toHaveBeenCalled();
      expect(writeFileSpy).not.toHaveBeenCalled();
      expect(accessSpy).not.toHaveBeenCalled();
    }
  });

  it('should fail if project directory already exists', async () => {
    const projectName = 'existing-project';
    accessSpy.mockResolvedValue(undefined); // Directory exists persistently for this test

    await expect(scaffoldProject(projectName)).rejects.toThrow(CliError);
    await expect(scaffoldProject(projectName)).rejects.toMatchObject({
      code: 'EEXIST',
      message: `Directory ${projectName} already exists.`,
    });
  });

  it('should output machine-readable JSON when json option is true', async () => {
    const projectName = 'json-project';

    await scaffoldProject(projectName, { json: true });

    expect(logSpy).toHaveBeenCalled();
    const loggedOutput = logSpy.mock.calls[0][0];
    const parsedLog = JSON.parse(loggedOutput);
    expect(parsedLog.status).toBe('success');
    expect(parsedLog.data.projectName).toBe('json-project');
  });

  it('should throw CliError if fs.access throws non-ENOENT', async () => {
    accessSpy.mockRejectedValue(new Error('Permission denied'));
    await expect(scaffoldProject('test-project')).rejects.toMatchObject({
      code: 'SCAFFOLD_ERROR',
      message: expect.stringContaining('Permission denied'),
    });
  });

  it('should throw existing CliError if thrown inside the try block', async () => {
    const error = new CliError({ code: 'CUSTOM_ERR', message: 'Custom message' });
    mkdirSpy.mockRejectedValue(error);
    await expect(scaffoldProject('test-project')).rejects.toMatchObject({
      code: 'CUSTOM_ERR',
      message: 'Custom message',
    });
  });

  it('should handle non-Error exceptions in catch block', async () => {
    mkdirSpy.mockRejectedValue('String exception');
    await expect(scaffoldProject('test-project')).rejects.toMatchObject({
      code: 'SCAFFOLD_ERROR',
      message: expect.stringContaining('String exception'),
    });
  });
});
