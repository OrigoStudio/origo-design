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
    BADLValidator: jest.fn().mockImplementation(() => {
      let domainErrors: Array<{ code: string; message: string }> | null = null;
      let entityErrors: Array<{ code: string; message: string }> | null = null;
      return {
        validateDomain: jest.fn().mockImplementation(() => {
          return domainErrors === null;
        }),
        validateEntity: jest.fn().mockImplementation(() => {
          return entityErrors === null;
        }),
        get errors() {
          return domainErrors || entityErrors;
        },
        setErrors(errs: Array<{ code: string; message: string }> | null) {
          domainErrors = errs;
          entityErrors = errs;
        },
      };
    }),
    validateAST: jest.fn(),
  };
});

describe('Validation Library', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('validateDirectory', () => {
    describe('path traversal guard', () => {
      it('rejects ../../../etc/passwd with ERR_PATH_TRAVERSAL', async () => {
        const statSpy = jest.spyOn(fs.promises, 'stat');
        await expect(validateDirectory('../../../etc/passwd')).rejects.toMatchObject({
          code: 'ERR_PATH_TRAVERSAL',
        });
        expect(statSpy).not.toHaveBeenCalled();
      });

      it('rejects relative path escaping cwd with ERR_PATH_TRAVERSAL', async () => {
        const statSpy = jest.spyOn(fs.promises, 'stat');
        await expect(validateDirectory('../../sensitive')).rejects.toMatchObject({
          code: 'ERR_PATH_TRAVERSAL',
        });
        expect(statSpy).not.toHaveBeenCalled();
      });

      it('accepts a path within cwd', async () => {
        (fs.promises.stat as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
        await expect(validateDirectory('./schemas')).rejects.toMatchObject({
          code: 'ERR_DIRECTORY_NOT_FOUND',
        });
      });

      it('rejects an empty directory string with ERR_INVALID_DIRECTORY', async () => {
        const statSpy = jest.spyOn(fs.promises, 'stat');
        await expect(validateDirectory('')).rejects.toMatchObject({
          code: 'ERR_INVALID_DIRECTORY',
        });
        expect(statSpy).not.toHaveBeenCalled();
      });

      it('rejects whitespace-only directory string with ERR_INVALID_DIRECTORY', async () => {
        const statSpy = jest.spyOn(fs.promises, 'stat');
        await expect(validateDirectory('   ')).rejects.toMatchObject({
          code: 'ERR_INVALID_DIRECTORY',
        });
        expect(statSpy).not.toHaveBeenCalled();
      });

      it('rejects an absolute path that escapes cwd with ERR_PATH_TRAVERSAL', async () => {
        const statSpy = jest.spyOn(fs.promises, 'stat');
        await expect(
          validateDirectory(
            process.platform === 'win32' ? 'C:\\\\Windows\\\\System32' : '/etc/passwd'
          )
        ).rejects.toMatchObject({
          code: 'ERR_PATH_TRAVERSAL',
        });
        expect(statSpy).not.toHaveBeenCalled();
      });
    });

    it('throws CliError if path does not exist', async () => {
      (fs.promises.stat as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

      await expect(validateDirectory('./schemas', { json: false })).rejects.toMatchObject({
        code: 'ERR_DIRECTORY_NOT_FOUND',
      });
    });

    it('throws CliError if stat fails with other error', async () => {
      (fs.promises.stat as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(validateDirectory('./schemas', { json: false })).rejects.toMatchObject({
        code: 'ERR_DIRECTORY_READ',
      });
    });

    it('re-throws existing CliError directly during directory stat', async () => {
      const customError = new CliError({ code: 'CUSTOM_DIR_ERR', message: 'Custom message' });
      (fs.promises.stat as jest.Mock).mockRejectedValue(customError);

      await expect(validateDirectory('./schemas', { json: false })).rejects.toMatchObject({
        code: 'CUSTOM_DIR_ERR',
        message: 'Custom message',
      });
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

      await expect(
        validateDirectory('./schemas/single.txt', { json: false })
      ).rejects.toMatchObject({
        code: 'ERR_INVALID_FILE_TYPE',
      });

      await expect(
        validateDirectory('./schemas/notes.json.bak', { json: false })
      ).rejects.toMatchObject({
        code: 'ERR_INVALID_FILE_TYPE',
      });
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

      const totalErrors = await validateDirectory('./schemas', { json: true });

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

      const totalErrors = await validateDirectory('./schemas', { json: true });
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

      const totalErrors = await validateDirectory('./schemas', { json: false });
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

      const totalErrors = await validateDirectory('./schemas', { json: false });
      expect(totalErrors).toBe(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ERR_JSON_PARSE'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Cannot read'));
    });

    it('handles non-Error exceptions when reading file', async () => {
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        isFile: () => false,
        isDirectory: () => true,
      });
      (fs.promises.readdir as jest.Mock).mockResolvedValue([
        { isFile: () => true, name: 'unreadable.json', parentPath: '/schemas', path: '/schemas' },
      ]);
      (fs.promises.readFile as jest.Mock).mockRejectedValue('String exception');

      const totalErrors = await validateDirectory('./schemas', { json: false });
      expect(totalErrors).toBe(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('String exception'));
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

      const totalErrors = await validateDirectory('./schemas', { json: false });
      expect(totalErrors).toBe(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ERR_JSON_PARSE'));
    });

    describe('unsupported schema handling', () => {
      beforeEach(() => {
        (fs.promises.stat as jest.Mock).mockResolvedValue({
          isFile: () => false,
          isDirectory: () => true,
        });
        (BADLValidator as jest.Mock).mockImplementation(() => ({
          validateDomain: jest.fn(),
          validateEntity: jest.fn(),
          errors: null,
        }));
      });

      it('reports UNSUPPORTED_SCHEMA when $schema field is missing', async () => {
        (fs.promises.readdir as jest.Mock).mockResolvedValue([
          { isFile: () => true, name: 'no-schema.json', parentPath: '/schemas', path: '/schemas' },
        ]);
        (fs.promises.readFile as jest.Mock).mockResolvedValue('{"id": "test"}');

        const totalErrors = await validateDirectory('./schemas', { json: true });
        expect(totalErrors).toBe(1);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('UNSUPPORTED_SCHEMA'));
      });

      it('reports UNSUPPORTED_SCHEMA when $schema is empty or unrecognized URI', async () => {
        (fs.promises.readdir as jest.Mock).mockResolvedValue([
          { isFile: () => true, name: 'other.json', parentPath: '/schemas', path: '/schemas' },
        ]);
        (fs.promises.readFile as jest.Mock).mockResolvedValue(
          '{"$schema": "https://example.com/unsupported.schema.json"}'
        );

        const totalErrors = await validateDirectory('./schemas', { json: true });
        expect(totalErrors).toBe(1);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('UNSUPPORTED_SCHEMA'));
      });
    });

    describe('entity schema validation', () => {
      it('validates entity schema successfully', async () => {
        (fs.promises.stat as jest.Mock).mockResolvedValue({
          isFile: () => false,
          isDirectory: () => true,
        });
        (fs.promises.readdir as jest.Mock).mockResolvedValue([
          {
            isFile: () => true,
            name: 'user.entity.json',
            parentPath: '/schemas',
            path: '/schemas',
          },
        ]);
        (fs.promises.readFile as jest.Mock).mockResolvedValue(
          '{"$schema": "https://origo.design/schemas/v1/entity.schema.json"}'
        );

        const mockValidateEntity = jest.fn().mockReturnValue(true);
        (BADLValidator as jest.Mock).mockImplementation(() => ({
          validateDomain: jest.fn(),
          validateEntity: mockValidateEntity,
          errors: null,
        }));

        const totalErrors = await validateDirectory('./schemas', { json: true });
        expect(totalErrors).toBe(0);
        expect(mockValidateEntity).toHaveBeenCalled();
      });

      it('reports errors when entity validation fails', async () => {
        (fs.promises.stat as jest.Mock).mockResolvedValue({
          isFile: () => false,
          isDirectory: () => true,
        });
        (fs.promises.readdir as jest.Mock).mockResolvedValue([
          {
            isFile: () => true,
            name: 'user.entity.json',
            parentPath: '/schemas',
            path: '/schemas',
          },
        ]);
        (fs.promises.readFile as jest.Mock).mockResolvedValue(
          '{"$schema": "https://origo.design/schemas/v1/entity.schema.json"}'
        );

        const mockValidateEntity = jest.fn().mockReturnValue(false);
        (BADLValidator as jest.Mock).mockImplementation(() => ({
          validateDomain: jest.fn(),
          validateEntity: mockValidateEntity,
          errors: [{ code: 'ENTITY_SCHEMA_ERROR', message: 'invalid entity' }],
        }));

        const totalErrors = await validateDirectory('./schemas', { json: true });
        expect(totalErrors).toBe(1);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ENTITY_SCHEMA_ERROR'));
      });
    });

    describe('validator initialization', () => {
      it('handles non-Error exceptions during validator instantiation', async () => {
        (fs.promises.stat as jest.Mock).mockResolvedValue({
          isFile: () => true,
          isDirectory: () => false,
        });

        // Temporarily break the BADLValidator mock to throw a string
        (BADLValidator as jest.Mock).mockImplementationOnce(() => {
          throw 'Init failure string';
        });

        await expect(
          validateDirectory('./schemas/single.json', { json: false })
        ).rejects.toMatchObject({
          code: 'ERR_VALIDATOR_INIT',
          message: expect.stringContaining('Init failure string'),
        });
      });
    });
  });
});
