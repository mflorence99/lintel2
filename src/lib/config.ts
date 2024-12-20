// 📘 common configuration settings
//    NOT designed to be user-settable

export class ConfigClass {
  debounceMillis = 250;

  delayMillis = {
    long: 1000,
    short: 100
  };
}

export const config: Readonly<ConfigClass> = new ConfigClass();
