import { PublicClientApplication, SilentRequest, AuthenticationResult, Configuration, AccountInfo, RedirectRequest, EndSessionRequest } from "@azure/msal-browser";

export class AuthModule {
  private readonly scopes: string[] = ['User.Read'];


  private _publicClientApplication: PublicClientApplication | null = null;


  constructor() {
    const msalConfig: Configuration = {
      auth: {
        clientId: import.meta.env.VITE_CLIENT_ID as string,
        authority: 'https://login.microsoftonline.com/consumers/',
        navigateToLoginRequestUrl: true,
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: true,
      },
    };
    this._publicClientApplication = new PublicClientApplication(msalConfig);
  }


  public async registerPostLoginListener(): Promise<any | null> {
    const tokenResponse = await this._publicClientApplication?.handleRedirectPromise();
    if(tokenResponse != null) {
      return tokenResponse;
    }
    return null;
  }

  async signIn(state: string): Promise<any> {
    return await this.signInWithMsal(state);
  }

  async signOut(): Promise<void | undefined> {
    const logOutRequest: EndSessionRequest = {
      account: this.getAccount(),
    };
    const response = await this._publicClientApplication?.logoutRedirect(
      logOutRequest
    );
    return response;
  }

  private async signInWithMsal(state: string) {
    // const msalConfig: Configuration = {
    //   auth: {
    //     clientId: import.meta.env.VITE_CLIENT_ID as string,
    //     authority: 'https://login.microsoftonline.com/common/',
    //   },
    //   cache: {
    //     cacheLocation: 'sessionStorage',
    //     storeAuthStateInCookie: false,
    //   },
    // };
    // this._publicClientApplication = new PublicClientApplication(msalConfig);
    try {
      //try to get a token
      const loginResponse = await this.getAccessToken(state);
      if (loginResponse) {
        const loginResult = await this.getLoginResult(loginResponse);
        return loginResult;
      }
      throw new Error('No login result');
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private getLoginResult(loginResponse: AuthenticationResult) {
    return {
      name: loginResponse.account?.name || '',
      email: loginResponse.account?.username || '',
      provider: 'Microsoft',
      accessToken: loginResponse.accessToken,
      idToken: loginResponse.idToken,
    };
  }

  public async getAccessTokenSilent(): Promise<AuthenticationResult> {
    if (!this._publicClientApplication) {
      return Promise.reject('No app context');
    }
    if (!this.getAccount()) {
      return Promise.reject('No account');
    }

    const accessTokenRequest: SilentRequest = {
      scopes: this.scopes,
      account: this.getAccount(),
    };
    const silentRequest: SilentRequest = accessTokenRequest;
    return this._publicClientApplication.acquireTokenSilent(silentRequest);
  }

  private async getAccessToken(state: string): Promise<AuthenticationResult> {
    if (!this._publicClientApplication) {
      return Promise.reject('No app context');
    }

    try {
      const response = await this.getAccessTokenSilent();
      return response;
    } catch (e) {
      if (e) {
        try {
          const loginRequest: RedirectRequest = {
            scopes: this.scopes,
            state: state
          };
          // const response =
            await this._publicClientApplication.acquireTokenRedirect(loginRequest);
            // loginRedirect(loginRequest);

        } catch (e) {
          console.log("Authentication Error")
          throw e;
        }
      }
      throw e;
    }
  }

  protected getAccount(): AccountInfo | undefined {
    if (this._publicClientApplication !== null) {
      if (this._publicClientApplication.getAllAccounts().length > 0) {
        return this._publicClientApplication.getAllAccounts()[0];
      }
    }
    return undefined;
  }


}
