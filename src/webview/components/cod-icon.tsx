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

const codiconKeyframes = new Map<string | null, string>();
const codiconStyles = new Map<string | null, string>();
for (const styleSheet of Array.from(document.styleSheets)) {
  for (const cssRule of Array.from(styleSheet.cssRules)) {
    // 👇 all the codicon keyframes
    if (cssRule instanceof CSSKeyframesRule) {
      const keyframe = cssRule;
      const match = /codicon-(.*)/.exec(keyframe.name);
      if (match?.[1]) codiconKeyframes.set(match[1], cssRule.cssText);
    }
    // 👇 all the codicon styles
    else if (cssRule instanceof CSSStyleRule) {
      const style = cssRule;
      const match = /\.codicon-(.*)::before/.exec(style.selectorText);
      if (match?.[1]) codiconStyles.set(match[1], cssRule.cssText);
    }
  }
}

// 📘 display codicon

// 👉 https://microsoft.github.io/vscode-codicons/dist/codicon.html

//  --cod-icon-color      any color, default: inherit
//  --cod-icon-filter     any filter, default: none
//  --cod-icon-size       any size, default: 1em

@customElement('cod-icon')
export class CodIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      text-align: center;
      vertical-align: middle;
      width: var(--cod-icon-size, 1em);
    }

    .codicon {
      color: var(--cod-icon-color, inherit);
      display: inline-block;
      filter: var(--cod-icon-filter, none);
      font-size: var(--cod-icon-size, 1em) !important;
    }
  `;

  @property() animation: 'spin' | null = null;

  @property() icon: string | null = null;

  override render(): TemplateResult {
    const animationStyle = `
      .codicon-${this.icon} {
        animation: codicon-${this.animation} 1.5s steps(30) infinite;
      }
    `;
    return html`
      <style>
        ${this.animation ? codiconKeyframes.get(this.animation) : ''}
        ${codiconStyles.get(this.icon)}
        ${this.animation ? animationStyle : ''}
      </style>
      <i class="codicon codicon-${this.icon}"></i>
    `;
  }
}
