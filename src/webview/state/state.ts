import { storage } from './storage';

import { Signal } from '@lit-labs/signals';

import { config } from '@lib/config';
import { effect } from '@lib/signals';
import { enablePatches } from 'immer';
import { produce } from 'immer';
import { signal } from '@lit-labs/signals';

import StackTrace from 'stacktrace-js';

// 👇 we use immer patches for tracing while simulating

declare const lintelIsSimulated: boolean;
if (lintelIsSimulated) enablePatches();

// 📘 base state class

export abstract class State<T> {
  persist = true;
  persistKey = this.constructor.name;
  state: Signal.State<T>;

  constructor(defaultState: T) {
    if (this.persist) {
      this.state = signal<T>(
        storage.getItem(this.persistKey) ?? defaultState
      );
      effect(() => storage.setItem(this.persistKey, this.state.get()));
    } else this.state = signal<T>(defaultState);
  }

  mutate(mutator: (state: T) => void): void {
    // 👇 finding the caller is "expensive" so we feature flag logging
    let caller: string | undefined;
    if (config.logStateChanges) {
      const frame = StackTrace.getSync()[1];
      caller = frame.functionName;
    }
    // 👇 the "old" state
    const oldState = this.state.get();
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
    this.state.set(newState);
  }
}
