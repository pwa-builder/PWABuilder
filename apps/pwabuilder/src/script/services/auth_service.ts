import { PublicClientApplication, SilentRequest, AuthenticationResult, Configuration, AccountInfo, PopupRequest, EndSessionRequest } from "@azure/msal-browser";

export class AuthModule {
  private readonly scopes: string[] = ['User.Read'];


  private _publicClientApplication: PublicClientApplication | null = null;


  async signIn(): Promise<any> {
    return await this.signInWithMsal();
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

  private async signInWithMsal() {
    const msalConfig: Configuration = {
      auth: {
        clientId: "dec4afb2-2207-46f2-8ac6-ba781e2da39a",
        authority: 'https://login.microsoftonline.com/common/',       
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
      },
    };
    this._publicClientApplication = new PublicClientApplication(msalConfig);
    try {
      //try to get a token
      const loginResponse = await this.getAccessToken();
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
