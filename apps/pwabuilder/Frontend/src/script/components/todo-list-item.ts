import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { manifest_fields, service_worker_fields } from '@pwabuilder/manifest-information';
//import { recordPWABuilderProcessStep } from '../utils/analytics';
import './manifest-info-card'
import './sw-info-card'
import { todoListItemStyles } from './todo-list-item.styles';

@customElement('todo-item')
export class TodoItem extends LitElement {
  @property({ type: String }) field: string = "";
  @property({ type: String }) card: "ServiceWorker" | "WebAppManifest" | "Https" | "" = "";
  @property({ type: String }) fix: string = "";
  @property({ type: String }) status: "Required" | "Recommended" | "Optional" | "Feature" | "Retest" | "" = "";
  @property({ type: String }) displayString: string = "";
  @property({ type: String }) docsLink: string | null = null;
  @property({ type: String }) previewImage: string | null = null;

  @state() clickable: boolean = false;
  @state() isOpen: boolean = false;

  @state() darkMode: boolean = false;

  static styles = [todoListItemStyles];

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    // understand the users color preference
    const result = window.matchMedia('(prefers-color-scheme: dark)');
    this.darkMode = result.matches; // TRUE if user prefers dark mode
  }

  decideClasses() {

    const isRetest = this.status === "Retest" || this.field.startsWith("Open") || !!manifest_fields[this.field] || !!service_worker_fields[this.field];
    this.clickable = isRetest;

    return { iwrapper: true, clickable: this.clickable }
  }

  bubbleEvent() {
    if (manifest_fields[this.field]) {
      let tooltip = (this.shadowRoot!.querySelector('manifest-info-card') as any);
      tooltip.handleHover(!this.isOpen);
    }

    if (service_worker_fields[this.field]) {
      let tooltip = (this.shadowRoot!.querySelector('sw-info-card') as any);
      tooltip.handleHover(!this.isOpen);
    }

    let event = new CustomEvent('todo-clicked', {
      detail: {
        field: this.field,
        card: this.card,
        fix: this.fix,
        displayString: this.displayString,
        errorString: this.fix
      }
    });
    this.dispatchEvent(event);
  }

  triggerHoverState(e: CustomEvent) {
    let element = this.shadowRoot!.querySelector(".iwrapper");
    if (e.detail.entering) {
      element?.classList.add("active");
      this.isOpen = true;
    } else {
      element?.classList.remove("active");
      this.isOpen = false;
    }
  }


  decideIcon() {
    switch (this.status) {
      case "Required":
        return html`<img src=${stop_src} alt="yield result icon"/>`
      case "Recommended":
        return html`<img src=${recommended_src} alt="recommended icon"/>`
      case "Feature":
        return html`<img src=${enhancement_src} alt="app capability result icon"/>`

      case "Retest":
        return html`<img src=${this.darkMode ? retest_src_light : retest_src} style="color: black" alt="retest site icon"/>`
    }

    return html`<img src=${yield_src} alt="yield result icon"/>`
  }


  render() {
    return html`
      <div class="${classMap(this.decideClasses())}" @click=${() => this.bubbleEvent()}>
        <div class="left">
          ${this.decideIcon()}
          <p>${this.fix}</p>
        </div>

        ${this.renderManifestInfoCard()}
        ${this.renderServiceWorkerInfoCard()}
      </div>
    `;
  }

  renderManifestInfoCard(): TemplateResult {
    if (this.card !== "WebAppManifest") {
      return html``;
    }

    return html`
      <manifest-info-card .field=${this.field} .placement="${"left"}" @trigger-hover=${(e: CustomEvent) => this.triggerHoverState(e)}>
        <button slot="trigger" type="button" class="right">
          <img src="assets/tooltip.svg" alt="info symbol, additional information available on hover" />
        </button>
      </manifest-info-card>
    `;
  }

  renderServiceWorkerInfoCard(): TemplateResult {
    if (this.card !== "ServiceWorker") {
      return html``;
    }

    return html`
      <sw-info-card .field=${this.field} .placement="${"left"}" @trigger-hover=${(e: CustomEvent) => this.triggerHoverState(e)}>
        <button slot="trigger" type="button" class="right">
          <img src="assets/tooltip.svg" alt="info symbol, additional information available on hover" />
        </button>
      </sw-info-card>
    `;
  }
}

const yield_src = "/assets/new/yield.svg";
const stop_src = "/assets/new/stop.svg";
const enhancement_src = "/assets/new/enhancement.svg";
const recommended_src = "/assets/new/recommended.png";
const retest_src = "/assets/new/retest-icon.svg";
const retest_src_light = "/assets/new/retest-icon_light.svg";
