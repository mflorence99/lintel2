import { effect } from '../types/signals';
import { storage } from './storage';

import { Signal } from '@lit-labs/signals';

import { config } from '@lib/config';
import { produce } from 'immer';
import { signal } from '@lit-labs/signals';

import StackTrace from 'stacktrace-js';

// 📘 base state class

export abstract class State<T> {
  // 👇 the signal that is the state itself
  model: Signal.State<T>;

  constructor(defaultState: T, key: string, persist: boolean) {
    if (persist) {
      this.model = signal<T>(storage.getItem(key) ?? defaultState);
      effect(() => storage.setItem(key, this.model.get()));
    } else this.model = signal<T>(defaultState);
  }

  mutate(mutator: (state: T) => void): void {
    // 👇 finding the caller is "expensive" so we feature flag logging
    let caller: string | undefined;
    if (config.logStateChanges) {
      const frame = StackTrace.getSync()[1];
      caller = frame.functionName;
    }
    // 👇 the "old" state
    const prevState = this.model.get();
    if (config.logStateChanges)
      console.log(
        '%c👈 prev state',
        'color: palegreen; text-decoration: line-through',
        caller,
        prevState
      );
    // 👇 the "new" state and (potentially) the patches that produced it
    const newState = produce(prevState, mutator, (patches) => {
      if (config.logStateChanges && patches)
        console.log(
          `%c🆕 patches... %c${caller} %c👉${JSON.stringify(patches)}`,
          'color: khaki',
          'color: white',
          'color: wheat'
        );
    });
    if (config.logStateChanges)
      console.log(
        '%c👉 next state',
        'color: skyblue',
        caller,
        newState
      );
    this.model.set(newState);
  }
}
