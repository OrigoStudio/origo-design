import { Command } from 'commander';
import { newCommand } from './new';
import { scaffoldProject } from '../lib/scaffolding';
import { handleError } from '../utils/errors';

jest.mock('../lib/scaffolding');
jest.mock('../utils/errors');

describe('newCommand', () => {
  let program: Command;
  let errorSpy: jest.SpyInstance;
  let cmdInstance: Command;

  beforeEach(() => {
    program = new Command();
    cmdInstance = newCommand();
    cmdInstance.exitOverride();
    cmdInstance.configureOutput({ writeErr: jest.fn() });
    program.addCommand(cmdInstance);
    program.exitOverride();
    program.configureOutput({ writeErr: jest.fn() });

    errorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
    jest.clearAllMocks();
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('should require a project name via Commander argument contract', async () => {
    await expect(program.parseAsync(['node', 'test', 'new'])).rejects.toThrow();
    expect(scaffoldProject).not.toHaveBeenCalled();
  });

  it('should call scaffoldProject with project name', async () => {
    await program.parseAsync(['node', 'test', 'new', 'my-project']);
    expect(scaffoldProject).toHaveBeenCalledWith('my-project', { json: undefined });
  });

  it('should pass json option to scaffoldProject when --json flag is provided', async () => {
    await program.parseAsync(['node', 'test', 'new', 'my-project', '--json']);
    expect(scaffoldProject).toHaveBeenCalledWith('my-project', { json: true });
  });

  it('should invoke handleError and set process.exitCode to 1 when scaffoldProject throws an error', async () => {
    const error = new Error('Scaffold failed');
    (scaffoldProject as jest.Mock).mockRejectedValueOnce(error);
    process.exitCode = 0;
    await program.parseAsync(['node', 'test', 'new', 'my-project']);
    expect(handleError).toHaveBeenCalledWith(error, { json: undefined });
    expect(process.exitCode).toBe(1);
  });
});
