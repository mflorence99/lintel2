import { Signal } from '@lit-labs/signals';

import { effect as subtleEffect } from 'signal-utils/subtle/microtask-effect';

// 📘 let's pretend we have first-order signal functions
//    that lit-signal doesn't yet provide

export const computed = Signal.Computed;

export const effect = subtleEffect;
