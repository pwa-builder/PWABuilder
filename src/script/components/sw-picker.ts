import { LitElement, css, html, customElement } from 'lit-element';

@customElement('sw-picker')
export class SWPicker extends LitElement {

  static get styles() {
    return css`

    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
       <div>
         <fast-menu>
           <fast-menu-item>
           
           </fast-menu-item>
         </fast-menu>
       </div>
    `;
  }
}
