import { LitElement } from 'lit';

import { customElement } from 'lit/decorators.js';
import { nextTick } from '@lib/delay';

// 📘 the whole enchilada

@customElement('app-root')
export class AppRoot extends LitElement {
  // 👇 hide the startup splash when we're good and ready
  override firstUpdated(): void {
    nextTick().then(() => this.classList.add('ready'));
  }
}

// declare global {
//   interface HTMLElementTagNameMap {
//     'app-root': AppRoot;
//   }
// }
