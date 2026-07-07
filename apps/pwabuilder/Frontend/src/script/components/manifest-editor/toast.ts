import { LitElement, html } from 'lit';
import { toastStyles } from "./toast.styles";
import { customElement } from 'lit/decorators.js';

@customElement('app-toast')
export class AppToast extends LitElement {

  static styles = [toastStyles];

  constructor() {
    super();
  }

  render() {
    return html`
      <div id="toast">
        <slot></slot>
      </div>
    `
  }
}