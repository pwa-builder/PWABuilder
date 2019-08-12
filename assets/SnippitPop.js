let tmpl = document.createElement('template');
tmpl.innerHTML = `
  <h1>Hello world</h1>
`;


class SnippitPop extends HTMLElement {
  
  constructor() {
    super(); // always call super() first in the constructor.

    // Attach a shadow root to the element.
    let shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(tmpl.content.cloneNode(true));
  }
  
  static get observedAttributes() {
    return ['snippitImage'];
  }
  
  get snippitImage() {
    return this.hasAttribute('snippitImage');
  }

  set snippitImage(val) {
    if (val) {
      this.setAttribute('snippitImage', val);
    } else {
      this.removeAttribute('snippitImage');
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
    const snippitImage = this.getAttribute('snippitImage');
    
    if (snippitImage) {
      const response = await fetch(snippitImage);
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