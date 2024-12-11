import { LitElement } from 'lit';
import { TemplateResult } from 'lit';

import { config } from '@lib/config';
import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('app-root')
export class AppRoot extends LitElement {
  static override styles = css`
    :host {
      background-color: black;
      color: white;
      display: block;
      height: 100%;
      padding: 2rem;
    }

    simple-greeting {
      display: inline;
    }
  `;

  #xxx = 'blah';

  handleClick(e: Event): void {
    console.log(
      `🔥 ${this.#xxx} ${JSON.stringify(e)} ${JSON.stringify(config)}`
    );
  }

  override render(): TemplateResult {
    return html`
      <h1>Hello, Lintel!</h1>
      <simple-greeting
        @click=${this.handleClick}
        .name=${'Moon'}></simple-greeting>
    `;
  }
}

// declare global {
//   interface HTMLElementTagNameMap {
//     'app-root': AppRoot;
//   }
// }
