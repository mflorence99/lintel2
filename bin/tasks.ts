#!/usr/bin/env -S deno run --allow-all

import { config } from './config.ts';
import { debounce } from 'jsr:@std/async/debounce';
import { esbuild } from './esbuild.ts';
import { log } from './logger.ts';
import { parseArgs } from '@std/cli/parse-args';
import { simulator } from './simulator/simulator.ts';

import $ from '@david/dax';
import figlet from 'figlet';
import process from 'node:process';

class TaskClass {
  cmd?: string;
  cmds?: string[];
  description: string = '';
  func?: () => Promise<any>;
  name: string;
  // 🔥 crao - Deno typing makes us do it this way
  subTasks?: (string | number)[];
  watchDir?: string;

  constructor(props: Task) {
    Object.assign(this, props);
  }
}

interface Task extends TaskClass {}

// 📘 execute all tasks to build & test Lintel
//    eg: tasks.ts -p -w -v stylelint prettier

const {
  _: taskNames,
  prod,
  verbose,
  watch
} = parseArgs(Deno.args, {
  alias: { p: ['prod'], v: ['verbose'], w: ['watch'] },
  boolean: ['prod', 'verbose', 'watch'],
  default: { prod: false, verbose: false, watch: false },
  negatable: ['prod', 'watch']
});

// 👇 confirm production mode

if (prod) {
  const result = await $.confirm({
    message: 'Poduction mode requested. Are you sure? [yN]',
    default: false
  });
  if (!result) process.exit(1);
}

// 👇 these are all the tasks we can perform

const allTasks = [
  new TaskClass({
    name: 'bundle:webview',
    description: 'Fully bundle webview',
    cmds: [
      `mkdir -p ${config.paths['webview-js']}`,
      `cp ${config.paths['webview-ts']}/index.html ${config.paths['webview-js']}/`,
      `cp -r ${config.paths['webview-ts']}/assets ${config.paths['webview-js']}`
    ],
    subTasks: ['compile:webview', 'esbuild:webview'],
    watchDir: config.paths['webview-ts']
  }),

  new TaskClass({
    name: 'clean:extension',
    description: 'Remove all files from extension dist',
    cmds: [
      `rm -rf ${config.paths['extension-js']}`,
      `mkdir ${config.paths['extension-js']}`
    ]
  }),

  new TaskClass({
    name: 'clean:webview',
    description: 'Remove all files from webview dist',
    cmds: [
      `rm -rf ${config.paths['webview-js']}`,
      `mkdir ${config.paths['webview-js']}`
    ]
  }),

  new TaskClass({
    name: 'compile:extension',
    description: 'Test compile extension without emitting JS',
    cmd: `npx tsc --noEmit -p ${config.paths['extension-ts']}`
  }),

  new TaskClass({
    name: 'compile:webview',
    description: 'Test compile webview without emitting JS',
    cmd: `npx tsc --noEmit --jsx preserve -p ${config.paths['webview-ts']}`
  }),

  new TaskClass({
    name: 'denolint',
    description: 'Lint bin code with Deno',
    cmd: `deno lint ${config.paths.bin}`
  }),

  new TaskClass({
    name: 'esbuild:webview',
    description: 'Bundle webview with esbuild',
    func: () =>
      esbuild({
        bundle: `${config.paths['webview-js']}/bundle.js`,
        prod: !!prod,
        verbose: !!verbose,
        root: `${config.paths['webview-ts']}/index.ts`,
        tsconfig: config.paths.tsconfig
      }),
    watchDir: config.paths['webview-ts']
  }),

  new TaskClass({
    name: 'eslint',
    description: 'Lint extension, lib, and webview code with eslint',
    cmd: `npx eslint ${config.paths['extension-ts']} ${config.paths['lib']} ${config.paths['webview-ts']}`
  }),

  new TaskClass({
    name: 'lint',
    description: 'Lint all code using all available linters',
    subTasks: ['eslint', 'lit-analyzer', 'denolint']
  }),

  new TaskClass({
    name: 'lit-analyzer',
    description: 'Lint webview code using lit-analyzer',
    cmd: `npx lit-analyzer ${config.paths['webview-ts']}`
  }),

  new TaskClass({
    name: 'prettier',
    description: 'Format all code using prettier',
    cmd: `npx prettier --write ${config.paths.root}`
  }),

  new TaskClass({
    name: 'simulator',
    description: 'Run the webview simulator',
    func: () => simulator({ dir: config.paths['webview-js'] })
  }),

  new TaskClass({
    name: 'stylelint',
    description: 'Validate styles for CSS files and those embedded in TSX',
    cmd: `npx stylelint --fix "${config.paths['webview-ts']}/**/*.{css,tsx}"`
  })
];

