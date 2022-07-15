import { SignInResult } from "./signin-result";
import { SignInProvider } from "./signin-provider";

export class GoogleProvider implements SignInProvider {

    static readonly apiUrl = "https://apis.google.com/js/api:client.js";

    constructor(private clientId: string) {
    }

    signIn(): Promise<SignInResult> {
        return this.loadDependencies()
            .then(() => this.signInWithGoogleAuth2());
    }

    loadDependencies(): Promise<void> {
        return this.appendGoogleScript()
            .then(() => this.loadAuth());
    }

    private appendGoogleScript(): Promise<void> {
        const gapiLoad = window.gapi?.load;
        if (!gapiLoad) {
            return new Promise<void>((resolve, reject) => {
                const scriptEl = window.document.createElement("script");
                scriptEl.async = true;
                scriptEl.src = GoogleProvider.apiUrl;
                scriptEl.onload = () => resolve();
                scriptEl.onerror = (error) => reject({ message: "Error loading Google Platform library", error: error });
                window.document.head.appendChild(scriptEl);
            });
        }

        // GApi is already loaded.
        return Promise.resolve();
    }

    private loadAuth(): Promise<void> {
        if (!window.gapi || !window.gapi.load) {
            return Promise.reject("Couldn't find gapi.load");
        }

        // If we already have auth2, cool, we're done.
        if(window.gapi.auth2) {
            return Promise.resolve();
        }

        // Otherwise, pull in auth2.
        return new Promise<void>(resolve => window.gapi.load("auth2", () => resolve()));
    }

    private signInWithGoogleAuth2(): Promise<SignInResult> {
        if (!gapi?.auth2) {
            return Promise.reject("gapi.auth2 wasn't loaded");
        }

        const auth = gapi.auth2.init({
            client_id: this.clientId,
            cookie_policy: "single_host_origin"
        });

        // Speed through the process if we're already signed in.
        if (auth.isSignedIn.get()) {
            const user = auth.currentUser.get();
            return Promise.resolve(this.getSignInResultFromUser(user));
        }

        // Otherwise, kick off the OAuth flow.
        return auth.signIn()
            .then(user => this.getSignInResultFromUser(user));
    }

    private getSignInResultFromUser(user: gapi.auth2.GoogleUser): SignInResult {
        const profile = user.getBasicProfile();
        const authResponse = user.getAuthResponse(true);
        return {
            email: profile.getEmail(),
            name: profile.getName(),
            imageUrl: profile.getImageUrl(),
            accessToken: authResponse?.id_token,
            accessTokenExpiration: new Date(authResponse.expires_at),
            provider: "Google",
            error: null,
            providerData: user
        };
    }
}
