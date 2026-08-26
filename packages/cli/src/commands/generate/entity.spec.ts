import { entityCommand } from './entity';
import { generateEntity } from '../../lib/generator';
import { handleError } from '../../utils/errors';
import { Command } from 'commander';

jest.mock('../../lib/generator');
jest.mock('../../utils/errors');

describe('entityCommand', () => {
  let program: Command;

  beforeEach(() => {
    jest.clearAllMocks();
    program = new Command();
    program.addCommand(entityCommand());
  });

  it('should parse arguments and call generateEntity', async () => {
    await program.parseAsync(['node', 'test', 'entity', 'User']);
    expect(generateEntity).toHaveBeenCalledWith('User', { force: undefined, json: undefined });
  });

  it('should parse --force and --json options', async () => {
    await program.parseAsync(['node', 'test', 'entity', 'User', '--force', '--json']);
    expect(generateEntity).toHaveBeenCalledWith('User', { force: true, json: true });
  });

  it('should call handleError on exception', async () => {
    const error = new Error('Test error');
    (generateEntity as jest.Mock).mockRejectedValue(error);

    await program.parseAsync(['node', 'test', 'entity', 'User']);
    expect(handleError).toHaveBeenCalledWith(error, { json: undefined });
  });
});
