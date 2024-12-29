import { State } from './store';

import { initialize } from './store';
import { mutate } from './store';
import { serialize } from './store';

import { computed } from '@lib/signals';
import { effect } from '@lib/signals';

// 📘 a conceptual model for real states

// 👇 initial state

export interface MyState extends State {
  x: number;
  y: string;
  z: boolean;
}

const defaultState: MyState = {
  key: 'my-state',
  x: 1000,
  y: '2000',
  z: false
};

export const myState = initialize<MyState>(defaultState);

// 👇 save the state as it changes

effect(() => serialize<MyState>(myState.get()));

// 👇 some computed states

export const myStateJSON = computed(() =>
  JSON.stringify(myState.get())
);

// 👇 mutators

export function incrementX(x: number): void {
  mutate<MyState>(myState, (state: MyState) => void (state.x += x));
}
