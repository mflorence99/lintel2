export * from '~extension/initializer';

import { ExtensionAPI } from '~extension/types/api';
import { Message } from '~lib/types/messages';

import { initialize } from '~extension/initializer';

declare const lintelExtensionAPI: ExtensionAPI;

// 🔥 we assume that the API has been established by some
//    earlier code that loads this bundle -- ATM only
//    the simulator does this

// 👇 just a shortcut
const api: ExtensionAPI = lintelExtensionAPI;

// 🔥 TEMPORARY dispatch on command

api.onDidReceiveMessage = async (message: Message): Promise<void> => {
  try {
    switch (message.command) {
      case 'initialize':
        // await initialize(api);
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
