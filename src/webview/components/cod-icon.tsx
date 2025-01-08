import { LitElement } from 'lit';
import { TemplateResult } from 'lit';

import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { property } from 'lit/decorators.js';

declare global {
  interface HTMLElementTagNameMap {
    'cod-icon': CodIcon;
  }
}

// 📘 we must adopt the codicon styles from the global stylesheet
//    but do this once, efficiently, so we can use them
//    simply as regular styles as needed

const codiconStyles = new Map<string | null, string>();

const regex = /\.codicon-(.*)::before/gm;

for (const styleSheet of Array.from(document.styleSheets)) {
  for (const cssRule of Array.from(styleSheet.cssRules)) {
    const style = cssRule as CSSStyleRule;
    const match = regex.exec(style.selectorText);
    if (match?.[1]) {
      codiconStyles.set(match[1], cssRule.cssText);
    }
  }
}

// 📘 display codicon

// 👉 https://microsoft.github.io/vscode-codicons/dist/codicon.html

//  --cod-icon-color    any color, default: inherit
//  --cod-icon-filter   any filter, default: none
//  --cod-icon-size     any size, default: 1em

@customElement('cod-icon')
export class CodIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }

    .codicon {
      color: var(--cod-icon-color, inherit);
      filter: var(--cod-icon-filter, none);
      font-size: var(--cod-icon-size, 1em) !important;
    }
  `;

  @property() icon: string | null = null;

  override render(): TemplateResult {
    return html`
      <style>
        ${codiconStyles.get(this.icon)}
      </style>
      <i class="codicon codicon-${this.icon}"></i>
    `;
  }
}
