import { appState } from '../state/app-state';

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

  constructor() {
    super();
    // 👇 hide the startup splash when we're good and ready
    delay(config.delayMillis.short).then(() =>
      this.classList.add('ready')
    );
  }

  override render(): TemplateResult {
    return html`
      <p>X is ${appState.state.get().x}</p>
      <p>Y is ${appState.state.get().y}</p>
      <button @click=${(): void => appState.incrementX(10)}>
        Increment
      </button>
      <br />
      <br />
      <br />
      <br />
      <br />
      <my-component .name=${'Mark'}></my-component>
    `;
  }
}
