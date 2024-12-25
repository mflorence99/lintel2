import { storage } from './storage';

import { computed } from '@lib/signals';
import { effect } from '@lib/signals';
import { resource } from '@lib/signals';
import { signal } from '@lit-labs/signals';

const stateKey = 'my-state';

export const myState = signal(
  storage.getItem(stateKey) ?? {
    x: 1000,
    y: '2000'
  }
);

export const trigger = computed(() => ({ id: myState.get() }));

export const myStateJSON = computed(() => JSON.stringify(myState.get()));

export function xinc(): number {
  const state = myState.get();
  state.x += 1;
  myState.set({ ...state });
  return state.x;
}

effect(() => storage.setItem(stateKey, myState.get()));

resource({
  loader: () => fetch('http://localhost:8100'),
  // trigger: computed(() => myState.get())
  trigger: trigger
});
