import { Command } from 'commander';
import { newCommand } from './new';
import { scaffoldProject } from '../lib/scaffolding';
import { handleError } from '../utils/errors';

jest.mock('../lib/scaffolding');
jest.mock('../utils/errors');

describe('newCommand', () => {
  let program: Command;
  let exitSpy: jest.SpyInstance;
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

    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
    jest.clearAllMocks();
  });

  afterEach(() => {
    exitSpy.mockRestore();
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

  it('should invoke handleError when scaffoldProject throws an error', async () => {
    const error = new Error('Scaffold failed');
    (scaffoldProject as jest.Mock).mockRejectedValueOnce(error);

    await program.parseAsync(['node', 'test', 'new', 'my-project']);
    expect(handleError).toHaveBeenCalledWith(error, { json: undefined });
  });
});
