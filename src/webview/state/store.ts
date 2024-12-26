import { storage } from './storage';

import { Signal } from '@lit-labs/signals';

import { produce } from 'immer';
import { signal } from '@lit-labs/signals';

// 📘 store-like functions for states

export type MutatorFn<T extends State> = (state: T) => T;

export interface State {
  readonly key: string;
}

// 👇 just enough for now!

export function initialize<T extends State>(
  defaultState: State
): Signal.State<T> {
  return signal<T>(storage.getItem(defaultState.key) ?? defaultState);
}

export function mutate<T extends State>(
  signal: Signal.State<T>,
  mutator: MutatorFn<T>
): void {
  signal.set(produce(signal.get(), mutator));
}

export function serialize<T extends State>(
  signal: Signal.State<T>
): void {
  const state = signal.get();
  storage.setItem<T>(state.key, state);
}
