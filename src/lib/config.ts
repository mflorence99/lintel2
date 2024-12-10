// 📘 common configuration settings
//    NOT designed to be user-settable

export class ConfigClass {
  debounceMillis = 250;

  log = {
    color: {
      cmd: 'yellow',
      data: 'pink',
      text: 'white',
      ts: 'green'
    }
  };

  simulator = {
    http: {
      port: 8100
    },
    ws: {
      port: 8101
    }
  };
}

export const config: Readonly<ConfigClass> = new ConfigClass();
