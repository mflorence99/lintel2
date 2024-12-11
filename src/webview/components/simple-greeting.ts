import { LitElement } from 'lit';
import { TemplateResult } from 'lit';

import { asyncReplace } from 'lit-html/directives/async-replace.js';
import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { property } from 'lit/decorators.js';

const wait = (t: number): unknown =>
  new Promise((resolve) => setTimeout(resolve, t));

async function* countUp(): any {
  let i = 0;
  while (true) {
    yield i++;
    await wait(1000);
  }
}

@customElement('simple-greeting')
export class SimpleGreeting extends LitElement {
  static override styles = css`
    p {
      --xyz: 12;

      color: red;
      font-weight: bold;
      text-decoration: underline dotted;
      text-transform: uppercase;
    }
  `;

  @property({ type: String }) name?: string = 'World';

  override render(): TemplateResult {
    return html`
      <p>Hello, ${this.name}! ${asyncReplace(countUp())}</p>
    `;
  }
}

// declare global {
//   interface HTMLElementTagNameMap {
//     'simple-greeting': SimpleGreeting;
//   }
// }
