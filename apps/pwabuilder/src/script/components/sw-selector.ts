import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('sw-selector')
export class SWSelector extends LitElement {

  @property({type: Boolean}) open: boolean = false;

  static get styles() {
    return css`

      sl-tab-group {
        --indicator-color: #4F3FB6;
      }
      sl-tab[active]::part(base) {
        color: #4F3FB6;
      }
      sl-tab::part(base):hover {
        color: #4F3FB6;
      }
      sl-tab-panel::part(base){
        overflow-y: auto;
        overflow-x: hidden;
        height: 500px;
        padding: .5em;
      }
      #selector-header {
        display: flex;
        flex-direction: column;
        gap: .5em;
        padding-top: 1em;
      }
      #selector-header h1 {
        margin: 0;
        font-size: 24px;
      }
      #selector-header p {
        margin: 0;
        font-size: 14px;
      }
      .dialog::part(body){
        padding-top: 0;
      }
      .dialog::part(title){
        display: none;
      }
      .dialog::part(panel) {
        position: relative;
      }
      .dialog::part(close-button__base){
        position: absolute;
        top: 5px;
        right: 5px;
      }
    `;
  }

  constructor() {
    super();
  }

  communicateHide(){
    let swSelectorClosed = new CustomEvent('swSelectorClosed', {
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(swSelectorClosed);
  }

  render() {
    return html`
      <sl-dialog class="dialog" ?open=${this.open} @sl-hide=${() => this.communicateHide()} noHeader>
        <div id="selector-header">
          <h1>Download a Service Worker</h1>
          <p>Download one of our pre-built Service Workers package that utilize Workbox to make building your offline experience easy.</p>
        </div>
        <sl-tab-group id="sw-tabs">
          <sl-tab slot="nav" panel="sw1">SW #1</sl-tab>
          <sl-tab slot="nav" panel="sw2">SW #2</sl-tab>
          <sl-tab slot="nav" panel="sw3">SW #3</sl-tab>

          <sl-tab-panel name="sw1">Offline Pages</sl-tab-panel>
          <sl-tab-panel name="sw2">Offline Page Copy of Pages</sl-tab-panel>
          <sl-tab-panel name="sw3">Offline Copy with Backup Offline Page</sl-tab-panel>
        </sl-tab-group>
      </sl-dialog>
    `;
  }
}