import { ExtensionAPI } from './api';

import { config } from '@lib/config';

export function initialize(api: ExtensionAPI): void {
  api.log({ text: 'initializing', data: config });
}
