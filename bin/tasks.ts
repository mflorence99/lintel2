import { config } from './config.ts';
import { esbuild } from './esbuild.ts';
import { kill as simulatorKill } from './simulator/simulator.ts';
import { simulator } from './simulator/simulator.ts';

// 📘 define all the tasks we can perform

class TaskClass {
  cmd?: string;
  cmds?: string[];
  description: string = '';
  func?: (args?: any) => Promise<void>;
  // 🔥 NOTE: kill only works for functions, not cmd or cmds
  kill?: () => Promise<void>;
  name: string;
  // 🔥 crap - Deno typing makes us do it this way
  subTasks?: (string | number)[];
  watchDir?: string;

  constructor(props: Task) {
    Object.assign(this, props);
  }
}

export interface Task extends TaskClass {}

// 👇 all the tasks we can perform

export const allTasks = [
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
    func: ({ prod, verbose }) =>
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
    func: () => simulator({ dir: config.paths['webview-js'] }),
    kill: () => simulatorKill(),
    watchDir: config.paths['bin']
  }),

  new TaskClass({
    name: 'stylelint',
    description: 'Validate styles for CSS files and those embedded in TSX',
    cmd: `npx stylelint --fix "${config.paths['webview-ts']}/**/*.{css,tsx}"`
  })
];

export const allTasksLookup: Record<string, Task> = allTasks.reduce(
  (acc, task) => {
    acc[task.name] = task;
    return acc;
  },
  {}
);
