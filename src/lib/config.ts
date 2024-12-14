// 📘 common configuration settings
//    NOT designed to be user-settable

export class ConfigClass {
  debounceMillis = 250;
}

export const config: Readonly<ConfigClass> = new ConfigClass();
