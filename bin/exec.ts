#!/usr/bin/env -S deno run --allow-all

import { Task } from '~bin/tasks';

import { allTasksLookup } from '~bin/tasks';
import { cli } from '~bin/cli';
import { config } from '~bin/config';
import { debounce } from 'jsr:@std/async/debounce';
import { banner } from '~bin/logger';
import { log } from '~bin/logger';

import $ from '@david/dax';
import psList from 'ps-list';

// 📘 execute all tasks to build & test Lintel
//    eg: exec.ts -p -w -v stylelint prettier

const { taskNames, prod, tedious, verbose, watch } = await cli();

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

const run = async (todos: Task[]): Promise<void> => {
  for (const todo of todos) {
    try {
      // 👇 this looks pretty, but has no other function
      banner(todo.name);
      // 👇 could be a command
      const cmds = todo.cmds ?? [todo.cmd];
      for (const cmd of cmds) {
        if (cmd) {
          log({ important: todo.name, text: cmd });
          const plist = await psList();
          const existing = plist.find((p) => p.cmd === cmd);
          if (existing) await Deno.kill(existing.pid, 'SIGINT');
          const result = await $.raw`${cmd}`; // 🔥 `clean up syntax coloring`
          if (result.code !== 0) break;
        }
      }
      // 👇 could be a function
      if (todo.func) {
        log({ important: todo.name, text: 'function invoked' });
        await todo.kill?.();
        const result = await todo.func({ prod, tedious, verbose });
        if (!result) break;
      }
    } catch (e: any) {
      log({ error: true, data: e.message });
      if (!watch) Deno.exit(1);
    }
  }
};

// 👇 if in watch mode, lookout for changes and run todos

if (watch) {
  // 👇 consolidate the directories to watch
  const allWatchedDirs = Array.from(
    todos.reduce((acc, todo) => {
      for (const dir of todo.watchDirs ?? []) acc.add(dir);
      return acc;
    }, new Set<string>())
  );

  // 👇 setup a watcher for the consolidated watchDirs
  //    we'll run all the todos because after debouncing we
  //    don't really know what changed

  if (allWatchedDirs.length > 0) {
    const watcher = Deno.watchFs(allWatchedDirs);
    log({ important: 'watching for changes', data: allWatchedDirs });
    // 🔥 this hack trips the loop first time
    //    there'd better be a directory at the end of the list!!
    await $`touch ${allWatchedDirs.at(-1)}/.tickleme`;
    // 👇 create a debounced function that's invoked on changes
    const debounced = debounce(async (event) => {
      log({ important: 'changes detected', data: event.paths });
      await run(todos);
    }, config.debounceMillis);
    // 👇 then run it on each change
    for await (const event of watcher) {
      if (!['any', 'access'].includes(event.kind)) debounced(event);
    }
  }
}

// 👇 otherwise, just run the todos
else await run(todos);

// 👇 that's all she wrote!

Deno.exit(0);
