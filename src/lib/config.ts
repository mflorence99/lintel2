import { ExtensionRuntime } from '@lib/types';

// 📘 common configuration settings
//    NOT designed to be user-settable

// 👇 we use immer patches for tracing while simulating
declare const lintelExtensionRuntime: ExtensionRuntime;

export class ConfigClass {
  debounceMillis = 250;

  delayMillis = {
    long: 1000,
    short: 100
  };

  logStateChanges = lintelExtensionRuntime === 'simulated';
}

export const config: Readonly<ConfigClass> = new ConfigClass();
