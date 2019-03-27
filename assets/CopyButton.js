let tmpl = document.createElement('template');
tmpl.innerHTML = `
  <button>Copy Button</button>
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
    if (!navigator.clipboard) {
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