let tmpl = document.createElement('template');
tmpl.innerHTML = `
  <style>
    button {
      background: white;
      border: none;
      fill: black;
      border-radius: 50%;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      outline: none;
    }

    button svg {
      height: 20px;
      width: 20px;
    }
  </style>

  <button>
  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="copy" class="svg-inline--fa fa-copy fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M320 448v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V120c0-13.255 10.745-24 24-24h72v296c0 30.879 25.121 56 56 56h168zm0-344V0H152c-13.255 0-24 10.745-24 24v368c0 13.255 10.745 24 24 24h272c13.255 0 24-10.745 24-24V128H344c-13.2 0-24-10.8-24-24zm120.971-31.029L375.029 7.029A24 24 0 0 0 358.059 0H352v96h96v-6.059a24 24 0 0 0-7.029-16.97z"></path></svg>
  </button>
`;


class CopyButton extends HTMLElement {
  
  constructor() {
    super(); // always call super() first in the constructor.

    // Attach a shadow root to the element.
    let shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(tmpl.content.cloneNode(true));
    
    shadowRoot.querySelector('button').addEventListener('click', () => {
      console.log('hello world');
      
      if (this.codeurl) {
        console.log(this.getAttribute('codeurl'));
        this.getCode();
      }
    });
  }
  
  static get observedAttributes() {
    return ['codeurl'];
  }
  
  get codeurl() {
    return this.hasAttribute('codeurl');
  }

  set codeurl(val) {
    if (val) {
      this.setAttribute('codeurl', val);
    } else {
      this.removeAttribute('codeurl');
    }
  }
  
  async copyCode(data) {
    if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(data);
        } catch (err) {
          console.error(err);
        }
      }
      else {
        const clipScript = document.createElement('script');
        clipScript.src = "https://unpkg.com/clipboard@2/dist/clipboard.min.js";
        this.shadowRoot.appendChild(clipScript);
        
        clipScript.addEventListener('load', () => {
          console.log('here');
          let realClip = new ClipboardJS(this.shadowRoot.querySelector('button'));

          realClip.on("success", e => {
            console.info("Action:", e.action);
            console.info("Text:", e.text);
            console.info("Trigger:", e.trigger);
            e.clearSelection();
          });

          realClip.on("error", e => {
            console.error("Action:", e.action);
            console.error("Trigger:", e.trigger);
          });
        })
        
      }
  }
  
  async getCode() {
    const codeURL = this.getAttribute('codeurl');
    
    if (codeURL) {
      const response = await fetch(codeURL);
      const data = await response.text();
      
      console.log(data);
      
      this.shadowRoot.querySelector('button').setAttribute('data-clipboard-text', data);
      
      setTimeout(() => {
        this.copyCode(data);
      }, 500)
      
    }
  }
}

window.customElements.define('copy-button', CopyButton);