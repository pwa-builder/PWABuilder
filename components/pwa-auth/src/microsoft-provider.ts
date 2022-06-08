import * as Msal from "msal";
import { SignInResult } from "./signin-result";
import { SignInProvider } from "./signin-provider";

export class MicrosoftProvider implements SignInProvider {

    private readonly requestObj: Msal.AuthenticationParameters = { scopes: ["user.read"] };
    private readonly graphConfig = { graphMeEndpoint: "https://graph.microsoft.com/v1.0/me" };
    private resolve: ((result: SignInResult) => void) | null = null;
    private reject: ((error: any) => void) | null = null;
    private app: Msal.UserAgentApplication | null = null;
    
    constructor (private clientId: string) {
    }

    signIn(): Promise<SignInResult> {
        this.resolve = null;
        this.reject = null;

        return new Promise<SignInResult>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.signInWithMsal();
        });
    }

    loadDependencies(): Promise<void> {
        // Our dependencies are already loaded via import statement at the top of the file,
        // thanks to msal.js being a module.
        return Promise.resolve();
    }

    private signInWithMsal() {
        const msalConfig: Msal.Configuration = {
            auth: {
                clientId: this.clientId,
                authority: "https://login.microsoftonline.com/common/"
            },
            cache: {
                cacheLocation: "localStorage",
                storeAuthStateInCookie: true
            }            
        };
        
        this.app = new Msal.UserAgentApplication(msalConfig);
        this.app.handleRedirectCallback((error, response) => this.redirectCallback(error, response));
        this.app.loginPopup(this.requestObj)
            .then(loginResponse => this.signInSucceeded(loginResponse))
            .catch(error => this.signInFailed(error));
    }

    private signInSucceeded(loginResponse: Msal.AuthResponse) {
        const loginResult = this.getLoginResult(loginResponse);

        // Fetch the user's photo. 
        // MS provider supports this for work and edu accounts, but not for personal accounts.
        this.getAccessToken(loginResponse)
            .then(accessToken => loginResult.providerData ? (loginResult.providerData["accessToken"] = accessToken) : accessToken)
            .then(accessToken => this.getUserPhoto(accessToken))
            .then(photoUrl => loginResult.imageUrl = photoUrl)
            .catch(error => console.log("Unable to fetch user profile image. Note that Microsoft Graph cannot fetch profile pictures for personal accounts; only work and education accounts are supported. Error details: ", error))
            .finally(() => this.resolve?.(loginResult)); // Finally clause: regardless of whether we can get the user's photo, we consider it a successful signin.
    }

    private signInFailed(error: any) {
        this.reject?.(error);
    }

    private redirectCallback(
        error: Msal.AuthError | null, 
        response: Msal.AuthResponse | undefined) {

        if (response) {
            this.signInSucceeded(response);
        } else {
            this.signInFailed(error || "Unexpected redirect: no error and no login response");
        }
    }

    private getAccessToken(loginResponse: Msal.AuthResponse): Promise<string> {
        if (!this.app) {
            return Promise.reject("No app context");
        }

        return this.app.acquireTokenSilent(this.requestObj)
            .then(tokenResponse => tokenResponse.accessToken);
    }

    private getUserPhoto(accessToken: string): Promise<string> {
        return this.callGraphApi("/photo/$value", accessToken)
            .then(result => result.blob())
            .then(blob => this.getImageUrlFromBlob(blob))
    }

    private callGraphApi(relativeUrl: string, accessToken: string): Promise<Response> {
        const url = `${this.graphConfig.graphMeEndpoint}${relativeUrl}`;
        return fetch(url, {
            method: "GET",
            headers: new Headers({
                "Authorization": `Bearer ${accessToken}`
            })
        }).then(res => {
            // If we got a 404, punt.
            if (res.status == 404) {
                return Promise.reject(`Graph API returned 404 for ${relativeUrl}`);
            }
            return res;
        })
    }

    private getImageUrlFromBlob(blob: Blob): Promise<string> {
        // COMMENTED OUT: 
        // This works initially, creating a blob:// url. 
        // However, storing this credential for use in a later page load results in a broken image because the blob no longer exists in memory.
        // return URL.createObjectURL(blob)); 

        // Use a FileReader to read the image as a base 64 URL string
        return new Promise<string>((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.addEventListener("error", error => reject(error));
            fileReader.addEventListener("loadend", () => resolve(fileReader.result as string));
            fileReader.readAsDataURL(blob);
        });
    }

    private getLoginResult(loginResponse: Msal.AuthResponse): SignInResult {
        return {
            name: loginResponse.account?.name || "",
            email: loginResponse.account?.userName || "",
            provider: "Microsoft", 
            accessToken: loginResponse.accessToken,
            accessTokenExpiration: loginResponse.expiresOn,
            error: null,
            imageUrl: null,
            providerData: loginResponse,
        };
    }
}