import { SignInResult } from './signin-result';
import { SignInProvider } from './signin-provider';
import { GoogleProvider } from './google-provider';

export class GoogleProvider implements SignInProvider {
  static readonly apiUrl = 'https://accounts.google.com/gsi/client';
  private resolve: ((result: SignInResult) => void) | null = null;
  private reject: ((error: any) => void) | null = null;
  constructor(private clientId: string) {}

  private appendGoogleScript(): Promise<void> {
    console.log('Appending script');
    return new Promise<void>((resolve, reject) => {
      const scriptEl = window.document.createElement('script');
      scriptEl.async = true;
      scriptEl.src = GoogleProvider.apiUrl;
      scriptEl.onload = () => resolve();
      scriptEl.onerror = (error) =>
        reject({
          message: 'Error loading Google Platform library',
          error: error,
        });
      window.document.head.appendChild(scriptEl);
    });
  }

  async signIn(): Promise<SignInResult> {
    await this.loadDependencies();
    return new Promise<SignInResult>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.signInWithGoogleSignInAPI();
    });
  }

  signInWithGoogleSignInAPI() {
    (window as any).google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (data) => this.handleCredentialResponse(data),
    });

    console.log(
      'BUTTON',
      document.querySelector('pwa-auth'),
      document.querySelector('pwa-auth')?.shadowRoot?.querySelector('#Google')
    );
    // (window as any).google.accounts.id.renderButton(
    //   document.querySelector('pwa-auth')?.shadowRoot?.querySelector('#Google'),
    //   { theme: 'outline', size: 'large' } // customization attributes
    // );
    (window as any).google.accounts.id.prompt(); // also display the One Tap dialog
  }

  handleCredentialResponse(response) {
    console.log('Callback is called', response);
    const webToken = this.decodeJwt(response.credential) as any;
    console.log('Response payload', webToken);
    this.resolve?.({
      email: webToken?.email,
      name: webToken?.name,
      imageUrl: webToken?.picture,
      accessToken: response.credential,
      accessTokenExpiration: new Date(webToken?.exp),
      provider: 'Google',
      error: null,
    });
  }

  private decodeJwt(token: string): Object | null {
    // https://stackoverflow.com/a/38552302/536
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  }

  loadDependencies(): Promise<void> {
    return this.appendGoogleScript();
  }
}
