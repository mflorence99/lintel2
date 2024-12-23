import { myState } from '../state/my-state';

import { LitElement } from 'lit';
import { SignalWatcher } from '@lit-labs/signals';
import { TemplateResult } from 'lit';

import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

// 📘 a test component

@customElement('my-component')
export class MyComponent extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  override render(): TemplateResult {
    return html`
      <p>X is ${myState.get().x}</p>
      <p>Y is ${myState.get().y}</p>
    `;
  }
}
