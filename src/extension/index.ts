export * from './initialize';

import { ExtensionAPI } from './api';

import { initialize } from './initialize';

import { Message } from '@lib/messages';

// 📘 constants potentially set by simulator

const isSimulated: boolean =
  // @ts-ignore
  globalThis.lintelIsSimulated ?? false;

const api: ExtensionAPI =
  // @ts-ignore
  globalThis.lintelExtensionAPI ?? {};

// 📘 if simulating, dispatch on command

if (isSimulated) {
  api.onDidReceiveMessage = (message: Message): void => {
    switch (message.command) {
      case 'initialize':
        initialize(api);
        break;
      default:
        api.log({
          warning: true,
          text: 'unrecognized',
          data: message
        });
    }
  };
}
