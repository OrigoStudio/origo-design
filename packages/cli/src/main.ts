#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init';
import { newCommand } from './commands/new';
import { validateCommand } from './commands/validate';
import { generateCommand } from './commands/generate';
import { handleError } from './utils/errors';

export function createProgram(): Command {
  const program = new Command();

  program.name('origo').description('CLI for Origo Design').version('0.0.1');

  program.addCommand(initCommand());
  program.addCommand(newCommand());
  program.addCommand(validateCommand());
  program.addCommand(generateCommand());

  return program;
}

export function main() {
  const program = createProgram();

  program.parseAsync(process.argv).catch(err => {
    try {
      handleError(err);
    } catch (e) {
      console.error('Fatal error in error handler:', e);
    } finally {
      process.exit(1);
    }
  });
}

if (require.main === module) {
  main();
}
