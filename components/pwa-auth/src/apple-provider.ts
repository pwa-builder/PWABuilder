import { SignInResult } from "./signin-result";
import { SignInProvider } from "./signin-provider";

export class AppleProvider implements SignInProvider {

    static readonly scriptUrl = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    static readonly nameLocalStorageKeyPrefix = "pwa-auth-apple-email";

    constructor(private clientId: string, private redirectUri?: string | null) {
    }

    signIn(): Promise<SignInResult> {
        return this.loadDependencies()
            .then(() => this.signInWithApple());
    }

    loadDependencies(): Promise<void> {
        return this.appendAppleScript()
            .then(() => this.initAuth());
    }

    private appendAppleScript(): Promise<void> {
        const apple = this.getAppleJS();        
        if (!apple) {
            return new Promise<void>((resolve, reject) => {
                const scriptEl = window.document.createElement("script");
                scriptEl.async = true;
                scriptEl.src = AppleProvider.scriptUrl;
                scriptEl.onload = () => resolve();
                scriptEl.onerror = (error) => reject({ message: "Error loading Apple JS", error: error });
                window.document.head.appendChild(scriptEl);
            });
        } 

        // AppleJS is already loaded.
        return Promise.resolve();
    }

    private initAuth(): Promise<void> {
        const apple = this.getAppleJS();
        if (!apple) {
            return Promise.reject("AppleJS not loaded");
        }
        
        apple.auth.init({
            clientId : this.clientId,
            scope : "name email",
            redirectURI : this.redirectUri || this.trimSlash(location.href),
            state : "",
            usePopup : true
        });

        return Promise.resolve();
    }

    private signInWithApple(): Promise<SignInResult> {
        const apple = this.getAppleJS();
        if (!apple) {
            return Promise.reject("AppleJS not loaded");
        }

        return apple.auth.signIn()
            .then(result => this.getSignInResult(result));
    }

    private getAppleJS(): AppleSignInAPI.AppleID | undefined {
        return window["AppleID"] as AppleSignInAPI.AppleID | undefined;
    }

    private getSignInResult(rawResult: AppleSignInAPI.SignInResponseI | AppleSignInAPI.SignInErrorI): SignInResult {
        if (this.isErrorResult(rawResult)) {
            return {
                error: new Error(rawResult.error),
                provider: "Apple"
            };
        }
        
        const userDetails = this.decodeUserDetails(rawResult);
        return {
            email: userDetails.email,
            name: userDetails.name,
            accessToken: rawResult?.authorization?.code,
            accessTokenExpiration: userDetails.appleToken ? new Date(userDetails.appleToken.exp * 1000) : null,
            imageUrl: null,
            providerData: rawResult,
            provider: "Apple",
            error: null
        };
    }

    private isErrorResult(result: AppleSignInAPI.SignInErrorI | AppleSignInAPI.SignInResponseI): result is AppleSignInAPI.SignInErrorI {
        return !!(result as AppleSignInAPI.SignInErrorI).error;
    }

    private decodeUserDetails(result: AppleSignInAPI.SignInResponseI): { name: string; email: string; appleToken: AppleJwtToken } {
        // Decode the user's email from the JWT token.
        const webToken = this.decodeJwt(result.authorization.id_token) as AppleJwtToken;
        const email = webToken?.email;
        if (!email) {
            throw new Error("Unable to decode user's email from JWT token: " + result.authorization.id_token);
        }

        // Apple sends the user's name only the first time they sign in.
        // See if it's here.
        let name: string | null = null;
        if (result.user && result.user.name) {
            name = [result.user.name.firstName, result.user.name.lastName]
                .filter(n => !!n)
                .join(" ");
            this.tryStoreNameWithEmail(name, email);
        } else {
            // Subsequent sign-in, user details not present. 
            // See if we have it in local storage.
            name = this.tryGetStoredNameFromEmail(email);
        }

        if (!name) {
            name = "";
        }

        return {
            name,
            email,
            appleToken: webToken
        };
    }

    private decodeJwt(token: string): Object | null {
        // https://stackoverflow.com/a/38552302/536
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

    private tryGetStoredNameFromEmail(email: string): string | null {
        const key = this.getUserNameLocalStorageKey(email);
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn("Error fetching user from local storage.", key, error);
            return null;
        }
    }

    private tryStoreNameWithEmail(name: string, email: string) {
        const key = this.getUserNameLocalStorageKey(email);
        try {
            localStorage.setItem(key, name);
        } catch (error) {
            console.warn("Error storing user name in local storage. Subsequent sign-ins may not have a user name.", key, name, error);
        }
    }

    private getUserNameLocalStorageKey(email: string) {
        return `${AppleProvider.nameLocalStorageKeyPrefix}-${email}`;
    }

    private trimSlash(input: string) {
        let length = 0;
        for (let i = input.length - 1; i >= 0; i--) {
            if (input[i] !== '/') {
                length = i + 1;
                break;
            }
        }

        return input.substr(0, length);
    }
}

type AppleJwtToken = {
    iss: string;
    aud: string;
    exp: number;
    iat: number;
    sub: string;
    c_hash: string;
    email: string;
    email_verified: boolean;
    auth_time: number;
    nonce_supported: boolean;
}