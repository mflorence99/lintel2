import { storage } from './storage';

import { Signal } from '@lit-labs/signals';

import { config } from '@lib/config';
import { enablePatches } from 'immer';
import { produce } from 'immer';
import { signal } from '@lit-labs/signals';

import StackTrace from 'stacktrace-js';

// 📘 store-like functions for states

export type MutatorFn<T extends State> = (state: T) => T | undefined;

export interface State {
  readonly key: string;
}

// 👇 we use immer patches for tracing while simulating

declare const lintelIsSimulated: boolean;
if (lintelIsSimulated) enablePatches();

// 👇 initialize the state

export function initialize<T extends State>(
  defaultState: State
): Signal.State<T> {
  return signal<T>(storage.getItem(defaultState.key) ?? defaultState);
}

// 👇 mutate the state

export function mutate<T extends State>(
  signal: Signal.State<T>,
  mutator: MutatorFn<T>
): void {
  // 👇 finding the caller is "expensive" so we feature flag logging
  let caller: string | undefined;
  if (config.logStateChanges) {
    const frame = StackTrace.getSync()[1];
    caller = frame.functionName;
  }
  // 👇 the "old" state
  const oldState = signal.get();
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
  signal.set(newState);
}

// 👇 serialize the state

export function serialize<T extends State>(state: T): void {
  storage.setItem(state.key, state);
}
