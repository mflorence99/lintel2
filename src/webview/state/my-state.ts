import { storage } from './storage';

import { effect } from '@lib/signals';
import { signal } from '@lit-labs/signals';

const stateKey = 'my-state';

export const myState = signal(
  storage.getItem(stateKey) ?? {
    x: 1000,
    y: '2000'
  }
);

export function xinc(): number {
  const state = myState.get();
  state.x += 1;
  myState.set({ ...state });
  return state.x;
}

effect(() => storage.setItem(stateKey, myState.get()));
