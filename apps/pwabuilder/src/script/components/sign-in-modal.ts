import { LitElement, html } from 'lit';
//import { signInUser } from '../services/sign-in';
import { customElement } from 'lit/decorators.js';
import '@pwabuilder/pwaauth';
import { signInUser, signOutUser } from '../services/sign-in';

@customElement('sign-in-modal')
export class SignInModal extends LitElement {
  firstUpdated() {
    this.shadowRoot
      ?.querySelector('#signin')
      ?.addEventListener('signin-completed', async () => {
        const userDetails = await signInUser();
        console.log('Dialog hidden');
        if (userDetails) {
          this.dispatchEvent(
            new CustomEvent('signin-details', { detail: userDetails.name })
          );
        }
        this.hideDialog();
      });

    this.shadowRoot
      ?.querySelector('#signin')
      ?.addEventListener('signout-completed', async () => {
        console.log('Sign out is completed');
        signOutUser();
      });
  }

  render() {
    return html` <sl-dialog
      class="dialog"
      @sl-show=${() => (document.body.style.height = '100vh')}
      noHeader
    >
      <pwa-auth
        id="signin"
        microsoftkey="32b653f7-a63a-4ad0-bf58-9e15f5914a34"
        credentialmode="silent"
      >
      </pwa-auth>
      <div id="pp-frame-wrapper"></div>
    </sl-dialog>`;
  }

  async hideDialog() {
    let dialog: any = this.shadowRoot!.querySelector('.dialog');
    dialog.hide();
    document.body.style.height = 'unset';
  }
}
