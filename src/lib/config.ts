// 📘 common configuration settings
//    NOT designed to be user-settable

declare const lintelIsSimulated: boolean;

export class ConfigClass {
  debounceMillis = 250;

  delayMillis = {
    long: 1000,
    short: 100
  };

  logStateChanges = lintelIsSimulated;
}

export const config: Readonly<ConfigClass> = new ConfigClass();
