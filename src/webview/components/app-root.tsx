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
      --cod-icon-color: white;
      /* --cod-icon-filter: invert(8%) sepia(94%) saturate(4590%)
        hue-rotate(358deg) brightness(101%) contrast(112%); */
      --cod-icon-size: 32px;
    }

    fa-icon {
      --fa-primary-color: white;
      --fa-secondary-color: yellow;
      /* --fa-icon-filter: invert(8%) sepia(94%) saturate(4590%)
        hue-rotate(358deg) brightness(101%) contrast(112%); */
      --fa-icon-size: 32px;
      --fa-icon-variant: Pro;
    }

    mat-icon {
      --mat-icon-color: white;
      /* --mat-icon-filter: invert(8%) sepia(94%) saturate(4590%)
        hue-rotate(358deg) brightness(101%) contrast(112%); */
      --mat-icon-size: 32px;
      --mat-icon-variant: Two tone;
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
          <cod-icon animation="spin" icon="gear"></cod-icon>
          Gear (codicon)
        </div>

        <div>
          <fa-icon animation="beat" icon="gear"></fa-icon>
          Gear (fontawesome)
        </div>

        <div>
          <mat-icon icon="settings"></mat-icon>
          Gear (material)
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
