let platTmpl = document.createElement('template');
platTmpl.innerHTML = `
  <style>
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    :host {
      overflow: hidden;
    }
  </style>

  <div>
    <img>
  </div>
`;


class PlatformPop extends HTMLElement {
  
  constructor() {
    super(); // always call super() first in the constructor.

    // Attach a shadow root to the element.
    let shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(platTmpl.content.cloneNode(true));
  }
  
  static get observedAttributes() {
    return ['platform'];
  }
  
  get platform() {
    return this.hasAttribute('platform');
  }

  set platform(val) {
    if (val) {
      this.setAttribute('platform', val);

      if (val === 'Samsung' || val === 'Android' || val === 'ios') {
        this.shadowRoot.querySelector('img').src="~/assets/images/android-screen.png";
      }
      else if (val === 'Progressive Web App') {
        this.shadowRoot.querySelector('img').src="~/assets/images/pwa-screen.png";
      }
      else if (val === 'Microsoft Teams') {
        this.shadowRoot.querySelector('img').src="~/assets/images/teams-screen.png";
      }
      else {
        this.shadowRoot.querySelector('img').src="~/assets/images/pwabuilder-screen.png";
      }
    } else {
      this.removeAttribute('platform');
    }
  }
  
}

window.customElements.define('platform-pop', PlatformPop);