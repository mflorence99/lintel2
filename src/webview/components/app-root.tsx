import { appStateContext } from '../state/app-state';

import { AppState } from '~webview/state/app-state';
import { LitElement } from 'lit';
import { SignalWatcher } from '@lit-labs/signals';
import { StartupController } from '~webview/controllers/startup';
import { TemplateResult } from 'lit';

import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { provide } from '@lit/context';

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}

// 📘 the whole enchilada

@customElement('app-root')
export class AppRoot extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
      margin: 1rem;
    }

    cod-icon {
      --cod-icon-color: yellow;
      /* --cod-icon-filter: invert(8%) sepia(94%) saturate(4590%)
        hue-rotate(358deg) brightness(101%) contrast(112%); */
      --cod-icon-size: 48px;
    }

    fa-icon {
      --fa-icon-color: green;
      /* --fa-icon-filter: invert(8%) sepia(94%) saturate(4590%)
        hue-rotate(358deg) brightness(101%) contrast(112%); */
      --fa-icon-size: 32px;
      --fa-icon-variant: Pro;
    }

    mat-icon {
      --mat-icon-color: pink;
      /* --mat-icon-filter: invert(8%) sepia(94%) saturate(4590%)
        hue-rotate(358deg) brightness(101%) contrast(112%); */
      --mat-icon-size: 32px;
      --mat-icon-variant: Sharp;
    }
  `;

  @provide({ context: appStateContext }) appState = new AppState(
    'app-state'
  );

  // eslint-disable-next-line no-unused-private-class-members
  #startup = new StartupController(this);

  override render(): TemplateResult {
    const model = this.appState.model;
    return html`
      <section
        style="align-items: flex-start; display: flex; flex-direction: column; gap: 1rem">
        <label>
          <md-checkbox></md-checkbox>
          X is ${model.get().x}
        </label>

        <label>
          <md-checkbox></md-checkbox>
          Y is ${model.get().y}
        </label>

        <div>
          <cod-icon icon="lightbulb"></cod-icon>
          lightbulb
        </div>

        <div>
          <fa-icon icon="pie"></fa-icon>
          pie
        </div>

        <div>
          <mat-icon icon="add_reaction"></mat-icon>
          PieChart
        </div>

        <md-filled-button
          @click=${(): void => this.appState.incrementX(10)}>
          Increment
        </md-filled-button>
      </section>

      <br />
      <br />
      <br />
      <br />
      <br />
      <my-component .name=${'Mark'}></my-component>
    `;
  }
}
