import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('sw-panel')
export class SWPanel extends LitElement {

  @property({type: String}) type: string = "";

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

  getDescription(){
    for(let i = 0; i < sw_objects.length; i++){
      let obj = sw_objects[i];
      if(obj.type === this.type){
        return html`${obj.desc}`
      }
    }
    return html``
  }

  render() {
    return html`
      <div class="panel-holder">
        <div class="panel-desc">
          <h2>${this.type}</h2>
          <p>${this.getDescription()}</p>
        </div>
        <div class="code-block">
          <h2>Code</h2>
          
        </div>
      </div>
    `;
  }
}

const sw_objects: any = [
  {
    type: "Offline Pages",
    desc: 'This simple but elegant solution pulls a file from your web server called "offline.html" (make sure that file is actually there) and serves the file whenever a network connection can not be made.',
    download: "filepath"
  },
  {
    type: "Offline Page Copy of Pages",
    desc: "A solution that expands the offline capabilities of your app. A copy of each pages is stored in the cache as your visitors view them. This allows a visitor to load any previously viewed page while they are offline",
    download: "filepath"
  },
  {
    type: "Offline Copy with Backup Offline Page",
    desc: 'A copy of each pages is stored in the cache as your visitors view them. This allows a visitor to load any previously viewed page while they are offline. This then adds the "offline page" that allows you to customize the message and experience if the app is offline, and the page is not in the cache.',
    download: "filepath"
  }
]