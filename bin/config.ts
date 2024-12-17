// 📘 common configuration settings
//    NOT designed to be user-settable

const root = Deno.cwd();

export class ConfigClass {
  debounceMillis = 250;

  paths = {
    'bin': `${root}/bin`,
    'extension-js': `${root}/dist/extension`,
    'extension-ts': `${root}/src/extension`,
    'lib': `${root}/src/lib`,
    'root': root,
    'tsconfig': `${root}/tsconfig-app.json`,
    'webview-js': `${root}/dist/webview`,
    'webview-ts': `${root}/src/webview`
  };

  pingPongMillis = 1000;

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
