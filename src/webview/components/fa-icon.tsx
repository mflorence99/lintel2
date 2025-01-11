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

const faKeyframes = new Map<string | null, string>();
const faStyles = new Map<string | null, string>();
for (const styleSheet of Array.from(document.styleSheets)) {
  for (const cssRule of Array.from(styleSheet.cssRules)) {
    // 👇 all the FontAwesome keyframes
    if (cssRule instanceof CSSKeyframesRule) {
      const keyframe = cssRule;
      const match = /fa-(.*)/.exec(keyframe.name);
      if (match?.[1]) faKeyframes.set(match[1], cssRule.cssText);
    }
    // 👇 all the FontAwesome styles
    if (cssRule instanceof CSSStyleRule) {
      const style = cssRule;
      const match = /\.fa-(.*)/.exec(style.selectorText);
      if (match?.[1]) faStyles.set(match[1], cssRule.cssText);
    }
  }
}

// 📘 display fontawesome icon

// 👉 https://fontawesome.com/search

//  --fa-primary-color   any color, default: inherit
//  --fa-secondary-color any color, default: inherit
//  --fa-icon-filter     any filter, default: none
//  --fa-icon-size       any size, default: 1em
//  --fa-icon-variant    duotone, brands, default: pro

@customElement('fa-icon')
export class FaIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      text-align: center;
      vertical-align: middle;
      width: var(--fa-icon-size, 1em);
    }

    .fa-icon {
      display: inline-block;
      filter: var(--fa-icon-filter, none);
      font-size: var(--fa-icon-size, 1em) !important;
      font-style: normal;
      font-weight: normal;
      position: relative;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `;

  @property() animation:
    | 'beat'
    | 'beat-fade'
    | 'bounce'
    | 'fade'
    | 'flip'
    | 'shake'
    | 'spin'
    | null = null;

  @property() icon: string | null = null;

  override render(): TemplateResult {
    const style = getComputedStyle(this);
    const variant =
      style.getPropertyValue('--fa-icon-variant') ?? 'pro';
    const fontFamily = `'Font Awesome 6 ${variant}'`;
    const isDuotone = variant.toLowerCase() === 'duotone';
    // 👇 the basic icon style
    const iconStyle = `        
      .fa-${this.icon}::before {
        color: var(--fa-primary-color, inherit);
        content: var(--fa);
        position: ${isDuotone ? 'absolute' : 'relative'};
      }`;
    // 👇 the other half of a duotone icon
    const duotoneStyle = `        
      .fa-${this.icon}::after {
        color: var(--fa-secondary-color, inherit);
        content: var(--fa--fa);
      }`;
    // 👇 put it all together
    return html`
      <style>
        ${this.animation ? faKeyframes.get(this.animation) : ''}
        ${faStyles.get(this.animation)}
        ${faStyles.get(this.icon)}
        ${iconStyle}
        ${isDuotone ? duotoneStyle : ''}
      </style>
      <i
        class="fa-icon fa-${this.animation} fa-${this.icon}"
        style=${styleMap({ 'font-family': fontFamily })}></i>
    `;
  }
}
