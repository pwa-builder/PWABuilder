import { SignInResult } from "./signin-result";
import { SignInProvider } from "./signin-provider";

export class FacebookProvider implements SignInProvider {
    static readonly apiUrl = "https://connect.facebook.net/en_US/sdk.js";

    constructor(private appId: string) {
        
    }

    signIn(): Promise<SignInResult> {
        return this.appendFacebookScript()
            .then(() => this.initFacebookSdk())
            .then(response => this.signInWithFacebookSdk(response))
            .then(response => this.fetchUserDetails(response));
    }

    loadDependencies(): Promise<void> {
        return this.appendFacebookScript()
            .then(() => this.initFacebookSdk() as any);
    }

    private appendFacebookScript(): Promise<void> {
        const fb = window.FB;
        if (fb) {
            return Promise.resolve();
        }
        
        return new Promise<void>((resolve, reject) => {
            const scriptEl = window.document.createElement("script");
            scriptEl.async = true;
            scriptEl.src = FacebookProvider.apiUrl;
            scriptEl.onload = () => resolve();
            scriptEl.onerror = (error) => reject(error);
            window.document.head.appendChild(scriptEl);
        });
    }

    private initFacebookSdk(): Promise<fb.StatusResponse> {
        if (!window.FB) {
            return Promise.reject("Couldn't find window.FB");
        }

        FB.init({
            appId: this.appId,
            version: "v6.0",
            frictionlessRequests: true
        });
        return new Promise(resolve => FB.getLoginStatus(response => resolve(response)));
    }

    private signInWithFacebookSdk(statusResponse: fb.StatusResponse): Promise<fb.StatusResponse> {
        // Speed through if we're already signed in to FB.
        if (statusResponse.status === "connected") {
            return Promise.resolve(statusResponse);
        } 
        
        return new Promise(resolve => FB.login(loginResponse => resolve(loginResponse), { scope: "email" }));
    }

    private fetchUserDetails(statusResponse: fb.StatusResponse): Promise<SignInResult> {
        if (statusResponse.status !== "connected") {
            return Promise.reject({
                message: "Facebook sign in failed and may have been cancelled by the user.",
                status: statusResponse.status
            });
        }

        const authResponse = statusResponse.authResponse;
        return new Promise((resolve, reject) => {
            const requestArgs = {
                fields: "name, email, picture.width(1440).height(1440)"
            };
            FB.api("/me", requestArgs, (userDetails: any) => {
                resolve(this.getSignInResultFromUserDetails(userDetails, authResponse));
            });
        });
    }

    private getSignInResultFromUserDetails(userDetails: any, authResponse: fb.AuthResponse): SignInResult {
        if (!userDetails?.email) {
            throw new Error("Facebook sign-in succeeded, but the resulting user details didn't contain an email. User details: " + JSON.stringify(userDetails));
        }

        // authResponse.expiresIn is specified in seconds from now.
        const expiresInSeconds = authResponse.expiresIn;
        const expiration = new Date();
        expiration.setSeconds(expiresInSeconds || 10000);

        return {
            email: userDetails.email,
            name: userDetails.name,
            imageUrl: userDetails.picture?.data?.url,
            error: null,
            accessToken: authResponse?.accessToken,
            accessTokenExpiration: expiration,
            provider: "Facebook",
            providerData: {
                user: userDetails,
                auth: authResponse
            }
        };
    }
}