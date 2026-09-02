import { CliError, handleError } from './errors';

describe('errors utils', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('CliError', () => {
    it('creates an error with code and context', () => {
      const error = new CliError({
        code: 'ERR_TEST',
        message: 'test message',
        context: { foo: 'bar' },
        cause: new Error('root cause'),
      });

      expect(error.name).toBe('CliError');
      expect(error.code).toBe('ERR_TEST');
      expect(error.message).toBe('test message');
      expect(error.context).toEqual({ foo: 'bar' });
      expect(error.cause).toBeInstanceOf(Error);
    });
  });

  describe('handleError', () => {
    describe('with options.json = true', () => {
      const options = { json: true };

      it('formats CliError as JSON', () => {
        const error = new CliError({
          code: 'ERR_JSON',
          message: 'json error message',
          context: { line: 10 },
        });

        handleError(error, options);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          JSON.stringify(
            {
              error: {
                code: 'ERR_JSON',
                message: 'json error message',
                context: { line: 10 },
              },
            },
            null,
            2
          )
        );
      });

      it('formats standard Error as JSON with UNEXPECTED_ERROR code', () => {
        const error = new Error('standard error message');

        handleError(error, options);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          JSON.stringify(
            {
              error: {
                code: 'UNEXPECTED_ERROR',
                message: 'standard error message',
              },
            },
            null,
            2
          )
        );
      });

      it('formats non-Error (unknown) as JSON with UNKNOWN_ERROR code', () => {
        const error = 'just a string error';

        handleError(error, options);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          JSON.stringify(
            {
              error: {
                code: 'UNKNOWN_ERROR',
                message: 'just a string error',
              },
            },
            null,
            2
          )
        );
      });
    });

    describe('with options.json = false (or undefined)', () => {
      it('formats CliError as plain text without context', () => {
        const error = new CliError({
          code: 'ERR_PLAIN',
          message: 'plain message',
        });

        handleError(error);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error [ERR_PLAIN]: plain message');
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      });

      it('formats CliError as plain text with context', () => {
        const error = new CliError({
          code: 'ERR_CTX',
          message: 'context message',
          context: { detail: 'value' },
        });

        handleError(error);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error [ERR_CTX]: context message');
        expect(consoleErrorSpy).toHaveBeenCalledWith(JSON.stringify({ detail: 'value' }, null, 2));
      });

      it('formats standard Error as plain text', () => {
        const error = new Error('standard error');

        handleError(error);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected Error: standard error');
      });

      it('formats non-Error as plain text', () => {
        const error = 404;

        handleError(error);

        expect(consoleErrorSpy).toHaveBeenCalledWith('An unknown error occurred.');
      });
    });
  });
});
