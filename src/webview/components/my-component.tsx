import { myStateJSON } from '../state/my-state';

import { LitElement } from 'lit';
import { SignalWatcher } from '@lit-labs/signals';
import { TemplateResult } from 'lit';

import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { state } from 'lit/decorators.js';

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

  @property() accessor name = 'Bob';

  @state() accessor #job = 'dishwasher';

  override render(): TemplateResult {
    return html`
      <p>As JSON ${myStateJSON.get()}</p>
      <br />
      <br />
      <p>My name is ${this.name} and I am a ${this.#job}</p>
    `;
  }
}
