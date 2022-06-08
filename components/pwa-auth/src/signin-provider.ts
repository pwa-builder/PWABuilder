import { SignInResult } from "./signin-result";

export interface SignInProvider {
    /** 
     * Kicks off the OAuth sign-in flow.
     */
    signIn(): Promise<SignInResult>;

    /** 
     * Loads any 3rd party dependencies used by the provider. For example, the Facebook provider may load the Facebook SDK if it's not already loaded.
     */
    loadDependencies(): Promise<void>;
}