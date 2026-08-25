import * as fs from 'fs';
import { validateDirectory } from './validation';
import { BADLValidator, validateAST } from '@origo/core';
import { CliError } from '../utils/errors';

jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
    stat: jest.fn(),
  },
}));

jest.mock('@origo/core', () => {
  return {
    BADLValidator: jest.fn().mockImplementation(() => ({
      validateDomain: jest.fn(),
      validateEntity: jest.fn(),
      errors: null,
    })),
    validateAST: jest.fn(),
  };
});

describe('Validation Library', () => {
  let consoleLogSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(code => {
      throw new Error(`process.exit: ${code}`);
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('validateDirectory', () => {
    it('throws CliError if path does not exist', async () => {
      (fs.promises.stat as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

      await expect(validateDirectory('./schemas', { json: false })).rejects.toThrow(CliError);
      try {
        await validateDirectory('./schemas', { json: false });
      } catch (e: unknown) {
        expect((e as CliError).code).toBe('ERR_DIRECTORY_NOT_FOUND');
      }
    });

    it('throws CliError if stat fails with other error', async () => {
      (fs.promises.stat as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      try {
        await validateDirectory('./schemas', { json: false });
      } catch (e: unknown) {
        expect((e as CliError).code).toBe('ERR_DIRECTORY_READ');
      }
    });

    it('handles single file validation', async () => {
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        isFile: () => true,
        isDirectory: () => false,
      });
      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        '{"$schema": "https://origo.design/schemas/v1/domain.schema.json"}'
      );

      const mockValidateDomain = jest.fn().mockReturnValue(true);
      (BADLValidator as jest.Mock).mockImplementation(() => ({
        validateDomain: mockValidateDomain,
        errors: null,
      }));
      (validateAST as jest.Mock).mockReturnValue([]);

      const totalErrors = await validateDirectory('./schemas/single.json', { json: false });

      expect(totalErrors).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('single.json'));
    });

    it('throws CliError if single file is not .json', async () => {
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        isFile: () => true,
        isDirectory: () => false,
      });

      await expect(validateDirectory('./schemas/single.txt', { json: false })).rejects.toThrow(
        CliError
      );
    });

    it('handles all-valid directory scenario', async () => {
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        isFile: () => false,
        isDirectory: () => true,
      });
      (fs.promises.readdir as jest.Mock).mockResolvedValue([
        { isFile: () => true, name: 'valid.json', parentPath: '/schemas', path: '/schemas' },
      ]);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        '{"$schema": "https://origo.design/schemas/v1/domain.schema.json"}'
      );

      const mockValidateDomain = jest.fn().mockReturnValue(true);
      (BADLValidator as jest.Mock).mockImplementation(() => ({
        validateDomain: mockValidateDomain,
        errors: null,
      }));
      (validateAST as jest.Mock).mockReturnValue([]);

      const totalErrors = await validateDirectory('/schemas', { json: true });

      expect(totalErrors).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"status": "success"'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"errorsFound": 0'));
    });

    it('handles JSON schema errors', async () => {
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        isFile: () => false,
        isDirectory: () => true,
      });
      (fs.promises.readdir as jest.Mock).mockResolvedValue([
        { isFile: () => true, name: 'invalid.json', parentPath: '/schemas', path: '/schemas' },
      ]);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        '{"$schema": "https://origo.design/schemas/v1/domain.schema.json"}'
      );

      const mockValidateDomain = jest.fn().mockReturnValue(false);
      (BADLValidator as jest.Mock).mockImplementation(() => ({
        validateDomain: mockValidateDomain,
        errors: [
          {
            code: 'INVALID_FORMAT',
            message: 'missing id',
            context: { line: 12, column: 5 },
          },
        ],
      }));

      const totalErrors = await validateDirectory('/schemas', { json: true });
      expect(totalErrors).toBe(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"status": "error"'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"errorsFound": 1'));
    });

    it('handles AST semantic errors', async () => {
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        isFile: () => false,
        isDirectory: () => true,
      });
      (fs.promises.readdir as jest.Mock).mockResolvedValue([
        { isFile: () => true, name: 'invalid-ast.json', parentPath: '/schemas', path: '/schemas' },
      ]);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        '{"$schema": "https://origo.design/schemas/v1/domain.schema.json"}'
      );

      const mockValidateDomain = jest.fn().mockReturnValue(true);
      (BADLValidator as jest.Mock).mockImplementation(() => ({
        validateDomain: mockValidateDomain,
        errors: null,
      }));
      (validateAST as jest.Mock).mockReturnValue([
        {
          type: 'MISSING_REFERENCE',
          message: 'missing reference',
        },
      ]);

      const totalErrors = await validateDirectory('/schemas', { json: false });
      expect(totalErrors).toBe(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('MISSING_REFERENCE'));
    });

    it('returns error if file is unreadable instead of aborting', async () => {
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        isFile: () => false,
        isDirectory: () => true,
      });
      (fs.promises.readdir as jest.Mock).mockResolvedValue([
        { isFile: () => true, name: 'unreadable.json', parentPath: '/schemas', path: '/schemas' },
      ]);
      (fs.promises.readFile as jest.Mock).mockRejectedValue(new Error('Cannot read'));

      const totalErrors = await validateDirectory('/schemas', { json: false });
      expect(totalErrors).toBe(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ERR_JSON_PARSE'));
    });

    it('returns error if JSON is invalid instead of throwing', async () => {
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        isFile: () => false,
        isDirectory: () => true,
      });
      (fs.promises.readdir as jest.Mock).mockResolvedValue([
        { isFile: () => true, name: 'invalid-json.json', parentPath: '/schemas', path: '/schemas' },
      ]);
      (fs.promises.readFile as jest.Mock).mockResolvedValue('{ invalid }');

      const mockValidateDomain = jest.fn().mockReturnValue(true);
      (BADLValidator as jest.Mock).mockImplementation(() => ({
        validateDomain: mockValidateDomain,
        errors: null,
      }));
      (validateAST as jest.Mock).mockImplementation(() => {
        throw new Error('JSON parse error');
      });

      const totalErrors = await validateDirectory('/schemas', { json: false });
      expect(totalErrors).toBe(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ERR_JSON_PARSE'));
    });
  });
});
