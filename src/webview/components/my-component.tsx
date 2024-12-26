import { myStateJSON } from '../state/my-state';

import { LitElement } from 'lit';
import { SignalWatcher } from '@lit-labs/signals';
import { TemplateResult } from 'lit';

import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

// 📘 a test component

declare global {
  interface HTMLElementTagNameMap {
    'my-component': MyComponent;
  }
}

@customElement('my-component')
export class MyComponent extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  override render(): TemplateResult {
    return html`
      <p>As JSON ${myStateJSON.get()}</p>
    `;
  }
}
