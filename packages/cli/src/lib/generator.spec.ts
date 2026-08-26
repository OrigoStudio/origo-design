import * as fs from 'fs/promises';
import * as path from 'path';
import { generateEntity, ejectTemplates } from './generator';
import { CliError } from '../utils/errors';
import { generateEntityTemplate } from '../templates';

jest.mock('fs/promises');
jest.mock('../templates', () => ({
  generateEntityTemplate: jest.fn().mockReturnValue('{"mock": "template"}'),
}));

describe('generator', () => {
  let accessSpy: jest.SpyInstance;
  let readFileSpy: jest.SpyInstance;
  let writeFileSpy: jest.SpyInstance;
  let copyFileSpy: jest.SpyInstance;
  let mkdirSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let readdirSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    accessSpy = (fs.access as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
    readFileSpy = (fs.readFile as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
    writeFileSpy = (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    copyFileSpy = (fs.copyFile as jest.Mock).mockResolvedValue(undefined);
    mkdirSpy = (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    readdirSpy = (fs.readdir as jest.Mock).mockResolvedValue([
      'entity.json',
      'extension.json',
      'origo.json',
      'index.ts',
    ]);
    logSpy = jest.spyOn(console, 'log').mockImplementation(jest.fn());
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  describe('generateEntity', () => {
    it('should generate entity using built-in template when no override exists', async () => {
      await generateEntity('User', {});

      const expectedPath = path.join(process.cwd(), 'schemas', 'user.json');
      expect(writeFileSpy).toHaveBeenCalledWith(expectedPath, '{"mock": "template"}', 'utf-8');
      expect(generateEntityTemplate).toHaveBeenCalledWith({ id: 'user', name: 'User' });
    });

    it('should use custom template if exists in .origo/templates', async () => {
      readFileSpy.mockResolvedValue('{"id": "{{id}}", "name": "{{name}}"}');

      await generateEntity('User', {});

      const expectedPath = path.join(process.cwd(), 'schemas', 'user.json');
      expect(writeFileSpy).toHaveBeenCalledWith(
        expectedPath,
        '{"id": "user", "name": "User"}\n',
        'utf-8'
      );
      expect(generateEntityTemplate).not.toHaveBeenCalled();
    });

    it('should fail if file exists and --force is not provided', async () => {
      const expectedPath = path.join(process.cwd(), 'schemas', 'user.json');
      accessSpy.mockImplementation(async filePath => {
        if (filePath === expectedPath) {
          return undefined; // exists
        }
        throw { code: 'ENOENT' };
      });

      await expect(generateEntity('User', {})).rejects.toThrow(CliError);
      await expect(generateEntity('User', {})).rejects.toMatchObject({
        code: 'ERR_FILE_EXISTS',
      });
    });

    it('should overwrite if file exists and --force is provided', async () => {
      const expectedPath = path.join(process.cwd(), 'schemas', 'user.json');
      accessSpy.mockImplementation(async filePath => {
        if (filePath === expectedPath) {
          return undefined; // exists
        }
        throw { code: 'ENOENT' };
      });

      await generateEntity('User', { force: true });
      expect(writeFileSpy).toHaveBeenCalled();
    });

    it('should fail on empty name', async () => {
      await expect(generateEntity('   ', {})).rejects.toThrow(CliError);
    });

    it('should fail on path traversal in name', async () => {
      await expect(generateEntity('../User', {})).rejects.toThrow(CliError);
    });

    it('should output JSON when --json is provided', async () => {
      await generateEntity('User', { json: true });

      expect(logSpy).toHaveBeenCalled();
      const loggedOutput = logSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(loggedOutput);
      expect(parsedLog.status).toBe('success');
      expect(parsedLog.data.entityName).toBe('User');
    });

    it('should output text when --json is not provided', async () => {
      await generateEntity('User', {});
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Successfully generated entity User')
      );
    });
  });

  describe('ejectTemplates', () => {
    it('should copy .json templates and output JSON on success', async () => {
      await ejectTemplates({ json: true, force: true });

      expect(mkdirSpy).toHaveBeenCalledWith(path.join(process.cwd(), '.origo', 'templates'), {
        recursive: true,
      });
      expect(readdirSpy).toHaveBeenCalled();
      expect(copyFileSpy).toHaveBeenCalledTimes(3); // only .json files

      expect(logSpy).toHaveBeenCalled();
      const loggedOutput = logSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(loggedOutput);
      expect(parsedLog.status).toBe('success');
      expect(parsedLog.data.filesEjected).toContain('entity.json');
      expect(parsedLog.data.filesEjected).not.toContain('index.ts');
    });

    it('should fail if no templates found', async () => {
      readdirSpy.mockResolvedValue(['index.ts']); // no .json files
      await expect(ejectTemplates({ json: true })).rejects.toThrow(CliError);
    });

    it('should fail if destination file exists and no --force', async () => {
      accessSpy.mockResolvedValue(undefined); // all exist
      await expect(ejectTemplates({})).rejects.toThrow(CliError);
    });

    it('should output text when --json is not provided', async () => {
      await ejectTemplates({ force: true });
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Successfully ejected 3 templates')
      );
    });
  });
});
