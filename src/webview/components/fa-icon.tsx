import { LitElement } from 'lit';
import { TemplateResult } from 'lit';

import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

declare global {
  interface HTMLElementTagNameMap {
    'fa-icon': FaIcon;
  }
}

// 📘 we must adopt the fa styles from the global stylesheet
//    but do this once, efficiently, so we can use them
//    simply as regular styles as needed

const faStyles = new Map<string | null, string>();
for (const styleSheet of Array.from(document.styleSheets)) {
  for (const cssRule of Array.from(styleSheet.cssRules)) {
    const style = cssRule as CSSStyleRule;
    const match = /\.fa-(.*)/.exec(style.selectorText);
    if (match?.[1]) {
      faStyles.set(match[1], cssRule.cssText);
    }
  }
}

// 📘 display fontawesome icon

// 👉 https://marella.me/material-icons/demo/

//  --fa-icon-color    any color, default: inherit
//  --fa-icon-filter   any filter, default: none
//  --fa-icon-size     any size, default: 1em
//  --fa-icon-variant  duotone, brands, default: pro

@customElement('fa-icon')
export class FaIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }

    .fa-icon {
      color: var(--fa-icon-color, inherit);
      filter: var(--fa-icon-filter, none);
      font-size: var(--fa-icon-size, 1em) !important;
    }
  `;

  @property() icon: string | null = null;

  override render(): TemplateResult {
    const style = getComputedStyle(this);
    const variant =
      style.getPropertyValue('--fa-icon-variant') ?? 'pro';
    const fontFamily = `'Font Awesome 6 ${variant}'`;
    const iconStyle = `        
      .fa-${this.icon}::before {
        content: var(--fa);
      }`;
    return html`
      <style>
        ${faStyles.get(this.icon)}
        ${iconStyle}
      </style>
      <i
        class="fa-icon fa-${this.icon}"
        style=${styleMap({ 'font-family': fontFamily })}></i>
    `;
  }
}
