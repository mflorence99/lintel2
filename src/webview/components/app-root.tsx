import { LitElement } from 'lit';

import { config } from '@lib/config';
import { customElement } from 'lit/decorators.js';
import { delay } from '@lib/delay';

// 📘 the whole enchilada

@customElement('app-root')
export class AppRoot extends LitElement {
  // 👇 hide the startup splash when we're good and ready
  override firstUpdated(): void {
    delay(config.delayMillis.short).then(() => this.classList.add('ready'));
  }
}

// declare global {
//   interface HTMLElementTagNameMap {
//     'app-root': AppRoot;
//   }
// }
