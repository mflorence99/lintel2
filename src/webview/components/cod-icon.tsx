import { LitElement } from 'lit';
import { TemplateResult } from 'lit';

import { adoptStyles } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
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

const codiconStyles = new CSSStyleSheet();
for (const styleSheet of Array.from(document.styleSheets)) {
  for (const cssRule of Array.from(styleSheet.cssRules)) {
    if ((cssRule as CSSStyleRule).selectorText?.startsWith('.codicon'))
      codiconStyles.insertRule(cssRule.cssText);
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

  override connectedCallback(): void {
    super.connectedCallback();
    adoptStyles(this.renderRoot as ShadowRoot, [
      CodIcon.styles,
      codiconStyles
    ]);
  }

  override render(): TemplateResult {
    const clazz = `codicon codicon-${this.icon}`;
    const classes = { codicon: true, [clazz]: true };
    return html`
      <i class=${classMap(classes)}></i>
    `;
  }
}
