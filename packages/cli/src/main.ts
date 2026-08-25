#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init';
import { newCommand } from './commands/new';
import { handleError } from './utils/errors';

export function createProgram(): Command {
  const program = new Command();

  program.name('origo').description('CLI for Origo Design').version('0.0.1');

  program.addCommand(initCommand());
  program.addCommand(newCommand());

  return program;
}

export function main() {
  const program = createProgram();

  program.parseAsync(process.argv).catch(handleError);
}

if (require.main === module) {
  main();
}
