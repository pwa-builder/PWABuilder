import {
  LitElement, html, customElement, css, property
} from 'lit-element';

@customElement("pwa-update")
export class pwaupdate extends LitElement implements PWAUpdateComponent {
  @property({ type: String }) swpath: string = "/pwabuilder-sw.js";
  @property({ type: String }) updateevent: string = "SKIP_WAITING";
  @property({ type: String }) updatemessage = "An update for this app is available";

  @property({ type: Boolean }) readyToAsk: boolean = false;
  @property({ type: Boolean }) showStorageEstimate: boolean = false;
  @property({ type: Boolean }) showOfflineToast: boolean = false;
  @property({ type: Number }) offlineToastDuration: number = 2400;

  @property({ type: String }) storageUsed: string | null = null;

  swreg: ServiceWorkerRegistration | undefined;

  static get styles() {
    return css`
      :host {
        font-family: sans-serif;

        --toast-background: #3c3c3c;
        --button-background: #0b0b0b;
      }

      #updateToast {
        position: fixed;
        bottom: 16px;
        right: 16px;
        background: var(--toast-background);
        color: white;
        padding: 1em;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 22em;
        max-width: calc(100vw - 16px);
        font-weight: 600;

        animation-name: fadein;
        animation-duration: 300ms;
      }

      #storageToast {
        position: fixed;
        bottom: 16px;
        right: 16px;
        background: var(--toast-background);
        color: white;
        padding: 1em;
        border-radius: 4px;
        display: flex;
        max-width: calc(100vw - 16px);
        flex-direction: column;
        align-items: flex-end;

        font-weight: 600;
      }

      #storageEstimate {
        font-size: 10px;
        margin-top: 8px;
      }

      #updateToast button {
        color: white;
        border: none;
        background: var(--button-background);
        padding: 8px;
        border-radius: 24px;
        text-transform: lowercase;
        padding-left: 14px;
        padding-right: 14px;
        font-weight: bold;
      }

      @keyframes fadein {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }
    `;
  }

  async firstUpdated() {
    if (this.swpath) {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.register(this.swpath);

        let worker = reg.installing;

        if (worker) {
          if (navigator.storage) {
            const storageData = await navigator.storage.estimate();

            if (storageData) {
              this.storageUsed = this.formatBytes(storageData.usage!);

              this.showOfflineToast = true;

              await this.updateComplete;

              const ani = this.shadowRoot?.querySelector('#storageToast')?.animate(
                [
                  {
                    opacity: 0
                  },
                  {
                    opacity: 1
                  }
                ],
                {
                  fill: 'forwards',
                  duration: 280
                }
              );


              if (ani) {
                setTimeout(async () => {
                  ani.onfinish = () => {
                    this.showOfflineToast = false;
                  };

                  await ani.reverse();
                }, this.offlineToastDuration);
              }
              
            }
          }
        }

        reg.onupdatefound = async () => {
          let newWorker = reg.installing;

          if (newWorker) {
            newWorker.onstatechange = () => {
              if (newWorker?.state === "installed") {
                this.dispatchEvent(new Event("pwaUpdate"));
              }
            };
          }
        }
      }
    }

    this.setupEvents();
  }

  setupEvents() {
    this.addEventListener('pwaUpdate', async () => {
      if (navigator.serviceWorker) {
        this.swreg = await navigator.serviceWorker.getRegistration();

        if (this.swreg && this.swreg.waiting) {
          this.readyToAsk = true;
        }
      }
    })
  }

  doUpdate() {
    this.swreg?.waiting?.postMessage({ type: this.updateevent });

    window.location.reload();
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  render() {
    return html`
      <div>
       ${
      this.readyToAsk ? html`
           <div id="updateToast" part="updateToast">
             <span>${this.updatemessage}</span>

             <button @click="${() => this.doUpdate()}">Update</button>
           </div>
         ` : null
      }

      ${
      this.showOfflineToast ? html`
          <div id="storageToast" part="offlineToast">
            Ready to use Offline

            ${this.showStorageEstimate ? html`<span id="storageEstimate">Cached ${this.storageUsed}</span>` : null}
          </div>
        ` : null
      }
      </div>
    `
  }
}
