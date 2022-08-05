import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@pwabuilder/code-editor';

@customElement('sw-panel')
export class SWPanel extends LitElement {

  @property({type: Object}) sw: any = {};


  static get styles() {
    return css`

      .panel-holder {
        display: flex;
        flex-direction: column;
        gap: 1em;
      }

      .panel-holder h2 {
        margin: 0;
        font-size: 22px;
      }

      .panel-holder p {
        margin: 0;
        font-size: 14px;
        color: #808080;
      }

      .panel-desc .code-block {
        display: flex;
        flex-direction: column;
        gap: .75em;
      }

      
    `;
  }

  constructor() {
    super();
  }

  handleEditorUpdate(){
    console.log("update");
  }

  render() {
    return html`
      <div class="panel-holder">
        <div class="panel-desc">
          <h2>${this.sw.type}</h2>
          <p>${this.sw.desc}</p>
        </div>
        <div class="code-block">
          <h2>Code</h2>
          <code-editor
            copyText="Copy Service Worker"
            .startText=${this.sw.code}
          >
        </code-editor>
        </div>
      </div>
    `;
  }
}