const allTasksLookup: Record<string, Task> = allTasks.reduce((acc, task) => {
  acc[task.name] = task;
  return acc;
}, {});

// 👇 validate the config

const failures = [];
for (const path of Object.values(config.paths)) {
  try {
    await $`test -e ${path}`;
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

if (verbose) {
  Object.entries(flattenObject(config)).forEach((entry) =>
    log({ important: `${entry[0]}`, text: `${entry[1]}` })
  );
  log({ data: { taskNames, prod, watch }, important: 'args' });
}

// 👇 validate the requested tasks

const allTaskNamesSet = new Set(Object.keys(allTasksLookup));
const isTasksValid = taskNames.every((taskName: any) =>
  allTaskNamesSet.has(taskName)
);
if (!isTasksValid) {
  log({ data: taskNames, error: true, text: 'one or more unknown tasks' });
  log({ warning: true, text: 'valid tasks are:' });
  allTasks.forEach((task) =>
    log({ important: task.name, text: task.description })
  );
  process.exit(1);
}

// 👇 flatten all the tasks and their subtasks into a sequense of todos

const reducer = (taskNames: (string | number)[]): Task[] => {
  return taskNames.reduce((acc, taskName) => {
    const task = allTasksLookup[taskName];
    acc.push(task);
    if (task.subTasks) acc.push(...reducer(task.subTasks));
    return acc;
  }, []);
};

const todos: Task[] = reducer(taskNames);

// 👇 this closure will run each requested task

const run = async (todos: Task[]) => {
  for (const todo of todos) {
    try {
      // 👇 this looks pretty, but has no other function
      figletize(todo.name);
      // 👇 could be a command
      const cmds = todo.cmds ?? [todo.cmd];
      for (const cmd of cmds) {
        if (cmd) {
          log({ important: todo.name, text: cmd });
          await $.raw`${cmd}`; // 🔥 `clean up syntax coloring ???`
        }
      }
      // 👇 could be a function
      if (todo.func) {
        log({ important: todo.name });
        await todo.func();
      }
    } catch (e: any) {
      log({ error: true, data: e });
      process.exit(1);
    }
  }
};

// 👇 run the tasks first time

await run(todos);

// 👇 if in watch mode, lookout for changes and rerun tasks

if (watch) {
  // 👇 consolidate todos by their watchDir
  const watchedByDir = todos
    .filter((todo) => todo.watchDir)
    .reduce((acc, todo) => {
      if (!acc[todo.watchDir]) acc[todo.watchDir] = [todo];
      else acc[todo.watchDir].push(todo);
      return acc;
    }, {});

  // 👇 setup a watcher for each distinct watchDir
  //    and rerun the associated todos on when anything in it changes

  const watchDirs = Object.keys(watchedByDir);
  for (const watchDir of watchDirs) {
    const todos = watchedByDir[watchDir];
    const watcher = Deno.watchFs(watchDir);
    $.progress(`watching for changes in ${watchDir}`);
    // 👇 create a debounced function that's invoked on changes
    const debounced = debounce(async (_) => {
      log({ important: 'changes detected', text: watchDir });
      await run(todos);
    }, config.debounceMillis);
    // 👇 then run it on each change
    for await (const event of watcher) debounced(event);
  }
}

// 👇 that's all she wrote!

process.exit(0);

// =======================================================================

function figletize(str: string): void {
  console.log(
    `%c${figlet.textSync(str.toUpperCase(), {
      font: 'Small',
      horizontalLayout: 'fitted'
    })}`,
    'color: cyan'
  );
}

// 📘 see: https://www.30secondsofcode.org/js/s/flatten-unflatten-object/

function flattenObject(obj, delimiter = '.', prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? `${prefix}${delimiter}` : '';
    if (
      typeof obj[k] === 'object' &&
      obj[k] !== null &&
      Object.keys(obj[k]).length > 0
    )
      Object.assign(acc, flattenObject(obj[k], delimiter, pre + k));
    else acc[pre + k] = obj[k];
    return acc;
  }, {});
}
