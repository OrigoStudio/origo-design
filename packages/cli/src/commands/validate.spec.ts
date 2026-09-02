import { Command } from 'commander';
import { validateCommand } from './validate';
import { validateDirectory } from '../lib/validation';
import { handleError, CliError } from '../utils/errors';

jest.mock('../lib/validation', () => ({
  validateDirectory: jest.fn(),
}));

jest.mock('../utils/errors', () => {
  const original = jest.requireActual('../utils/errors');
  return {
    ...original,
    handleError: jest.fn(),
  };
});

describe('validateCommand', () => {
  let program: Command;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    program = new Command();
    program.addCommand(validateCommand());
    process.exitCode = 0;
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    process.exitCode = 0;
  });

  it('calls validateDirectory with default arguments', async () => {
    (validateDirectory as jest.Mock).mockResolvedValue(0);

    await program.parseAsync(['node', 'test', 'validate']);

    expect(validateDirectory).toHaveBeenCalledWith('./schemas', { json: undefined });
  });

  it('calls validateDirectory with provided directory and json option', async () => {
    (validateDirectory as jest.Mock).mockResolvedValue(0);

    await program.parseAsync(['node', 'test', 'validate', './custom', '--json']);

    expect(validateDirectory).toHaveBeenCalledWith('./custom', { json: true });
  });

  it('sets process.exitCode to 1 if validateDirectory returns > 0', async () => {
    (validateDirectory as jest.Mock).mockResolvedValue(1);
    process.exitCode = 0;
    await program.parseAsync(['node', 'test', 'validate', '--json']);

    expect(process.exitCode).toBe(1);
  });

  it('sets process.exitCode to 1 and prints unified JSON if validateDirectory throws with --json', async () => {
    const error = new CliError({ code: 'ERR_TEST', message: 'Test error' });
    (validateDirectory as jest.Mock).mockRejectedValue(error);
    process.exitCode = 0;
    await program.parseAsync(['node', 'test', 'validate', '--json']);

    expect(process.exitCode).toBe(1);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"status": "error"'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ERR_TEST'));
  });

  it('handles non-CliError and non-Error objects being thrown with --json', async () => {
    (validateDirectory as jest.Mock).mockRejectedValue('String exception');
    process.exitCode = 0;
    await program.parseAsync(['node', 'test', 'validate', '--json']);

    expect(process.exitCode).toBe(1);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"status": "error"'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('UNKNOWN_ERROR'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('String exception'));
  });

  it('calls handleError if validateDirectory throws without --json', async () => {
    const error = new Error('Test error');
    (validateDirectory as jest.Mock).mockRejectedValue(error);
    process.exitCode = 0;
    await program.parseAsync(['node', 'test', 'validate']);

    expect(handleError).toHaveBeenCalledWith(error, { json: false });
    expect(process.exitCode).toBe(1);
  });
});
