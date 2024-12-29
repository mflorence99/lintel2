import { storage } from './storage';

import { Signal } from '@lit-labs/signals';

import { config } from '@lib/config';
import { effect } from '@lib/signals';
import { produce } from 'immer';
import { signal } from '@lit-labs/signals';

import StackTrace from 'stacktrace-js';

declare const lintelIsSimulated: boolean;

// 📘 base state class

export abstract class State<T> {
  // 👇 the signal that is the state itself
  model: Signal.State<T>;

  constructor(defaultState: T, persist = true) {
    if (persist) {
      this.model = signal<T>(
        storage.getItem(this.constructor.name) ?? defaultState
      );
      effect(() =>
        storage.setItem(this.constructor.name, this.model.get())
      );
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
    const oldState = this.model.get();
    if (config.logStateChanges)
      console.log('%cold state', 'color: palegreen', caller, oldState);
    // 👇 the "new" state and (potentially) the patches that produced it
    const newState = produce(oldState, mutator, (patches) => {
      if (config.logStateChanges && patches)
        console.log(
          `%cold ⇨ new %c${caller} %c👉${JSON.stringify(patches)}`,
          'color: khaki',
          'color: white',
          'color: wheat'
        );
    });
    if (config.logStateChanges)
      console.log('%cnew state', 'color: skyblue', caller, newState);
    this.model.set(newState);
  }
}
