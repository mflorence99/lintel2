import { ParseOptions } from '@std/cli/parse-args';

import { allTasks } from './tasks.ts';
import { allTasksLookup } from './tasks.ts';
import { config } from './config.ts';
import { flattenObject } from './flatten.ts';
import { log } from './logger.ts';
import { parseArgs } from '@std/cli/parse-args';

import $ from '@david/dax';

// 📘 handle the details of the CLI

export type ParsedArgs = {
  _: string[];
  taskNames: string[];
  help: boolean;
  prod: boolean;
  verbose: boolean;
  watch: boolean;
};

interface ExtendedParseOptions extends ParseOptions {
  description: Record<string, string>;
}

// 🔥 note: none of the validation will work if we introduce
//    non-boolean options, or options without aliases

const parseOptions: ExtendedParseOptions = {
  alias: { h: ['help'], p: ['prod'], v: ['verbose'], w: ['watch'] },
  boolean: ['help', 'prod', 'verbose', 'watch'],
  default: { help: false, prod: false, verbose: false, watch: false },
  description: {
    h: 'Show this help information',
    p: 'Build for production',
    v: 'Explain what is being done',
    w: 'Run eligible tasks in watch mode'
  },
  negatable: ['prod', 'watch']
};

// 👇 launch the cli

export async function cli(): Promise<ParsedArgs> {
  // 👉 we need to process the args as a whole so we can't deconstruct
  const parsedArgs: ParsedArgs = parseArgs(Deno.args, parseOptions);
  parsedArgs.taskNames = parsedArgs._;

  // 👇 log help data if requested

  if (parsedArgs.help) {
    logUsage();
    Deno.exit(0);
  }

  // 👇 log no tasks error

  if (parsedArgs.taskNames.length === 0) {
    logNoop();
    Deno.exit(0);
  }

  // 👇 validate the requested options

  const allOptionsSet = new Set([
    ...Object.keys(parseOptions.alias),
    ...Object.values(parseOptions.alias).flat()
  ]);
  const invalidArgs = Object.keys(parsedArgs)
    .filter((flag) => !Array.isArray(parsedArgs[flag]))
    .filter((flag) => !allOptionsSet.has(flag));
  if (invalidArgs.length > 0) {
    logUsage(`Unknown option(s) '${invalidArgs}' specified`);
    Deno.exit(1);
  }

  // 👇 validate the requested tasks

  const allTaskNamesSet = new Set(Object.keys(allTasksLookup));
  const invalidTasks = parsedArgs.taskNames.filter(
    (taskName) => !allTaskNamesSet.has(taskName)
  );
  if (invalidTasks.length > 0) {
    logUsage(`Unknown task(s) '${invalidTasks}' requested`);
    Deno.exit(1);
  }

  // 👇 validate all the paths in the config

  const failures = [];
  for (const path of Object.values(config.paths)) {
    try {
      Deno.statSync(path);
    } catch (_) {
      failures.push(path);
    }
  }

  if (failures.length > 0) {
    failures.forEach((failure) =>
      log({ warning: true, important: failure, text: 'not found!' })
    );
  }

  // 👇 echo the config

  if (parsedArgs.verbose) {
    Object.entries(flattenObject(config)).forEach((entry) =>
      log({ important: `${entry[0]}`, text: `${entry[1]}` })
    );
    log({ data: parsedArgs, important: 'args' });
  }

  // 👇 confirm production mode

  if (parsedArgs.prod) {
    const result = await $.confirm({
      message: 'Production mode requested. Are you sure? [yN]',
      default: false
    });
    if (!result) Deno.exit(1);
  }

  return parsedArgs;
}

// 👇 log abbreviated help if no tasks specified
//    patterned after Linux behavior for cp etc

function logNoop(): void {
  console.log(`
exec.ts: no tasks specified
try 'exec.ts --help' for more information.
    `);
}

// 👇 log the CLI help data

function logUsage(msg = ''): void {
  console.log(`${msg}
Usage: exec.ts [OPTION]... TASK...

OPTIONS
-------
${logUsageOptions()}

TASKS
-----
${logUsageTasks()}

    `);
}

// 🔥 we can do better than thde magic "pad" numbers
//    but all this is already overkill!

function logUsageOptions(): string {
  return Object.entries(parseOptions.alias)
    .reduce((acc, [flag, aliases]) => {
      const k = `-${flag}, --${aliases}`.padEnd(20);
      const v = `${parseOptions.description[flag]}`;
      return `${acc}${k}${v}\n`;
    }, '')
    .trim();
}

function logUsageTasks(): string {
  return allTasks
    .reduce((acc, task) => {
      const k = task.name.padEnd(20);
      const v = task.description.padEnd(50);
      const w = task.watchDir ? '(watchable)' : '';
      return `${acc}${k}${v}${w}\n`;
    }, '')
    .trim();
}
