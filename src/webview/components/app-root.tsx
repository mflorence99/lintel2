import { incrementX } from '../state/my-state';
import { myState } from '../state/my-state';

import { LitElement } from 'lit';
import { SignalWatcher } from '@lit-labs/signals';
import { TemplateResult } from 'lit';

import { config } from '@lib/config';
import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { delay } from '@lib/delay';
import { html } from 'lit';

// 📘 the whole enchilada

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}

@customElement('app-root')
export class AppRoot extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  // 👇 hide the startup splash when we're good and ready
  override firstUpdated(): void {
    delay(config.delayMillis.short).then(() =>
      this.classList.add('ready')
    );
  }

  override render(): TemplateResult {
    return html`
      <p>X is ${myState.get().x}</p>
      <p>Y is ${myState.get().y}</p>
      <button @click=${(): void => incrementX(10)}>Increment</button>
      <br />
      <br />
      <br />
      <br />
      <br />
      <my-component></my-component>
    `;
  }
}
