import {
    Configuration,
    PublicClientApplication,
    SilentRequest,
    PopupRequest,
    AuthenticationResult,
    AccountInfo,
    EndSessionRequest,
  } from '@azure/msal-browser';
  import { SignInResult } from './signin-result';
  import { SignInProvider } from './signin-provider';
  
  /**
   * base config for MSAL 2.0 authentication
   *
   * @export
   * @interface Msal2ConfigBase
   */
  interface Msal2ConfigBase {
    /**
     * Redirect URI
     *
     * @type {string}
     * @memberof Msal2Config
     */
    redirectUri?: string;
  
    /**
     * Authority URL
     *
     * @type {string}
     * @memberof Msal2Config
     */
    authority?: string;
  
    /**
     * Other options
     *
     * @type {Configuration}
     * @memberof Msal2Config
     */
    options?: Configuration;
  
    /**
     * List of scopes required
     *
     * @type {string[]}
     * @memberof Msal2ConfigBase
     */
    scopes?: string[];
    // /**
    //  * loginType if login uses popup
    //  *
    //  * @type {LoginType}
    //  * @memberof Msal2ConfigBase
    //  */
    // loginType?: LoginType;
    /**
     * login hint value
     *
     * @type {string}
     * @memberof Msal2ConfigBase
     */
    loginHint?: string;
    /**
     * Domain hint value
     *
     * @type {string}
     * @memberof Msal2ConfigBase
     */
    domainHint?: string;
    /**
     * prompt value
     *
     * @type {string}
     * @memberof Msal2ConfigBase
     */
    prompt?: PromptType;
  
    /**
     * Session ID
     *
     * @type {string}
     * @memberof Msal2Config
     */
    sid?: string;
  
    /**
     * Specifies if incremental consent is disabled
     *
     * @type {boolean}
     * @memberof Msal2ConfigBase
     */
    isIncrementalConsentDisabled?: boolean;
  }
  
  /**
   * Config for MSAL2.0 Authentication
   *
   * @export
   * @interface Msal2Config
   */
  export interface Msal2Config extends Msal2ConfigBase {
    /**
     * Client ID of app registration
     *
     * @type {string}
     * @memberof Msal2Config
     */
    clientId: string;
  }
  
  /**
   * Prompt type enum
   *
   * @export
   * @enum {number}
   */
  export enum PromptType {
    SELECT_ACCOUNT = 'select_account',
    LOGIN = 'login',
    CONSENT = 'consent',
  }
  
  export class MicrosoftProvider implements SignInProvider {
    private readonly scopes: string[] = ['User.Read'];
    private readonly graphConfig = {
      graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
    };
    private resolve: ((result: SignInResult) => void) | null = null;
    private reject: ((error: any) => void) | null = null;
    private _publicClientApplication: PublicClientApplication | null = null;
  
    constructor(private clientId: string) {}
  
    signIn(): Promise<SignInResult> {
      this.resolve = null;
      this.reject = null;
  
      return new Promise<SignInResult>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
        this.signInWithMsal();
      });
    }
  
    async signOut(): Promise<void | undefined> {
      const logOutRequest: EndSessionRequest = {
        account: this.getAccount(),
      };
      const response = await this._publicClientApplication?.logoutPopup(
        logOutRequest
      );
      return response;
    }
    loadDependencies(): Promise<void> {
      // Our dependencies are already loaded via import statement at the top of the file,
      // thanks to msal.js being a module.
      return Promise.resolve();
    }
  
    private async signInWithMsal() {
      const msalConfig: Configuration = {
        auth: {
          clientId: this.clientId,
          authority: 'https://login.microsoftonline.com/consumers/',
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: false,
        },
      };
  
      this._publicClientApplication = new PublicClientApplication(msalConfig);
      try {
        //try to get a token
        const loginResponse = await this.getAccessToken();
        if (loginResponse) {
          const loginResult = await this.getLoginResult(loginResponse);
          this.signInSucceeded(loginResponse);
          return loginResult;
        }
        throw new Error('No login result');
      } catch (e) {
        throw new Error(e);
      }
    }
  
    private signInSucceeded(loginResponse: AuthenticationResult) {
      const loginResult = this.getLoginResult(loginResponse);
      // Fetch the user's photo.
      // MS provider supports this for work and edu accounts, but not for personal accounts.
      this.getAccessToken()
        .then((response) =>
          loginResult.providerData
            ? (loginResult.providerData['accessToken'] = response.accessToken)
            : response.accessToken
        )
        .then((accessToken) => this.getUserPhoto(accessToken))
        .then((photoUrl) => (loginResult.imageUrl = photoUrl))
        .catch((error) =>
          console.log(
            'Unable to fetch user profile image. Note that Microsoft Graph cannot fetch profile pictures for personal accounts; only work and education accounts are supported. Error details: ',
            error
          )
        )
        .finally(() => this.resolve?.(loginResult)); // Finally clause: regardless of whether we can get the user's photo, we consider it a successful signin.
    }
  
    private signInFailed(error: any) {
      this.reject?.(error);
    }
  
    protected getAccount(): AccountInfo | undefined {
      if (this._publicClientApplication !== null) {
        if (this._publicClientApplication.getAllAccounts().length > 0) {
          return this._publicClientApplication.getAllAccounts()[0];
        }
      }
      return undefined;
    }
  
    private getAccessTokenSilent(): Promise<AuthenticationResult> {
      if (!this._publicClientApplication) {
        return Promise.reject('No app context');
      }
      const accessTokenRequest: SilentRequest = {
        scopes: this.scopes,
        account: this.getAccount(),
      };
      const silentRequest: SilentRequest = accessTokenRequest;
      return this._publicClientApplication.acquireTokenSilent(silentRequest);
    }
    private async getAccessToken(): Promise<AuthenticationResult> {
      if (!this._publicClientApplication) {
        return Promise.reject('No app context');
      }
  
      try {
        const response = await this.getAccessTokenSilent();
        return response;
      } catch (e) {
        if (e) {
          try {
            const loginRequest: PopupRequest = {
              scopes: this.scopes,
            };
            const response =
              await this._publicClientApplication.acquireTokenPopup(loginRequest);
            return response;
          } catch (e) {
            throw e;
          }
        }
        throw e;
      }
    }
  
    private getUserPhoto(accessToken: string): Promise<string> {
      return this.callGraphApi('/photo/$value', accessToken)
        .then((result) => result.blob())
        .then((blob) => this.getImageUrlFromBlob(blob));
    }
  
    private callGraphApi(
      relativeUrl: string,
      accessToken: string
    ): Promise<Response> {
      const url = `${this.graphConfig.graphMeEndpoint}`;
      return fetch(url, {
        method: 'GET',
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      }).then((res) => {
        // If we got a 404, punt.
        if (res.status == 404) {
          return Promise.reject(`Graph API returned 404 for ${relativeUrl}`);
        }
        return res;
      });
    }
  
    private getImageUrlFromBlob(blob: Blob): Promise<string> {
      // COMMENTED OUT:
      // This works initially, creating a blob:// url.
      // However, storing this credential for use in a later page load results in a broken image because the blob no longer exists in memory.
      // return URL.createObjectURL(blob));
  
      // Use a FileReader to read the image as a base 64 URL string
      return new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.addEventListener('error', (error) => reject(error));
        fileReader.addEventListener('loadend', () =>
          resolve(fileReader.result as string)
        );
        fileReader.readAsDataURL(blob);
      });
    }
  
    private getLoginResult(loginResponse: AuthenticationResult): SignInResult {
      return {
        name: loginResponse.account?.name || '',
        email: loginResponse.account?.username || '',
        provider: 'Microsoft',
        accessToken: loginResponse.accessToken,
        accessTokenExpiration: loginResponse.expiresOn,
        error: null,
        imageUrl: null,
        providerData: loginResponse,
      };
    }
  }