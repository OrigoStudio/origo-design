import { Command, CommanderError } from 'commander';
import { pageCommand } from './page';
import { generatePage } from '../../lib/generator';

jest.mock('../../lib/generator', () => ({
  generatePage: jest.fn(),
}));

describe('pageCommand', () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = process.argv;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('should call generatePage with list-detail template', async () => {
    const cmd = new Command();
    cmd.exitOverride();
    cmd.addCommand(pageCommand());
    await cmd.parseAsync(['node', 'test', 'page', '--template', 'list-detail', 'Users']);

    expect(generatePage).toHaveBeenCalledWith('list-detail', 'Users', {
      force: undefined,
      json: undefined,
    });
  });

  it('should call generatePage with login template', async () => {
    const cmd = new Command();
    cmd.exitOverride();
    cmd.addCommand(pageCommand());
    await cmd.parseAsync(['node', 'test', 'page', '--template', 'login', 'Auth']);

    expect(generatePage).toHaveBeenCalledWith('login', 'Auth', {
      force: undefined,
      json: undefined,
    });
  });

  it('should throw CommanderError on invalid template', async () => {
    const cmd = new Command();
    const pCmd = pageCommand();
    pCmd.exitOverride();
    pCmd.configureOutput({ writeErr: jest.fn() });
    cmd.addCommand(pCmd);

    await expect(
      cmd.parseAsync(['node', 'test', 'page', '--template', 'invalid', 'Users'])
    ).rejects.toThrow(CommanderError);
  });
});
