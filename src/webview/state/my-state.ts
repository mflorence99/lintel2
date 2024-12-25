import { storage } from './storage';

import { computed } from '@lib/signals';
import { effect } from '@lib/signals';
import { signal } from '@lit-labs/signals';

const stateKey = 'my-state';

// 👇 initial state

export const myState = signal(
  storage.getItem(stateKey) ?? {
    x: 1000,
    y: '2000'
  }
);

// 👇 save the state as it changes

effect(() => storage.setItem(stateKey, myState.get()));

// 👇 some computed states

export const myStateJSON = computed(() => JSON.stringify(myState.get()));

// 👇 mutators

export function xinc(): number {
  const state = myState.get();
  state.x += 1;
  myState.set({ ...state });
  return state.x;
}
