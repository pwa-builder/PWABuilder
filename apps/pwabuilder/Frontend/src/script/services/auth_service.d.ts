import { AuthenticationResult, AccountInfo } from "@azure/msal-browser";
export declare class AuthModule {
    private readonly scopes;
    private _publicClientApplication;
    constructor();
    registerPostLoginListener(): Promise<any | null>;
    signIn(state: string): Promise<any>;
    signOut(): Promise<void | undefined>;
    private signInWithMsal;
    private getLoginResult;
    getAccessTokenSilent(): Promise<AuthenticationResult>;
    private getAccessToken;
    protected getAccount(): AccountInfo | undefined;
}
