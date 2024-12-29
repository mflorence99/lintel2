import { State } from './state';

import { computed } from '@lib/signals';

// 📘 a conceptual model for real states
//    may morph into a real app-state

export interface AppStateModel {
  x: number;
  y: string;
  z: boolean;
}

export class AppState extends State<AppStateModel> {
  asJSON = computed(() => JSON.stringify(this.state.get()));

  incrementX(x: number): void {
    this.mutate((state) => void (state.x += x));
  }
}

// 🔥 TEMPORARY

export const appState = new AppState({
  x: 1000,
  y: '2000',
  z: false
});
