export * from './initialize';

import { ExtensionAPI } from './api';
import { ExtensionEnv } from './env';

import { initialize } from './initialize';

import { Message } from '@lib/messages';

import process from 'node:process';
import tmp from 'tmp';

tmp.setGracefulCleanup();

// 📘 constants potentially set by simulator

const isSimulated: boolean =
  // @ts-ignore
  globalThis.lintelIsSimulated ?? false;

const api: ExtensionAPI =
  // @ts-ignore
  globalThis.lintelExtensionAPI ?? {};

const env: ExtensionEnv = {
  cwd: process.cwd(),
  tmpDir: tmp.dirSync().name
};

// 📘 if simulating, dispatch on command

if (isSimulated) {
  api.onDidReceiveMessage = async (message: Message): Promise<void> => {
    // 🔥 TEMPORARY
    try {
      switch (message.command) {
        case 'initialize':
          await initialize(api, env);
          break;
        default:
          api.log({
            warning: true,
            text: 'unrecognized',
            data: message
          });
      }
    } catch (e: any) {
      api.log({ error: true, text: e.message });
    }
  };
}
