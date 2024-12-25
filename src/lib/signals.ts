import { Signal } from '@lit-labs/signals';

import { effect as subtleEffect } from 'signal-utils/subtle/microtask-effect';

// 📘 let's pretend we have first-order signal functions
//    that lit-signal doesn't yet provide

export function computed<T>(computation: () => T): Signal.State<T> {
  // @ts-ignore
  return new Signal.Computed<T>(computation);
}

export const effect = subtleEffect;

type ResourceLoader<T, R> = (param: R) => PromiseLike<T>;

type ResourceOptions<T, R> = {
  loader: ResourceLoader<T, R>;
  trigger: Signal.State<R>;
};

export function resource<T, R>({
  loader,
  trigger
}: ResourceOptions<T, R>): Signal.State<T | undefined> {
  const signal = new Signal.State<T | undefined>(undefined);
  const watcher = new Signal.subtle.Watcher(async () => {
    // @ts-ignore
    const result = await loader(null);
    signal.set(result);
    watcher.watch();
  });
  watcher.watch(trigger);
  return signal;
}
