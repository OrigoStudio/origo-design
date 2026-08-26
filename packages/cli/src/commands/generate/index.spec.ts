import { generateCommand } from './index';
import { ejectTemplates } from '../../lib/generator';
import { handleError } from '../../utils/errors';
import { Command } from 'commander';

jest.mock('../../lib/generator');
jest.mock('../../utils/errors');
jest.mock('./entity', () => {
  const { Command } = require('commander');
  return {
    entityCommand: jest.fn().mockReturnValue(new Command('entity')),
  };
});

describe('generateCommand', () => {
  let program: Command;

  beforeEach(() => {
    jest.clearAllMocks();
    program = new Command();
    program.addCommand(generateCommand());
  });

  it('should parse --eject and call ejectTemplates', async () => {
    await program.parseAsync(['node', 'test', 'generate', '--eject']);
    expect(ejectTemplates).toHaveBeenCalledWith({ json: undefined });
  });

  it('should parse --eject --json', async () => {
    await program.parseAsync(['node', 'test', 'generate', '--eject', '--json']);
    expect(ejectTemplates).toHaveBeenCalledWith({ json: true });
  });

  it('should call handleError on exception', async () => {
    const error = new Error('Test error');
    (ejectTemplates as jest.Mock).mockRejectedValue(error);

    await program.parseAsync(['node', 'test', 'generate', '--eject']);
    expect(handleError).toHaveBeenCalledWith(error, { json: undefined });
  });
});
